import {ILogin} from "../ILogin.js"
declare global {
  namespace Express {
    interface Request {
      login?: ILogin
    }
  }
}