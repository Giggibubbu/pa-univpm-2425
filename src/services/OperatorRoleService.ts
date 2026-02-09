import { NavPlanDAO } from "../dao/NavPlanDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";
import { AppErrorName } from "../enum/AppErrorName.js";
import { AppLogicError } from "../errors/AppLogicError.js";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest";
import { ViewNavPlanQS } from "../interfaces/http-requests/ViewNavPlanQS";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest";

export class OperatorRoleService
{
    
    private navPlanDao: NavPlanDAO;
    private noNavZoneDao: NoNavZoneDAO;
    constructor(navPlanDao: NavPlanDAO, noNavZoneDao: NoNavZoneDAO)
    {
        this.navPlanDao = navPlanDao;
        this.noNavZoneDao = noNavZoneDao;
    }

    viewNavPlan = async (query: ViewNavPlanQS): Promise<NavPlan[]> => {
        const navPlans: NavigationRequestAttributes[] = await this.navPlanDao.readAll(undefined, query);
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
    
}