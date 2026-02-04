import {ILogin} from "../../interfaces/http-requests/ILogin.js"
import { NavPlan, NavPlanRequest } from "../../interfaces/http-requests/NavPlanRequest.js"
import { UserJwt } from "../../interfaces/jwt/UserJwt.js"
declare global {
  namespace Express {
    interface Request {
      login?: ILogin
      jwt?: UserJwt
      navPlan?: NavPlan
    }
  }
}