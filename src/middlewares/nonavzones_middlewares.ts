import { body, checkExact, matchedData, validationResult } from "express-validator";
import { validateCompareDates, validateId } from "./generic_middlewares";
import { NextFunction, Request, Response } from "express";
import { AppLogicError } from "../errors/AppLogicError";
import { AppErrorName } from "../enum/AppErrorName";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest";
import { isLatLon } from "../utils/geo_utils";

/**
 * Modulo middleware per la validazione delle zone proibite.
 * Gestisce la logica di validazione/sanificazione dei dati inviati tramite query string, params e body HTTP.
 */

/**
 * Valida la bounding box.
 * Verifica che l'input sia una coppia di coordinate lon/lat valide e che il primo punto 
 * sia geograficamente inferiore al secondo per garantire la coerenza dell'area.
 * * @param value - Matrice di numeri rappresentante le coordinate [lon, lat].
 * @returns True se la rotta rispetta i criteri, altrimenti lancia un errore di validazione
 * (quando viene chiamato il validationResult)
 */

const validateBBox = body('route')
.exists()
.notEmpty()
.isArray({min: 2, max:2})
.custom((value: number[][]) => {
    const notLatLonElements = value.filter(item => !isLatLon(item[0], item[1]));
    return value[0][0] < value[1][0] && value[0][1] < value[1][1] && notLatLonElements.length === 0;
})

/**
 * Genera regole di validazione per le date di validità della zona proibita.
 * Applica controlli di formato ISO8601, sanificazione degli spazi e verifica 
 * che la data inserita non sia antecedente al momento attuale.
 * * @param date - Stringa contenente il nome del campo (es. 'validityStart').
 * @returns Una catena di validazione per express-validator.
 */

const validateDateCreateUpdate = (date: string) => {
    return body(date)
    .exists().bail()
    .optional({values: 'null'})
    .isString()
    .withMessage("Il campo non è una stringa.").bail()
    .notEmpty()
    .withMessage("Il campo contiene una stringa vuota.").bail()
    .customSanitizer((value:string) => {
        return value.replace(/\s/g, '');
    })
    .isISO8601()
    .withMessage("Il campo non contiene una stringa avente formato ISO8601").bail()
    .toDate()
    .isAfter()
    .withMessage("Il campo data non contiene un valore successivo alla data odierna.").bail();
}

/**
 * Rende non possibile l'inserimento di soltanto il campo validityEnd o soltanto il validityStart,
 * sia se uno è nullo e l'altro no, sia se uno è undefined e l'altro no.
 * E' permesso che i due campi siano null ma presenti contemporaneamente nel body.
 * Qualora siano valorizzati con una data viene effettuata una chiamata a validateCompareDates.
 * Impedisce la creazione di zone con intervalli temporali impossibili (fine precedente all'inizio).
 * * @param value - Il valore del campo 'validityEnd'.
 * @param req - La richiesta Express contenente il body per il confronto.
 * @returns True se le date sono coerenti o entrambe nulle.
 */

const validateDateCouple = body('validityEnd').custom((value: string|null|undefined, {req}) => {
    if(req.body.validityStart === undefined || value === undefined)
    {
        return false;
    }
    else if(req.body.validityStart === null && value === null)
    {
        return true;
    }
    else if(req.body.validityStart === null || value === null)
    {
        return false;
    }
    else
    {
        const start = new Date(req.body.validityStart)
        const end = new Date(value)
        return validateCompareDates(start, end)
    }
})

/**
 * Processa e finalizza i dati per la creazione di una nuova zona proibita.
 * Estrae i campi validati e li incapsula nell'oggetto della richiesta per il controller.
 * * @param req - Richiesta Express.
 * @param res - Risposta Express.
 * @param next - Funzione di callback per il prossimo middleware.
 * @throws {AppLogicError} INVALID_NONAVPLAN_CREATE_REQ se i dati non superano la validazione.
 */
export const finalizeNoNavZoneCreation = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)

    const data = matchedData(req, { includeOptionals: true });

    if(errors.array().length === 0)
    {
        req.noNavZone = {
            id: data.id as number,
            validityStart: data.validityStart,
            validityEnd: data.validityEnd,
            route: data.route
        }
        next()
    }
    else
    {
        next(new AppLogicError(AppErrorName.INVALID_NONAVPLAN_CREATE_REQ));
    }
}

/**
 * Processa e finalizza i dati per l'aggiornamento di una zona esistente.
 * Prepara l'ID e i nuovi parametri temporali per l'operazione di update.
 * * @param req - Richiesta Express.
 * @param res - Risposta Express.
 * @param next - Funzione di callback per il prossimo middleware.
 * @throws {AppLogicError} INVALID_NONAVPLAN_UPDATE_REQ se la richiesta di aggiornamento non è valida.
 */

export const finalizeNoNavZoneUpdate = (req: Request, res: Response, next: NextFunction) => {

    const errors = validationResult(req)

    const data = matchedData(req, { includeOptionals: true });

    if(errors.array().length === 0)
    {
        req.noNavZone = {
            id: data.id as number,
            validityStart: data.validityStart,
            validityEnd: data.validityEnd
        }
        next()
    }
    else
    {
        next(new AppLogicError(AppErrorName.INVALID_NONAVPLAN_UPDATE_REQ));
    }
}

/**
 * Gestisce la fase finale della richiesta di cancellazione di una zona.
 * Verifica l'integrità dell'ID e prepara l'oggetto noNavZone per la rimozione.
 * * @param req - Richiesta Express.
 * @param res - Risposta Express.
 * @param next - Funzione di callback per il prossimo middleware.
 * @throws {AppLogicError} NONAVPLAN_DEL_REQ_INVALID se l'ID fornito è mancante o errato.
 */

export const finalizeNoNavZoneDelete = (req: Request, res: Response, next: NextFunction) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {

        next(new AppLogicError(AppErrorName.NONAVPLAN_DEL_REQ_INVALID))
    }
    if(typeof(req.params.id) === "number")
    {
        req.noNavZone = {} as NoNavZone;
        req.noNavZone.id = req.params.id;
    }
    next();
}

/**
 * Catena di validazione per la creazione di zone proibite.
 */

export const noNavZoneCreationValidation = checkExact([validateDateCreateUpdate('validityStart'), validateDateCreateUpdate('validityEnd'), validateDateCouple, validateBBox])

/**
 * Catena di validazione per l'aggiornamento di zone proibite.
 */

export const noNavZoneUpdateValidation = checkExact([validateId, validateDateCreateUpdate('validityStart'), validateDateCreateUpdate('validityEnd'), validateDateCouple])

/**
 * Catena di validazione per la rimozione di zone proibite.
 */
export const noNavZoneDeleteValidation = checkExact([validateId])