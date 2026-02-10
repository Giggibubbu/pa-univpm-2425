import { NextFunction, Request, Response} from "express";
import { errorFactory } from "../factories/HTTPErrorFactory";
import { AppErrorName } from "../enum/AppErrorName";
import { AppLogicError } from "../errors/AppLogicError";
import { HTTPError } from "../errors/HTTPError";

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

export const errorHandler = (err: Error | AppLogicError | HTTPError, req:Request, res:Response, next:NextFunction) => {
  let httpError: HTTPError;
  switch(true)
  {
    case err instanceof AppLogicError:
      httpError = errorFactory(err.name as AppErrorName);
      res.status(httpError.statusCode).json(httpError);
      break;
    case err instanceof HTTPError:
      res.status(err.statusCode).json(err);
      break;
    default:
      httpError = errorFactory(AppErrorName.INTERNAL_SERVER_ERROR);
      res.status(httpError.statusCode).json(httpError);
      break;
  }
}

export const catchAllRoutes = (req:Request, res:Response, next:NextFunction) => {
  next(errorFactory(AppErrorName.ROUTE_NOT_FOUND));
}

