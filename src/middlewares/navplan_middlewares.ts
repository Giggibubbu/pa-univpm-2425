import { NextFunction, Request, Response } from "express";
import { body, checkExact, FieldValidationError, matchedData, query, validationResult } from "express-validator";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest.js";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus.js";
import { AuthRoles } from "../enum/AuthRoles.js";
import { equals, isLatLon, validateCompareDates, validateDate, validateId } from "./generic_middlewares.js";

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
.toLowerCase()
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
        console.log(req.jwt?.role)
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

const validateMotivation = body('motivation')
.optional()
.exists()
.notEmpty()
.isString()
.isLength({min: 4, max: 255})
.toUpperCase()


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

    console.log(errors)

    console.log(data)
}


export const navPlanUpdReqValidator = checkExact([validateId, validateStatusUpdate, validateMotivation])

export const navPlanDelReqValidator = checkExact([validateId])

export const navPlanReqCreationValidator = checkExact([validateDate('dateStart'), validateDate('dateEnd'), validateDroneId, validateRoute])

export const navPlanViewReqValidator = checkExact([validateDateQueryString('dateFrom'), validateDateQueryString('dateTo'), validateStatusQuery, validateFormatQuery, validateCompareDatesQuery])
