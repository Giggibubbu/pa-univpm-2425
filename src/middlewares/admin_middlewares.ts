import { body, checkExact, matchedData, validationResult } from "express-validator";
import { validateId } from "./generic_middlewares.js";
import { NextFunction, Request, Response } from "express";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";

const validateTokens = body("tokenToAdd")
.exists()
.notEmpty()
.isInt()
.toInt()

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

export const validateChargeUserToken = checkExact([validateId, validateTokens])