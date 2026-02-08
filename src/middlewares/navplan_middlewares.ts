import { NextFunction, Request, Response } from "express";
import { body, checkExact, param, validationResult } from "express-validator";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { DateCompareConst } from "../enum/DateCompareConst.js";
import { verify } from "crypto";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest.js";


const validateDate = (date: string) => {
    return body(date)
    .exists()
    .withMessage("Il campo non contiene alcun valore.").bail()
    .isString()
    .withMessage("Il campo non è una stringa.").bail()
    .notEmpty()
    .withMessage("Il campo contiene una stringa vuota.").bail()
    .customSanitizer(value => {
        return value.replace(/\s/g, '');
    })
    .isISO8601()
    .withMessage("Il campo non contiene una stringa avente formato ISO8601").bail()
    .toDate()
    .isAfter()
    .withMessage("Il campo data non contiene un valore successivo alla data odierna.").bail();
}

const validateCompareDates = (start: Date, end: Date) => {
    return end.getTime() - start.getTime() > DateCompareConst.TIME_DIFF_30M_TO_MS;
}

const validateDroneId = body('droneId')
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.isString()
.withMessage("Il campo non è una stringa.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.customSanitizer(value => {
    return value.replace(/\s/g, '');
})
.isAlphanumeric()
.withMessage("Il campo non contiene una stringa alfanumerica.").bail()
.isLength({min: 10, max: 10})
.withMessage("Il campo contiene una stringa di lunghezza non uguale a 10 caratteri.").bail()
.toUpperCase()

const toNumberArray = (value: any) => {
    let array: Array<Array<number>> = []
    for(const item of value)
    {
        if(item.length === 2 && typeof(item[0]) === 'number' && typeof(item[1]) === 'number')
        {
            array.push([item[0], item[1]])
        }
    }
    return array;
}

const equals = (a: Array<number>, b: Array<number>): Boolean => {
    return JSON.stringify(a) === JSON.stringify(b)
}

const isLatLon = (a: number, b: number): Boolean => {
    return (a >= -180 && a <= 180) && (b >= -90 && b <= 90);
}

const validateRoute = body('route')
.exists()
.notEmpty()
.isArray({min: 3})
.custom((value) => {
    const array = toNumberArray(value);
    const zeroLengthSeg = array.filter((item, index, array) => equals(array[index], array[index+1]) && index < array.length-1)
    const notLatLonElements = array.filter(item => !isLatLon(item[0], item[1]));
    return equals(array[0], array[array.length-1]) && zeroLengthSeg.length === 0 && notLatLonElements.length === 0;
})



export const finalizeNavPlanCreateReq = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
        console.log(errors.array());
        next(new AppLogicError(AppErrorName.NAVPLAN_REQ_INVALID))
    }
    
    const isValidDates = validateCompareDates(req.body.dateStart, req.body.dateEnd);
    if(!isValidDates)
    {
        next(new AppLogicError(AppErrorName.NAVPLAN_REQ_INVALID));
    }

    req.navPlan = {
        dateStart: req.body.dateStart,
        dateEnd: req.body.dateEnd,
        droneId: req.body.droneId,
        route: req.body.route,
        submittedAt: new Date(Date.now())
    }
    next();

}

const validateId = param('id')
.isInt({gt: 0}).bail()
.withMessage("Il campo non contiene un numero intero positivo.").bail()
.toInt()

export const finalizeDelNavPlanReq = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
        console.log(errors.array());
        next(new AppLogicError(AppErrorName.NAVPLAN_DEL_REQ_INVALID))
    }

    if(typeof(req.params.id) === "number")
    {
        req.navPlan = {} as NavPlan;
        req.navPlan.id = req.params.id;
        console.log(req.navPlan)
    }
    
    next();
}

export const navPlanDelReqValidator = checkExact([validateId])

export const navPlanReqCreationValidator = checkExact([validateDate('dateStart'), validateDate('dateEnd'), validateDroneId, validateRoute])
