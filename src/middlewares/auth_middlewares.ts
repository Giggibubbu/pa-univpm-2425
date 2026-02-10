import { NextFunction, Request, Response } from "express";
import { body, checkExact, matchedData, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import { AppErrorName } from "../enum/AppErrorName";
import { AppLogicError } from "../errors/AppLogicError";
import jwt from "jsonwebtoken";
import { readJwtKeys } from "../utils/jwt/jwt_utils";
import { AuthRoles } from "../enum/AuthRoles";
import { UserJwt } from "../interfaces/jwt/UserJwt";

export const validateAndSanitizeEmail: ValidationChain = body('email')
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.isString()
.withMessage("Il campo non è una stringa.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.customSanitizer((value:string) => {
    return value.replace(/\s/g, '');
})
.isEmail()
.withMessage("Il campo non contiene una stringa avente formato email.").bail()
.normalizeEmail();

export const validateAndSanitizePassword: ValidationChain = body('password')
.exists()
.withMessage("Il campo non contiene alcun valore.").bail()
.isString()
.withMessage("Il campo non è una stringa.").bail()
.notEmpty()
.withMessage("Il campo è una stringa vuota.").bail()
.customSanitizer((value:string) => {
    return value.replace(/\s/g, '');
})
.isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
})
.withMessage("Il campo non contiene una stringa avente formato password forte.").bail();

export const finalizeLoginValidation = (req:Request, res:Response, next:NextFunction) => {
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) 
        {
            next(new AppLogicError(AppErrorName.LOGIN_INVALID))
        }
    const data = matchedData(req);
    
        req.login = {
        email: data.email as string,
        password: data.password as string
    };

    next();
}

export const loginValidationRules = checkExact([validateAndSanitizeEmail, validateAndSanitizePassword])

export const checkRole = (role: AuthRoles | AuthRoles[]) => (req:Request, res:Response, next:NextFunction) =>
{
    if(typeof(role) === "string" && req.jwt?.role !== role)
    {
        next(new AppLogicError(AppErrorName.UNAUTHORIZED_JWT));
    }
    else if(req.jwt?.role && Array.isArray(role) && !role.includes(req.jwt.role))
    {
        next(new AppLogicError(AppErrorName.UNAUTHORIZED_JWT));
    }
    
    next()
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
            const decodedJwt = jwt.verify(userAuthToken[1], pubKey);
            req.jwt = decodedJwt as UserJwt;
        }
        catch(e)
        {
            switch(true)
            {
                case e instanceof jwt.TokenExpiredError:
                    next(new AppLogicError(AppErrorName.JWT_EXPIRED))
                    break;
                default:
                    next(new AppLogicError(AppErrorName.INVALID_JWT))
                    break;
            }
        }
    }
    next()
}

export const userRoleValidation = [verifyJwt, checkRole(AuthRoles.USER)]

export const operatorRoleValidation = [verifyJwt, checkRole(AuthRoles.OPERATOR)]

export const adminRoleValidation = [verifyJwt, checkRole(AuthRoles.ADMIN)]

export const userOpRoleValidation = [verifyJwt, checkRole([AuthRoles.USER, AuthRoles.OPERATOR])]
