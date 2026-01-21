// src/@types/express/index.d.ts

import {ILogin} from "../ILogin"
declare global {
  namespace Express {
    interface Request {
      userlogin?: ILogin
    }
  }
}