import { body, checkExact, matchedData, validationResult } from "express-validator";
import { isLatLon, validateCompareDates, validateId } from "./generic_middlewares.js";
import { NextFunction, Request, Response } from "express";
import { start } from "repl";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest.js";

const validateRoute = body('route')
.exists()
.notEmpty()
.isArray({min: 2, max:2})
.custom((value: number[][]) => {
    const notLatLonElements = value.filter(item => !isLatLon(item[0], item[1]));
    return value[0][0] < value[1][0] && value[0][1] < value[1][1] && notLatLonElements.length === 0;
})

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

export const finalizeNoNavZoneDelete = (req: Request, res: Response, next: NextFunction) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
        console.log(errors.array());
        next(new AppLogicError(AppErrorName.NONAVPLAN_DEL_REQ_INVALID))
    }
    if(typeof(req.params.id) === "number")
    {
        req.noNavZone = {} as NoNavZone;
        req.noNavZone.id = req.params.id;
    }
    next();
}

export const noNavZoneCreationValidation = checkExact([validateDateCreateUpdate('validityStart'), validateDateCreateUpdate('validityEnd'), validateDateCouple, validateRoute])

export const noNavZoneUpdateValidation = checkExact([validateId, validateDateCreateUpdate('validityStart'), validateDateCreateUpdate('validityEnd'), validateDateCouple])

export const noNavZoneDeleteValidation = checkExact([validateId])