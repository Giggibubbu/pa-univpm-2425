import * as turf from "@turf/turf";
import { NavPlanDAO } from "../dao/NavPlanDAO.js";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO.js";
import { UserDAO } from "../dao/UserDAO.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { AppLogicError } from "../errors/AppLogicError.js";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest.js";
import { UserJwt } from "../interfaces/jwt/UserJwt.js";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest.js";
import { NoNavigationZoneAttributes } from "../models/sequelize-auto/NoNavigationZone.js";
import { UserAttributes } from "../models/sequelize-auto/User.js";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus.js";
import { DateCompareConst } from "../enum/DateCompareConst.js";
import { TokenPayment } from "../enum/TokenPayment.js";
import { UserTokenInterface } from "../interfaces/UserTokenInterface.js";
import { LineString } from "geojson";

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
        let userUpdated: UserAttributes|null|undefined = await this.userDao.read(user.email);
        
        if(userUpdated !== undefined && userUpdated !== null)
        {
            if(userUpdated.tokens < 7)
            {
                throw new AppLogicError(AppErrorName.INSUFFICIENT_TOKENS);
            }
            else
            {
                userUpdated.tokens = userUpdated.tokens - cost;
                userUpdated = await this.userDao.update(userUpdated);
                if(userUpdated !== undefined && userUpdated !== null)
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

    private checkInNoNavZone = async (navPlan: NavPlan):Promise<Boolean> =>
    {
        const noNavZones = await this.noNavZoneDao.readAll();
        let validNoNavZonesByDate: Array<NoNavigationZoneAttributes> = []
        if(noNavZones.length > 0)
        {
            for(const noNavZone of noNavZones)
            {
                if((noNavZone.validityEnd === null && noNavZone.validityStart === null)
                    || (noNavZone.validityStart! <= navPlan.dateEnd && noNavZone.validityEnd! >= navPlan.dateStart))
                {
                    validNoNavZonesByDate.push(noNavZone);
                }
            }

            if(validNoNavZonesByDate.length === 0)
            {
                return false;
            }
            else
            {
                let nPointsInPolygon: number;
                const lineString: LineString = {type: "LineString", coordinates: navPlan.route};
                const navPlanPoints = turf.explode(lineString);
                for(const item of validNoNavZonesByDate)
                {
                    nPointsInPolygon = turf.pointsWithinPolygon(navPlanPoints, item.route).features.length;  
                    return nPointsInPolygon === 0? false : true;
                }
            }
        }
        return false;
    }

    private checkReqDateStart = (navPlan: NavPlan):Boolean =>
    {
        let isReqDateValid: Boolean;
        if(navPlan !== undefined && navPlan.dateStart !== undefined && navPlan.submittedAt !== undefined)
        {
            isReqDateValid = navPlan.dateStart.getTime() - navPlan.submittedAt.getTime() > DateCompareConst.TIME_DIFF_48H_TO_MS
        }
        else
        {
            throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
        }
        return isReqDateValid;
    }

    private checkUserNavPlanConflict = async (user: UserAttributes, navPlan: NavPlan): Promise<Boolean> =>
    {
        const navPlans = await this.navPlanDao.readAll();
        const navZoneBySameUser = []
        if(navPlans.length > 0)
        {
            for(const item of navPlans)
            {
                if(item.userId === user.id)
                {
                    navZoneBySameUser.push(item);
                }
            }
        }

        for(const item of navZoneBySameUser)
        {
            if(navPlan.dateStart <= item.dateEnd && navPlan.dateEnd >= item.dateStart
                && (item.status === NavPlanReqStatus.APPROVED || item.status === NavPlanReqStatus.PENDING))
            {
                return true;
            }
        }
        return false;
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
        let navPlanReqToCreate: NavigationRequestAttributes;
        let navPlanToReturn: NavigationRequestAttributes;

        const userDecreasedTokens: UserAttributes = await this.checkAndDecreaseToken(user, TokenPayment.REQ_TOTAL_COST);

        Object.keys(navPlan).forEach(key => {
            if(navPlan[key as keyof NavPlan] === undefined)
            {
                this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
                throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
            }
        });

        const isReqDateValid = this.checkReqDateStart(navPlan);
        if(!isReqDateValid)
        {
            this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.INVALID_NAVPLAN_DATE);
        }

        const isInNoNavZone = await this.checkInNoNavZone(navPlan);
        if(isInNoNavZone)
        {
            this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.FORBIDDEN_AREA_ERROR);
        }
        
        const isNavPlanInConflict = await this.checkUserNavPlanConflict(userDecreasedTokens, navPlan);
        if(isNavPlanInConflict)
        {
            this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.NAVPLAN_CONFLICT);
        }

        const lineString: LineString = {
            type: "LineString",
            coordinates: navPlan.route
        }

        navPlanReqToCreate = {
            userId: userDecreasedTokens.id,
            status: NavPlanReqStatus.PENDING,
            submittedAt: navPlan.submittedAt!,
            dateStart: navPlan.dateStart!,
            dateEnd: navPlan.dateEnd!,
            navigationPlan: lineString,
            droneId: navPlan.droneId
        }

        navPlanToReturn = await this.navPlanDao.create(navPlanReqToCreate)

        return [{
                id: navPlanToReturn.id!,
                dateStart: navPlanToReturn.dateStart,
                dateEnd: navPlanToReturn.dateEnd,
                droneId: navPlanToReturn.droneId,
                route: (navPlanToReturn.navigationPlan as LineString).coordinates,
                submittedAt: navPlanToReturn.submittedAt
            },
            {
                email: userDecreasedTokens.email,
                tokens: userDecreasedTokens.tokens
            }
        ];
        
    }
    
}