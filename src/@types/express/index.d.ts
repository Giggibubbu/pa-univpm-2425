import {ILogin} from "../../interfaces/http-requests/ILogin.js"
import { UserJwt } from "../../interfaces/jwt/UserJwt.js"
declare global {
  namespace Express {
    interface Request {
      login?: ILogin
      jwt?: UserJwt
    }
  }
}