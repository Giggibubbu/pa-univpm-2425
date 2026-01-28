import { NextFunction, Request, Response} from "express";
import { HTTPErrorFactory } from "../factories/HTTPErrorFactory.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { AppLogicError } from "../messages/errors/AppLogicError.js";
import { HTTPError } from "../messages/errors/HTTPError.js";

export const logError = (err: Error | AppLogicError | HTTPError, req:Request, res:Response, next:NextFunction):void=>{
  const logDate:string = new Date().toLocaleString("it-IT", {dateStyle: "short", timeStyle: "short", timeZone: "Europe/Rome"}).replace(',', '');
  
  switch(true)
  {
    case err instanceof AppLogicError:
      console.log(`[${logDate}] Errore generico nella logica applicativa: ${err}`)
      break;
    case err instanceof HTTPError:
      console.log(`[${logDate}] Errore generico nella logica applicativa: ${err}`)
      break;
    default:
      console.log(`[${logDate}] Errore sconosciuto del server: ${err}`)
      break;
  }
  next(err);
}

export const errorHandler = async (err: Error | AppLogicError | HTTPError, req:Request, res:Response, next:NextFunction) => {
  let httpError: HTTPError;
  switch(true)
  {
    case err instanceof HTTPError:
      res.status(err.statusCode).json(err);
      break;
    case err instanceof AppLogicError && err.name === AppErrorName.LOGIN_NOT_AVAILABLE:
      httpError = HTTPErrorFactory.getError(err.name);
      res.status(httpError.statusCode).json(httpError);
    case err instanceof AppLogicError:
      httpError = HTTPErrorFactory.getError(err.name);
      res.status(httpError.statusCode).json(httpError);
      break;
    default:
      httpError = HTTPErrorFactory.getError(AppErrorName.INTERNAL_SERVER_ERROR);
      res.status(httpError.statusCode).json(httpError);
      break;
  }
}

export const catchAllRoutes = (req:Request, res:Response, next:NextFunction) => {
  next(HTTPErrorFactory.getError(AppErrorName.ROUTE_NOT_FOUND));
}

