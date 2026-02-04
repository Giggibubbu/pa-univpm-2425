import { NextFunction, Request, Response } from "express";
import { body, checkExact, ContextRunner, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import { Middleware } from "express-validator/lib/base";
import { AppErrorName } from "../enum/AppErrorName.js";
import { AppLogicError } from "../errors/AppLogicError.js";
import jwt from "jsonwebtoken";
import { readJwtKeys } from "../utils/jwt/jwt_utils.js";
import { AuthRoles } from "../enum/AuthRoles.js";
import { UserJwt } from "../interfaces/jwt/UserJwt.js";

export const validateAndSanitizeEmail: ValidationChain = body('email')
.notEmpty()
.exists()
.trim()
.isEmail()
.normalizeEmail();

export const validateAndSanitizePassword: ValidationChain = body('password')
.trim()
.replace(" ", "")
.notEmpty()
.exists()
.isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
});

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

export const checkRole = (role: string) => (req:Request, res:Response, next:NextFunction) =>
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
            req.jwt = <UserJwt> decodedJwt;
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

export const userRoleValidation = [verifyJwt, checkRole(AuthRoles.USER)]
