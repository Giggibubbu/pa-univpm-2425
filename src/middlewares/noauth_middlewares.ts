import { NextFunction, Request, Response } from "express";
import { body, checkExact, ContextRunner, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import { Middleware } from "express-validator/lib/base";
import { AppErrorName } from "../enum/AppErrorName.js";
import { AppLogicError } from "../errors/AppLogicError.js";
import jwt from "jsonwebtoken";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { readJwtKeys } from "../utils/jwt/jwt_utils.js";
import { nextTick } from "process";

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

const checkRole = (role: string) => (req:Request, res:Response, next:NextFunction) =>
{
    if(req.jwt?.role !== role)
    {
        next(new AppLogicError(AppErrorName.UNAUTHORIZED_JWT))
    }
    else next()
}

export const verifyJwt = async (req:Request, res:Response, next:NextFunction) =>
{
    const userAuthToken = req.headers.authorization?.split(" ");
    if(!userAuthToken)
    {
        next(new AppLogicError(AppErrorName.AUTH_TOKEN_NOTFOUND));
    }
    else
    {
        const pubKey = (await readJwtKeys()).pubKey;
        try
        {
            const decodedJwt= jwt.verify(userAuthToken[1], pubKey);
        }
        catch(e)
        {
            switch(true)
            {
                case e instanceof jwt.JsonWebTokenError:
                    next(new AppLogicError(AppErrorName.INVALID_JWT))
                    break;
                case e instanceof jwt.TokenExpiredError:
                    next(new AppLogicError(AppErrorName.TOKEN_EXPIRED))
                default:
                    next(new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR));
                    break;
            }
        }
    }
    next()
}
