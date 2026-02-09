import { NextFunction, Request, Response } from "express";
import { body, checkExact, FieldValidationError, matchedData, param, query, validationResult } from "express-validator";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { DateCompareConst } from "../enum/DateCompareConst.js";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest.js";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus.js";
import { AuthRoles } from "../enum/AuthRoles.js";


const validateDate = (date: string) => {
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

const validateCompareDates = (start: Date, end: Date) => {
    const diff: DateCompareConst = end.getTime() - start.getTime() 
    return  diff > DateCompareConst.TIME_DIFF_30M_TO_MS;
}

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

const equals = (a: number[], b: number[]):boolean => {
    return JSON.stringify(a) === JSON.stringify(b)
}

const isLatLon = (a: number, b: number):boolean => {
    return (a >= -180 && a <= 180) && (b >= -90 && b <= 90);
}

const validateRoute = body('route')
.exists()
.notEmpty()
.isArray({min: 3})
.custom((value: number[][]) => {
    const zeroLengthSeg = value.filter((item, index, array) => equals(array[index], array[index+1]) && index < array.length-1)
    const notLatLonElements = value.filter(item => !isLatLon(item[0], item[1]));
    return equals(value[0], value[value.length-1]) && zeroLengthSeg.length === 0 && notLatLonElements.length === 0;
})

export const finalizeNavPlanCreateReq = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
        console.log(errors.array());
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

const validateDateQueryString = (name: string) => query(name)
.optional()
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.isDate({format: 'YYYY-MM-DD'}).bail()
.withMessage("Il campo non è una data con formato corretto.").bail()
.toDate()

const validateStatusQuery = query('status')
.optional()
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.isString()
.withMessage("Il campo non è una stringa.").bail()
.isIn([NavPlanReqStatus.APPROVED, NavPlanReqStatus.REJECTED, NavPlanReqStatus.PENDING, NavPlanReqStatus.CANCELLED])
.withMessage("Il campo non contiene uno status valido.").bail()

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


const validateCompareDatesQuery = query(["dateTo"]).custom((value: string, {req}) => {
    const dateFrom = new Date(req.query?.dateFrom as string);
    const dateTo = new Date(value);
    return dateTo.getTime() - dateFrom.getTime() >= 0 || !req.query?.dateFrom;
})

export const finalizeViewNavPlanReq = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req).formatWith(msg => msg as FieldValidationError)
    const data = matchedData(req)
    console.log(errors.array());

    if(req.jwt?.role === AuthRoles.USER)
    {
        if(errors.array().length > 0)
        {
            next(new AppLogicError(AppErrorName.NAVPLAN_VIEW_REQ_INVALID));
        }
    }
    else if(req.jwt?.role === AuthRoles.OPERATOR)
    {
        if(errors.array().length === 1 && errors.array()[0].path === "status")
        {
            next(new AppLogicError(AppErrorName.NAVPLAN_VIEW_REQ_INVALID));
        }
        else if(errors.array().length > 1)
        {
            next(new AppLogicError(AppErrorName.NAVPLAN_VIEW_REQ_INVALID));
        }
    }

    req.viewNavPlanQS = 
    {
        userId: undefined,
        dateFrom: data.dateFrom as Date,
        dateTo: data.dateTo as Date,
        status: data.status as NavPlanReqStatus,
        format: data.format as string
    }
    next();
}

export const navPlanDelReqValidator = checkExact([validateId])

export const navPlanReqCreationValidator = checkExact([validateDate('dateStart'), validateDate('dateEnd'), validateDroneId, validateRoute])

export const navPlanViewReqValidator = checkExact([validateDateQueryString('dateFrom'), validateDateQueryString('dateTo'), validateStatusQuery, validateFormatQuery, validateCompareDatesQuery])
