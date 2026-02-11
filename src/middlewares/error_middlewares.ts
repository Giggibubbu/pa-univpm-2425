import { NextFunction, Request, Response} from "express";
import { errorFactory } from "../factories/HTTPErrorFactory";
import { AppErrorName } from "../enum/AppErrorName";
import { AppLogicError } from "../errors/AppLogicError";
import { HTTPError } from "../errors/HTTPError";

/**
 * Modulo di middlewares per la gestione centralizzata degli errori e logging.
 */

/**
 * Middleware per la gestione del logging degli errori su console.
 * * @param err - L'oggetto errore catturato (può essere logico, HTTP o generico).
 * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */

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

/**
 * Middleware per la gestione centralizzata degli errori.
 * Trasforma gli errori applicativi in errori HTTP tramite factory e invia 
 * lo stato e il payload JSON appropriati.
 * * @param err - L'oggetto errore catturato.
 * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */

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

/**
 * Middleware per la gestione degli errori in caso di request su rotte non definite.
 * Viene invocato quando nessuna rotta precedente ha soddisfatto la richiesta,
 * generando un errore di tipo ROUTE_NOT_FOUND.
 * * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */

export const catchAllRoutes = (req:Request, res:Response, next:NextFunction) => {
  next(errorFactory(AppErrorName.ROUTE_NOT_FOUND));
}

