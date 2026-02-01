import { NavPlanDAO } from "../dao/NavPlanDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";
import { UserDAO } from "../dao/UserDAO";

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
    
}