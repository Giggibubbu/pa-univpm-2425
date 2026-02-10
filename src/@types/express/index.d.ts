import { Request, Response } from "express";
import { ILogin } from "../../interfaces/http-requests/ILogin";
import { UserJwt } from "../../interfaces/jwt/UserJwt";
import { NavPlan } from "../../interfaces/http-requests/NavPlanRequest";
import { ViewNavPlanQS } from "../../interfaces/http-requests/ViewNavPlanQS";
import { NoNavZone } from "../../interfaces/http-requests/NoNavZoneRequest";
import { AdminChargeToken } from "../../interfaces/http-requests/AdminChargeToken";
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