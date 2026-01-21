import { NextFunction, Request, Response } from "express";
import { body, checkExact, ContextRunner, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import { HTTPError } from "../errors/http/HTTPError";
import { HTTPErrorFactory } from "../factories/HTTPErrorFactory";
import { Middleware } from "express-validator/lib/base";

const validateAndSanitizeEmail: ValidationChain = body('email')
.notEmpty()
.trim()
.isEmail()
.toLowerCase();

const validateAndSanitizeUsername: ValidationChain = body('username')
.notEmpty()
.trim()
.isString()
.isLength({min: 3});

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

export const loginValidationRules: Middleware & ContextRunner = checkExact([validateAndSanitizeUsername, validateAndSanitizePassword])

export const finalizeValidation = async (req:Request, res:Response, next:NextFunction) => {
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) 
        {
            if(errors.array().filter(item => item.type == "unknown_fields").length == 1)
                {
                    const httpError: HTTPError = HTTPErrorFactory.getError("MALFORMED_REQUEST_BODY");
                    next(httpError);
                }
            else if(errors.array().length > 1)
                {
                    const httpError: HTTPError = HTTPErrorFactory.getError("INVALID_CREDENTIALS");
                    next(httpError);
                }
            else
                {
                    const httpError: HTTPError = HTTPErrorFactory.getError("INTERNAL_SERVER_ERROR");                
                    next(httpError);
                }
        }
    next();
}