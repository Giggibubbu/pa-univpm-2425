import { body, checkExact, matchedData, validationResult } from "express-validator";
import { validateCompareDates, validateDate } from "./generic_middlewares.js";
import { NextFunction, Request, Response } from "express";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";

const validateRoute = body('route')
.exists()
.notEmpty()
.isArray({min: 2, max:2})
.custom((value: number[][]) => {
    return value[0][0] < value[1][0] && value[0][1] < value[1][1];
})

export const finalizeNoNavZoneCreation = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)

    const data = matchedData(req);

    let isValidDates: boolean = true

    if(data.validityStart && data.validityEnd)
    {
        isValidDates = validateCompareDates(data.validityStart as Date, data.validityEnd as Date)
    }

    if(!errors.isEmpty() || !isValidDates)
    {
        next(new AppLogicError(AppErrorName.INVALID_NONAVPLAN_CREATE_REQ));
    }

    console.log(errors)

    req.noNavZone = {
        validityStart: data.validityStart as Date,
        validityEnd: data.validityEnd as Date,
        route: data.route as number[][]
    }

    next()


}

export const noNavZoneCreationValidation = checkExact([validateDate('validityStart').optional(), validateDate('validityEnd').optional(), validateRoute])