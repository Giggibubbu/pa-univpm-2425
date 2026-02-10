import * as turf from "@turf/turf";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { UserDAO } from "../dao/UserDAO.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { AppLogicError } from "../errors/AppLogicError.js";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest.js";
import { UserJwt } from "../interfaces/jwt/UserJwt.js";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest.js";
import { UserAttributes } from "../models/sequelize-auto/User.js";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus.js";
import { DateCompareConst } from "../enum/DateCompareConst.js";
import { TokenPayment } from "../enum/TokenPayment.js";
import { UserTokenInterface } from "../interfaces/UserTokenInterface.js";
import { LineString, Position } from "geojson";
import { ViewNavPlanQS } from "../interfaces/http-requests/ViewNavPlanQS.js";
import { NavPlanQueryFilter } from "../interfaces/dao/NavPlanQueryFilter.js";

/**
 * Service class for managing user roles functionality.
 * 
 * Handles business logic related to user functionalities (create navplans, delete navplans, get navplans with pending state).
 * 
 * Integrates with UserDAO, NavPlanDAO, and NoNavZoneDAO for data persistence.
 * 
 * @class UserRoleService
 */
export class UserRoleService
{
    private userDao: UserDAO;
    private navPlanDao: NavPlanDAO;
    private noNavZoneDao: NoNavZoneDAO;
    constructor(userDao: UserDAO, navPlanDao: NavPlanDAO, noNavZoneDao: NoNavZoneDAO)
    {
        this.userDao = userDao;
        this.navPlanDao = navPlanDao;
        this.noNavZoneDao = noNavZoneDao;
    }


    /**
     * Checks if a user has sufficient tokens and decreases their token balance by the specified cost.
     * @param user - The JWT user object containing user identification information
     * @param cost - The number of tokens to deduct from the user's balance
     * @returns A promise that resolves to the updated user attributes
     * @throws {AppLogicError} Throws INSUFFICIENT_TOKENS error if user has less than 7 tokens
     * @throws {AppLogicError} Throws INTERNAL_SERVER_ERROR if user is not found or update fails
     */
    private checkAndDecreaseToken = async (user:UserJwt, cost: TokenPayment):Promise<UserAttributes> =>
    {
        let userUpdated: UserAttributes|null= await this.userDao.read(user.email);
        
        if(userUpdated !== null)
        {
            if(userUpdated.tokens < 7)
            {
                throw new AppLogicError(AppErrorName.INSUFFICIENT_TOKENS);
            }
            else
            {
                userUpdated.tokens = userUpdated.tokens - cost;
                userUpdated = await this.userDao.update(userUpdated);
                if(userUpdated !== null)
                {
                    return userUpdated;
                }
                else
                {
                    throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
                }
            }
        }
        else
        {
            throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
        }
    }

    private checkInNoNavZone = async (navPlan: NavPlan):Promise<boolean> =>
    {
        const noNavZoneQueryFilters: NavigationRequestAttributes = {
            userId: 0,
            status: navPlan.status as NavPlanReqStatus,
            submittedAt: navPlan.submittedAt as Date,
            dateStart: navPlan.dateStart as Date,
            dateEnd: navPlan.dateEnd as Date,
            droneId: navPlan.droneId as string,
            navigationPlan: turf.lineString(navPlan.route? navPlan.route:[]).geometry
        }
        const noNavZones = await this.noNavZoneDao.readAll(noNavZoneQueryFilters);
        
        if(noNavZones)
        {
            if(noNavZones.length > 0 && navPlan.route)
            {
                let nPointsInPolygon: number;
                const lineString: LineString = {type: "LineString", coordinates:navPlan.route};
                const navPlanPoints = turf.explode(lineString);
                for(const item of noNavZones)
                {
                    if(item.route)
                    {
                        nPointsInPolygon = turf.pointsWithinPolygon(navPlanPoints, item.route).features.length;  
                        return nPointsInPolygon === 0? false : true;
                    }
                    
                }
            }
        }
        return false;
    }

    private checkReqDateStart = (navPlan: NavPlan):boolean =>
    {
        let isReqDateValid: boolean;
        
        if(navPlan.submittedAt && navPlan.dateStart)
        {
            const timeValue: DateCompareConst = navPlan.dateStart.getTime() - navPlan.submittedAt.getTime()
            isReqDateValid =  timeValue > DateCompareConst.TIME_DIFF_48H_TO_MS
        }
        else
        {
            throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
        }
        return isReqDateValid;
    }

    private checkUserNavPlanConflict = async (user: UserAttributes, navPlan: NavPlan): Promise<boolean> =>
    {
        const navPlanFilters: NavPlanQueryFilter = {
            userId: user.id,
            dateStart: navPlan.dateStart,
            dateEnd: navPlan.dateEnd,
            status: [NavPlanReqStatus.APPROVED, NavPlanReqStatus.PENDING]
        }
        const navPlans = await this.navPlanDao.readAll(navPlanFilters);

        
        return navPlans.length > 0;
    }

    private addToken = async (user: UserAttributes, tokens: TokenPayment): Promise<void> => 
    {
        user.tokens = user.tokens + tokens;
        const userDecreasedTokens = await this.userDao.update(user);
        if(userDecreasedTokens === null)
        {
            throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
        }
    }

    createNavPlan = async (user: UserJwt, navPlan: NavPlan): Promise<[NavPlan, UserTokenInterface]> => {
        

        const userDecreasedTokens: UserAttributes = await this.checkAndDecreaseToken(user, TokenPayment.REQ_TOTAL_COST);

        Object.keys(navPlan).forEach(key => {
            if(navPlan[key as keyof NavPlan] === undefined)
            {
                void this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
                throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
            }
        });

        const isReqDateValid = this.checkReqDateStart(navPlan);
        if(!isReqDateValid)
        {
            void this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.INVALID_NAVPLAN_DATE);
        }

        const isInNoNavZone = await this.checkInNoNavZone(navPlan);
        if(isInNoNavZone)
        {
            void this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.FORBIDDEN_AREA_ERROR);
        }
        
        const isNavPlanInConflict = await this.checkUserNavPlanConflict(userDecreasedTokens, navPlan);
        if(isNavPlanInConflict)
        {
            void this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.NAVPLAN_CONFLICT);
        }


        const lineString: LineString = {
            type: "LineString",
            coordinates: navPlan.route? navPlan.route:[]
        }

        const navPlanReqToCreate: NavigationRequestAttributes = {
            userId: userDecreasedTokens.id,
            status: NavPlanReqStatus.PENDING,
            motivation: undefined,
            submittedAt: navPlan.submittedAt as Date,
            dateStart: navPlan.dateStart as Date,
            dateEnd: navPlan.dateEnd as Date,
            navigationPlan: lineString,
            droneId: navPlan.droneId as string
        }

        const navPlanToReturn: NavigationRequestAttributes = await this.navPlanDao.create(navPlanReqToCreate)

        return [{
                id: navPlanToReturn.id,
                submittedAt: navPlanToReturn.submittedAt,
                status: navPlanToReturn.status,
                dateStart: navPlanToReturn.dateStart,
                dateEnd: navPlanToReturn.dateEnd,
                droneId: navPlanToReturn.droneId,
                route: navPlanToReturn.navigationPlan.coordinates,
            },
            {
                email: userDecreasedTokens.email,
                tokens: userDecreasedTokens.tokens
            }
        ];
        
    }

    deleteNavPlan = async (email: string, navPlanId: number): Promise<void> =>
    {
        const userDeletionReq = await this.userDao.read(email);
        const navPlanToDelete = await this.navPlanDao.read(navPlanId);

        if(userDeletionReq !== null && navPlanToDelete !== null)
        {
            if(navPlanToDelete.userId === userDeletionReq.id)
            {
                if(navPlanToDelete.status === NavPlanReqStatus.PENDING)
                {
                    navPlanToDelete.status = NavPlanReqStatus.CANCELLED;
                    await this.navPlanDao.update(navPlanToDelete);
                    return;
                }
                else
                {
                    throw new AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE);
                }
                
            }
            else
            {
                throw new AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE);
            }
            
        }
        else
        {
            throw new AppLogicError(AppErrorName.NAVPLAN_DEL_NOT_FOUND);
        }


    }

    viewNavPlan = async (email: string, query: ViewNavPlanQS):Promise<NavPlan[]> => {
        const user = await this.userDao.read(email);

        const queryFilters: NavPlanQueryFilter = query as NavPlanQueryFilter;
        queryFilters.userId = user?.id
        const navPlans = await this.navPlanDao.readAll(queryFilters);
        const navPlansToReturn: NavPlan[] = [];

        if(!navPlans.length)
        {
            throw new AppLogicError(AppErrorName.NAVPLAN_VIEW_NOT_FOUND);
        }


        for(const navPlan of navPlans)
        {
            navPlansToReturn.push({
                        id: navPlan.id,
                        submittedAt: navPlan.submittedAt,
                        status: navPlan.status,
                        motivation: navPlan.motivation,
                        dateStart: navPlan.dateStart,
                        dateEnd: navPlan.dateEnd,
                        droneId: navPlan.droneId,
                        route: navPlan.navigationPlan.coordinates
                    });
            }

        return navPlansToReturn;
        
        
        
    }
}