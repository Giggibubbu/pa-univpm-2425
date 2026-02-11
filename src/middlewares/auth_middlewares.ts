import { NextFunction, Request, Response } from "express";
import { body, checkExact, matchedData, Result, ValidationChain, ValidationError, validationResult } from "express-validator";
import { AppErrorName } from "../enum/AppErrorName";
import { AppLogicError } from "../errors/AppLogicError";
import jwt from "jsonwebtoken";
import { readJwtKeys } from "../utils/jwt/jwt_utils";
import { AuthRoles } from "../enum/AuthRoles";
import { UserJwt } from "../interfaces/jwt/UserJwt";

/**
 * Modulo middleware per l'autenticazione e l'autorizzazione degli utenti.
 * Gestisce la validazione delle credenziali di login, la verifica dei token JWT
 * e il controllo degli accessi.
 */

/**
 * Validatore per l'indirizzo email nel corpo della richiesta.
 * Verifica l'esistenza, il formato corretto e applica la sanificazione/normalizzazione.
 */
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

/**
 * Validatore per la password nel corpo della richiesta.
 * Impone requisiti di sicurezza minimi (8 caratteri, maiuscole, numeri, simboli).
 */
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

/**
 * Middleware di finalizzazione della validazione della richiesta di login di un generico utente.
 * Controlla l'esito delle validazioni precedenti e popola l'oggetto login nella richiesta.
 * * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */
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

/**
 * Catena di validazione esatta per la rotta di login.
 */

export const loginValidationRules = checkExact([validateAndSanitizeEmail, validateAndSanitizePassword])

/**
 * Middleware per il controllo dei ruoli utente.
 * Verifica che il ruolo presente nel JWT corrisponda a quello richiesto per la risorsa.
 * * @param role - Singolo ruolo o array di ruoli autorizzati.
 * @returns Funzione middleware per la verifica del ruolo.
 */

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

/**
 * Middleware per la verifica del token JWT.
 * Estrae il token dall'header Authorization ed esegue la verifica tramite chiave pubblica.
 * * @param req - Oggetto della richiesta Express.
 * @param res - Oggetto della risposta Express.
 * @param next - Funzione per passare il controllo al middleware successivo.
 */

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

/**
 * Catena di middleware per verifica autenticazione e autorizzazione per rotte utente.
 */

export const userRoleValidation = [verifyJwt, checkRole(AuthRoles.USER)]

/**
 * Catena di middleware per verifica autenticazione e autorizzazione per rotte operatore.
 */

export const operatorRoleValidation = [verifyJwt, checkRole(AuthRoles.OPERATOR)]

/**
 * Catena di middleware per verifica autenticazione e autorizzazione per rotte admin.
 */

export const adminRoleValidation = [verifyJwt, checkRole(AuthRoles.ADMIN)]

/**
 * Catena di middleware per verifica autenticazione e autorizzazione per rotte condivise tra utente e operatore.
 */

export const userOpRoleValidation = [verifyJwt, checkRole([AuthRoles.USER, AuthRoles.OPERATOR])]
