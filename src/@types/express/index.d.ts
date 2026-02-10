import { AdminChargeToken } from ;
import {ILogin} from 
import { NavPlan } from 
import { NoNavZone } from ;
import { ViewNavPlanQS } from 
import { UserJwt } from 
declare global {
  namespace Express {
    interface Request {
      login?: ILogin;
      jwt?: UserJwt;
      navPlan?: NavPlan;
      viewNavPlanQS?:ViewNavPlanQS;
      noNavZone?: NoNavZone
      userToken?: AdminChargeToken
    }
  }
}