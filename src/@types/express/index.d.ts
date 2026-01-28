import {ILogin} from "../../interfaces/http-requests/ILogin.js"
declare global {
  namespace Express {
    interface Request {
      login?: ILogin
    }
  }
}