import { NavPlanDAO } from "../dao/NavPlanDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";
import { UserDAO } from "../dao/UserDAO";
import { AppErrorName } from "../enum/AppErrorName.js";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus";
import { AppLogicError } from "../errors/AppLogicError.js";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest";
import { ViewNavPlanQS } from "../interfaces/http-requests/ViewNavPlanQS";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest";
import { NoNavigationZoneAttributes } from "../models/sequelize-auto/NoNavigationZone";
import { UserAttributes } from "../models/sequelize-auto/User";
import * as turf from "@turf/turf";

export class OperatorRoleService
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

    viewNavPlan = async (query: ViewNavPlanQS): Promise<NavPlan[]> => {

        console.log(query.status)
        const navPlans: NavigationRequestAttributes[] = await this.navPlanDao.readAll({status: [query.status as NavPlanReqStatus]});
        const navPlansToReturn: NavPlan[] = []

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

    createNoNavZone = async (email: string, noNavZone: NoNavZone):Promise<NoNavZone> =>
    {
        const user: UserAttributes|null = await this.userDao.read(email);

        const routeFlat: number[] = [noNavZone.route[0][0], noNavZone.route[0][1], noNavZone.route[1][0], noNavZone.route[1][1]]
        const routeBBoxPolygon = turf.bboxPolygon(routeFlat as [number, number, number, number]).geometry
        
        let navPlanToSearch: NoNavigationZoneAttributes;

        if(user?.id)
        {
            navPlanToSearch = {
                id: 0,
                operatorId: user?.id,
                route: routeBBoxPolygon,
                validityStart: noNavZone.validityStart,
                validityEnd: noNavZone.validityEnd
            }

            const navPlansConflicts: NoNavigationZoneAttributes[]|undefined = await this.noNavZoneDao.readAll(navPlanToSearch);
            
            if(navPlansConflicts && navPlansConflicts.length > 0)
            {
                throw new AppLogicError(AppErrorName.NONAVZONE_CONFLICT);
            }
            
            const noNavZoneToCreate: NoNavigationZoneAttributes = 
            {
                operatorId: user.id,
                route: routeBBoxPolygon,
                validityStart: noNavZone.validityStart,
                validityEnd: noNavZone.validityEnd
            }

            const noNavZoneCreated: NoNavigationZoneAttributes = await this.noNavZoneDao.create(noNavZoneToCreate);

            const bbox = turf.bbox(noNavZoneCreated.route);
            const pointBBoxArray:number[][] = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];

            return {
                id: noNavZoneCreated.id,
                operatorId: noNavZoneCreated.operatorId,
                validityStart: noNavZoneCreated.validityStart,
                validityEnd: noNavZoneCreated.validityEnd,
                route: pointBBoxArray
            }

        }
        return noNavZone;

    }
    
}