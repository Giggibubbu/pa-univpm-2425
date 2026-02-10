import { AppErrorName } from "../enum/AppErrorName";
import { AuthRoles } from "../enum/AuthRoles";
import { AppLogicError } from "../errors/AppLogicError";
import { checkRole, verifyJwt } from "../middlewares/auth_middlewares";
import { NextFunction, Request, Response } from "express";
import { JwtKeysCouple, readJwtKeys } from "../utils/jwt/jwt_utils";
import * as jwt from "jsonwebtoken";
import { UserJwt } from "../interfaces/jwt/UserJwt";

let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;

describe("verifyJwt Middleware testing", () => {
    let keys:JwtKeysCouple;
    let userJwt: UserJwt = {
        email: "email@email.it",
        role: AuthRoles.USER
    }
    
    beforeAll(async () => {
        keys = await readJwtKeys()
    })
    
    beforeEach(() => {
        req = { headers: {} }
        res = {}
        next = jest.fn()
    })

    it("caso token non presente", async () => {

        await verifyJwt(req as Request, res as Response, next);

        const err = (next as jest.Mock).mock.calls[0][0];

        expect(err).toBeInstanceOf(AppLogicError)
        expect(err.name).toBe(AppErrorName.AUTH_TOKEN_NOTFOUND)
    })

    it("caso token scaduto", async () => {

        const jwtToken: string = jwt.sign(userJwt, keys.privKey, {algorithm: "RS256", expiresIn: "-1h"});
        
        req = { headers: {authorization: `Bearer ${jwtToken}`}}

        await verifyJwt(req as Request, res as Response, next);

        const err = (next as jest.Mock).mock.calls[0][0];

        expect(err).toBeInstanceOf(AppLogicError)
        expect(err.name).toBe(AppErrorName.JWT_EXPIRED)
        
    })

    it("caso token invalido", async () => {

        let jwtToken: string = jwt.sign(userJwt, keys.privKey, {algorithm: "RS256", expiresIn: "1h"});

        jwtToken = jwtToken + "pippo";

        req = { headers: {authorization: `Bearer ${jwtToken}`}}

        await verifyJwt(req as Request, res as Response, next);

        const err = (next as jest.Mock).mock.calls[0][0];

        expect(err).toBeInstanceOf(AppLogicError)
        expect(err.name).toBe(AppErrorName.INVALID_JWT)
    })

    it("caso token valido", async () => {
        let jwtToken: string = jwt.sign(userJwt, keys.privKey, {algorithm: "RS256", expiresIn: "1h"});

        req = { headers: {authorization: `Bearer ${jwtToken}`}}

        await verifyJwt(req as Request, res as Response, next);

        expect(req.jwt).toMatchObject(userJwt)
    })

})



describe("checkRole Middleware testing", () => {

    beforeEach(() => {
        req = { headers: {} }
        res = {}
        next = jest.fn()
    })

    it("app user role mismatch (caso un ruolo)", () => {

        req = { headers: {}, jwt: {email: "email@email.it", role: AuthRoles.ADMIN}}
        checkRole(AuthRoles.OPERATOR)(req as Request, res as Response, next);

        const err = (next as jest.Mock).mock.calls[0][0];

        expect(err).toBeInstanceOf(AppLogicError)
        expect(err.name).toBe(AppErrorName.UNAUTHORIZED_JWT);
    })

    it("app user role mismatch (caso array di ruoli)", () => {

        req = { headers: {}, jwt: {email: "email@email.it", role: AuthRoles.ADMIN}}
        checkRole([AuthRoles.OPERATOR, AuthRoles.USER])(req as Request, res as Response, next);

        const err = (next as jest.Mock).mock.calls[0][0];
        
        expect(err).toBeInstanceOf(AppLogicError)
        expect(err.name).toBe(AppErrorName.UNAUTHORIZED_JWT);
    })

    it("app user role/s match (next())", () => {
        req = { headers: {}, jwt: {email: "email@email.it", role: AuthRoles.USER}}
        checkRole([AuthRoles.OPERATOR, AuthRoles.USER])(req as Request, res as Response, next);

        const arg = (next as jest.Mock).mock.calls[0][0];

        expect(arg).toBeUndefined()
    })

});



