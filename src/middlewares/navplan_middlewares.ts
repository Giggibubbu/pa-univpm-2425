import { NextFunction, Request, Response } from "express";
import { body, checkExact, FieldValidationError, matchedData, query, validationResult } from "express-validator";
import { AppLogicError } from "../errors/AppLogicError";
import { AppErrorName } from "../enum/AppErrorName";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus";
import { AuthRoles } from "../enum/AuthRoles";
import { equals, isLatLon } from "../utils/geo_utils";
import { validateId } from "./generic_middlewares";
import { validateCompareDates } from "./generic_middlewares";

/**
 * Modulo middleware per la validazione e finalizzazione delle richieste/piani di navigazione.
 * Gestisce la logica di validazione per la creazione, visualizzazione, 
 * aggiornamento e cancellazione dei piani.
 */

/**
 * Valida una stringa che rappresenta una data nel corpo della richiesta.
 * Verifica l'esistenza, il formato ISO8601 e che la data sia successiva a quella odierna.
 * * @param date - Nome del campo nel body da validare.
 * @returns {ValidationChain}
 */
export const validateDateNavPlan = (date: string) => {
    return body(date)
    .exists()
    .withMessage("Il campo non contiene alcun valore.").bail()
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
 * Validatore per l'identificativo del drone.
 * Richiede che esso sia una stringa alfanumerica di 10 caratteri.
 */

const validateDroneId = body('droneId')
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.isString()
.withMessage("Il campo non è una stringa.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.customSanitizer((value:string) => {
    return value.replace(/\s/g, '');
})
.isAlphanumeric()
.withMessage("Il campo non contiene una stringa alfanumerica.").bail()
.isLength({min: 10, max: 10})
.withMessage("Il campo contiene una stringa di lunghezza non uguale a 10 caratteri.").bail()
.toUpperCase()

/**
 * Validatore interno per la rotta della richiesta/piano di navigazione.
 * Verifica che:
 * 1. Siano presenti almeno 3 punti.
 * 2. Non ci siano punti consecutivi uguali.
 * 3. Tutte le coordinate siano valide lon/lat.
 * 4. Punto di partenza uguale a punto di fine.
 */

const validateRoute = body('route')
.exists()
.notEmpty()
.isArray({min: 3})
.custom((value: number[][]) => {
    const zeroLengthSeg = value.filter((item, index, array) => equals(array[index], array[index+1]) && index < array.length-1)
    const notLatLonElements = value.filter(item => !isLatLon(item[0], item[1]));
    return equals(value[0], value[value.length-1]) && zeroLengthSeg.length === 0 && notLatLonElements.length === 0;
})

/**
 * Middleware di finalizzazione della validazione della richiesta per la creazione di un
 * piano di navigazione.
 * Raccoglie i dati validati, controlla la coerenza temporale tra inizio e fine
 * e li inserisce nell'oggetto navPlan presente nella richiesta.
 * * @param req - Richiesta Express.
 * @param res - Risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */

export const finalizeNavPlanCreateReq = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {

        next(new AppLogicError(AppErrorName.NAVPLAN_REQ_INVALID))
    }

    const data = matchedData(req);
    
    const isValidDates = validateCompareDates(data.dateStart as Date, data.dateEnd as Date);
    if(!isValidDates)
    {
        next(new AppLogicError(AppErrorName.NAVPLAN_REQ_INVALID));
    }

    req.navPlan = {
        dateStart: data.dateStart as Date,
        dateEnd: data.dateEnd as Date,
        droneId: data.droneId as string,
        route: data.route as number[][],
        submittedAt: new Date(Date.now())
    }
    next();

}

/**
 * Middleware di finalizzazione della validazione della richiesta 
 * per la cancellazione di un piano di navigazione.
 * * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */

export const finalizeDelNavPlanReq = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {

        next(new AppLogicError(AppErrorName.NAVPLAN_DEL_REQ_INVALID))
    }

    if(typeof(req.params.id) === "number")
    {
        req.navPlan = {} as NavPlan;
        req.navPlan.id = req.params.id;

    }
    
    next();
}


/**
 * Valida una data passata come query parameter.
 * * @param name - Nome del parametro nella query string.
 */

const validateDateQueryString = (name: string) => query(name)
.optional()
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.isDate({format: 'YYYY-MM-DD'}).bail()
.withMessage("Il campo non è una data con formato corretto.").bail()
.toDate()


/**
 * Validatore dello stato del piano passato come query parameter.
 */
const validateStatusQuery = query('status')
.optional()
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.isString()
.withMessage("Il campo non è una stringa.").bail()
.toLowerCase()
.isIn([NavPlanReqStatus.APPROVED, NavPlanReqStatus.REJECTED, NavPlanReqStatus.PENDING, NavPlanReqStatus.CANCELLED])
.withMessage("Il campo non contiene uno status valido.").bail()

/**
 * Validatore per il formato di output richiesto via query string.
 */

const validateFormatQuery = query('format').optional()
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.isString()
.withMessage("Il campo non è una stringa.").bail()
.isLength({min: 3, max: 4})
.withMessage("Il campo contiene una stringa di lunghezza non uguale a 3 caratteri.").bail()
.toLowerCase()
.isIn(["xml", "json"]).withMessage("Il campo non contiene un formato di output valido.").bail()

/**
 * Validatore custom per il confronto delle date fornite via query string.
 */

const validateCompareDatesQuery = query(["dateTo"]).custom((value: string, {req}) => {
    if(req.query?.dateTo === undefined || req.query.dateFrom === undefined)
    {
        return true
    }
    else
    {
        const dateFrom = new Date(req.query?.dateFrom as string);
        const dateTo = new Date(value);
        return dateTo.getTime() - dateFrom.getTime() >= 0;
    }
    
})


/**
 * Middleware di finalizzazione per la richiesta di visualizzazione dei piani di navigazione.
 * * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */

export const finalizeViewNavPlanReq = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req).formatWith(msg => msg as FieldValidationError)
    const data = matchedData(req)


    if(req.jwt?.role === AuthRoles.USER)
    {
        if(errors.array().length > 0)
        {
            next(new AppLogicError(AppErrorName.NAVPLAN_VIEW_REQ_INVALID));
        }
    }
    else if(req.jwt?.role === AuthRoles.OPERATOR)
    {

        if(errors.array().length > 0)
        {
            next(new AppLogicError(AppErrorName.NAVPLAN_VIEW_REQ_INVALID));
        }
    }

    req.viewNavPlanQS = 
    {
        dateFrom: data.dateFrom as Date,
        dateTo: data.dateTo as Date,
        status: data.status as NavPlanReqStatus,
        format: data.format as string
    }
    next();
}

/**
 * Validatore per l'aggiornamento dello stato di un piano.
 * La motivazione diventa obbligatoria se lo stato è REJECTED, mentre è vietata per gli altri stati.
 */

const validateStatusUpdate = body('status')
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.isString()
.toLowerCase()
.withMessage("Il campo non è una stringa.").bail()
.isIn([NavPlanReqStatus.APPROVED, NavPlanReqStatus.REJECTED])
.withMessage("Il campo non contiene uno status valido.").bail()
.custom((value:string, {req}) => {
    if(!req.body.motivation && value === NavPlanReqStatus.REJECTED)
    {
        return false;
    }
    else if(req.body.motivation && value!==NavPlanReqStatus.REJECTED){
        return false;
    }
    return true;
})

/**
 * Validatore per la motivazione di rigetto del piano.
 */
const validateMotivation = body('motivation')
.optional()
.exists()
.notEmpty()
.isString()
.isLength({min: 4, max: 255})
.toUpperCase()

/**
 * Middleware di finalizzazione della validazione per l'approvazione/rigetto di un piano di navigazione.
 * * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */
export const finalizeNavPlanUpd = (req:Request, res:Response, next:NextFunction) =>{
    const errors = validationResult(req);


    const data = matchedData(req);

    if(errors.array().length > 0)
    {
        next(new AppLogicError(AppErrorName.INVALID_NAVPLAN_UPDATE_REQ))
    }
    else{
        req.navPlan = {
            motivation: data.motivation,
            id: data.id,
            status: data.status
        }
        next()
    }




}

// Composizione delle catene di validazione per le diverse rotte dei piani di navigazione.
export const navPlanUpdReqValidator = checkExact([validateId, validateStatusUpdate, validateMotivation])
export const navPlanDelReqValidator = checkExact([validateId])
export const navPlanReqCreationValidator = checkExact([validateDateNavPlan('dateStart'), validateDateNavPlan('dateEnd'), validateDroneId, validateRoute])
export const navPlanViewReqValidator = checkExact([validateDateQueryString('dateFrom'), validateDateQueryString('dateTo'), validateStatusQuery, validateFormatQuery, validateCompareDatesQuery])
