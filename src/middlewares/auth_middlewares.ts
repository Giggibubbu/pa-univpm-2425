import { NextFunction, Request, Response } from "express";
import { body, checkExact, ContextRunner, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import { Middleware } from "express-validator/lib/base";
import { AppErrorName } from "../enum/AppErrorName.js";
import { AppLogicError } from "../messages/errors/AppLogicError.js";

const validateAndSanitizeEmail: ValidationChain = body('email')
.notEmpty()
.exists()
.trim()
.isEmail()
.toLowerCase();

const validateAndSanitizePassword: ValidationChain = body('password')
.notEmpty()
.exists();


export const finalizeLoginValidation = (req:Request, res:Response, next:NextFunction) => {
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) 
        {
            next(new AppLogicError(AppErrorName.LOGIN_INVALID))
        }
    req.login = {email: req.body.email, password: req.body.password};
    next();
}

export const loginValidationRules: Middleware & ContextRunner = checkExact([validateAndSanitizeEmail, validateAndSanitizePassword])
