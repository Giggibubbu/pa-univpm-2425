import { NextFunction, Request, Response } from "express";
import { body, checkExact, validationResult } from "express-validator";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { DateCompareConst } from "../enum/DateCompareConst.js";

const validateDateStart = body('dateStart')
.trim()
.exists()
.withMessage("Il campo non contiene alcun valore.")
.notEmpty()
.withMessage("Il campo contiene una stringa vuota.")
.isISO8601()
.withMessage("Il campo non contiene una stringa avente formato ISO8601")
.isAfter()
.withMessage("Il campo data non contiene un valore successivo alla data odierna.")
.toDate()

const validateDateEnd = body('dateEnd')
.trim()
.exists()
.withMessage("Il campo non contiene alcun valore.")
.notEmpty()
.withMessage("Il campo contiene una stringa vuota.")
.isISO8601()
.withMessage("Il campo non contiene una stringa avente formato ISO8601")
.isAfter()
.withMessage("Il campo data non contiene un valore successivo alla data odierna.")
.toDate()

const validateCompareDates = body('dateEnd').custom((value, {req}) => {
    return value.getTime() - req.body.dateStart.getTime() > DateCompareConst.TIME_DIFF_30M_TO_MS;
}).withMessage("Il campo data non contiene una data maggiore di 30 minuti rispetto al campo dateStart.")

const validateDroneId = body('droneId')
.trim()
.exists()
.withMessage("Il campo non contiene alcun valore.")
.isString()
.withMessage("Il campo non è una stringa.")
.notEmpty()
.withMessage("Il campo è una stringa vuota.")
.isAlphanumeric()
.withMessage("Il campo non contiene una stringa alfanumerica.")
.isLength({min: 10, max: 10})
.withMessage("Il campo contiene una stringa di lunghezza non uguale a 10 caratteri.")
.toUpperCase()

const transformToPointArray = (value: any) => {
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
    return a >= -180 && a <= 180 && b >= -90 && b <= 90;
}

const validateRoute = body('route')
.exists()
.notEmpty()
.isArray({min: 3})
.custom((value) => {
    const array = transformToPointArray(value);
    const zeroLengthSeg = array.filter((item, index, array) => equals(array[index], array[index+1]) && index < array.length-1)
    let notLatLonElements = array.filter(item => !isLatLon(item[0], item[1]));
    return equals(array[0], array[array.length-1]) && zeroLengthSeg.length === 0 && notLatLonElements.length === 0;
})

export const verifyNavPlanReq = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
        console.log(errors)
        next(new AppLogicError(AppErrorName.NAVPLAN_REQ_INVALID))
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

export const navPlanValidator = checkExact([validateDateStart, validateDateEnd, validateCompareDates, validateDroneId, validateRoute])