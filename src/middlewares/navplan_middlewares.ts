import { NextFunction, Request, Response } from "express";
import { body, checkExact, validationResult } from "express-validator";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";

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
    return value > req.body.dateStart
}).withMessage("Il campo data non contiene una data maggiore rispetto al campo dateStart.")

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

const transformToPointArray = (value:string): Array<Point> => {
    let array: Array<Point> = []
    value = JSON.parse(value)
    for(const item of value)
    {
        if(typeof(item[0]) !== 'number' || typeof(item[1]) !== 'number' || item.length < 2)
        {
            return []
        }
        else {
            array.push({lat: item[0], lon: item[1]})
        }
    }
    return array;
}

const notEqual = (a: Point, b: Point) => {
    return JSON.stringify(a) !== JSON.stringify(b)
}

const validateRoute = body('route')
.exists()
.notEmpty()
.isString()
.replace(" ", "")
.custom((value) => {
    const array = transformToPointArray(value);
    const zeroLengthSeg = array.filter((item, index, array) => !notEqual(array[index], array[index+1]) && index < array.length-1)
    return array.length > 2 && notEqual(array[0], array[array.length-1]) && zeroLengthSeg.length === 0;
})

export const finalizeNavPlanValidation = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
        console.log(errors)
        next(new AppLogicError(AppErrorName.NAVPLAN_REQ_INVALID))
    }
    req.body.navPlan = {
        dateStart: req.body.dateStart,
        dateEnd: req.body.dateEnd,
        droneId: req.body.droneId,
        route: req.body.route
    }
    console.log(req.body.navPlan)
    next();
}

export const navPlanValidator = checkExact([validateDateStart, validateDateEnd, validateCompareDates, validateDroneId, validateRoute])