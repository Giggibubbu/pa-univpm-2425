import { NextFunction, Request, Response,  } from "express";
import { HTTPErrorFactory } from "../factories/HTTPErrorFactory";
import { AppErrorName } from "../enum/AppErrorName";
import { AppLogicError } from "../utils/errors/AppLogicError";
import { HTTPError } from "../utils/errors/HTTPError";

export const logError = (err: Error | AppLogicError | HTTPError, req:Request, res:Response, next:NextFunction):void=>{
  const logDate:string = new Date().toLocaleString('it-IT');
  switch(true)
  {
    case err instanceof AppLogicError:
      console.log(`${logDate} Errore generico nella logica applicativa: ${err}`)
      break;
    case err instanceof HTTPError:
      console.log(`${logDate} Errore generico nella logica applicativa: ${err}`)
      break;
    case err instanceof Error:
      console.log(`${logDate} Errore sconosciuto del server: ${err}`)
      break;
  }
  next(err);
}

export const errorHandler = async (err: Error | HTTPError | AppLogicError, req:Request, res:Response) => {
  let httpError;
  switch(true)
  {
    case err instanceof HTTPError:
      res.status(err.statusCode).json(err.toJSON());
      break;
    case err instanceof AppLogicError && err.name === AppErrorName.LOGIN_NOT_AVAILABLE:
      httpError = HTTPErrorFactory.getError(err.name);
      res.status(httpError.statusCode).json(httpError);
    case err instanceof AppLogicError:
      httpError = HTTPErrorFactory.getError(err.name);
      res.status(httpError.statusCode).json(httpError.toJSON());
      break;
    case err instanceof Error:
      httpError = HTTPErrorFactory.getError(AppErrorName.INTERNAL_SERVER_ERROR);
      res.status(httpError.statusCode).json(httpError.toJSON());
      break;
  }
}

export const catchAllRoutes = (req:Request, res:Response, next:NextFunction) => {
  next(HTTPErrorFactory.getError(AppErrorName.ROUTE_NOT_FOUND));
}

