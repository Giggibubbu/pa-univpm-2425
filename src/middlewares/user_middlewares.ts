import { body, checkExact, matchedData, validationResult } from "express-validator";
import { validateId } from "./generic_middlewares";
import { NextFunction, Request, Response } from "express";
import { AppLogicError } from "../errors/AppLogicError";
import { AppErrorName } from "../enum/AppErrorName";

/**
 * Modulo middleware per la gestione delle risorse utente.
 * Gestisce la logica di validazione e la preparazione dei dati per le operazioni da effettuare
 * su risorse utente.
 */

/**
 * Validatore per la quantità di token da aggiungere.
 * Verifica che il campo esista, non sia vuoto e che contenga un valore intero.
 */

const validateTokens = body("tokenToAdd")
.exists()
.notEmpty()
.isInt({gt: 0})
.toInt()

/**
 * Middleware di finalizzazione della validazione per la richiesta di ricarica dei token di un utente.
 * Analizza i risultati della validazione e popola l'oggetto userToken nella richiesta
 * con l'ID utente e l'importo da aggiungere.
 * * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */

export const finalizeChargeUserToken = (req: Request, res: Response, next: NextFunction) =>
{
    const error = validationResult(req);

    const data = matchedData(req);

    if(error.array().length > 0)
    {
        next(new AppLogicError(AppErrorName.INVALID_TOKEN_CHARGE_REQ));
    }
    req.userToken = {
        userId: data.id,
        tokenToAdd: data.tokenToAdd
    }
    next()
}

/**
 * Catena di validazione per la rotta che consente la ricarica dei token utente.
 */

export const validateChargeUserToken = checkExact([validateId, validateTokens])