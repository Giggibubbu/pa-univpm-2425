import { NextFunction, Request, Response } from "express";
import { body, checkExact, ContextRunner, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import { Middleware } from "express-validator/lib/base";
import { AppLogicError } from "../utils/errors/AppLogicError";
import { AppErrorName } from "../enum/AppErrorName";

const validateAndSanitizeEmail: ValidationChain = body('email')
.notEmpty()
.trim()
.isEmail()
.toLowerCase();

const validateAndSanitizePassword: ValidationChain = body('password')
.notEmpty()
.isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    returnScore: false
});


export const finalizeLoginValidation = async (req:Request, res:Response, next:NextFunction) => {
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) 
        {
            next(new AppLogicError(AppErrorName.LOGIN_INVALID))
        }
    next();
}

export const loginValidationRules: Middleware & ContextRunner = checkExact([validateAndSanitizeEmail, validateAndSanitizePassword])
