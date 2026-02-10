import { AuthRoles } from "../enum/AuthRoles";
import { AppLogicError } from "../errors/AppLogicError";
import { checkRole } from "../middlewares/auth_middlewares";
import { NextFunction, Request, Response } from "express";


describe("checkRole Middleware testing", () => {

    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { headers: {} }
        res = {}
        next = jest.fn()
    })

    it("caso primo if", () => {

        req = { headers: {}, jwt: {email: "email@email.it", role: AuthRoles.ADMIN}}
        checkRole(AuthRoles.OPERATOR)(req as Request, res as Response, next);

        const err = (next as jest.Mock).mock.calls[0][0];
        console.log(err)
        expect(err).toBeInstanceOf(AppLogicError)

    })

    it("caso secondo if", () => {

        req = { headers: {}, jwt: {email: "email@email.it", role: AuthRoles.ADMIN}}
        checkRole([AuthRoles.OPERATOR, AuthRoles.USER])(req as Request, res as Response, next);

        const err = (next as jest.Mock).mock.calls[0][0];
        console.log(err)
        expect(err).toBeInstanceOf(AppLogicError)
    })

    it("terzo caso (next())", () => {
        req = { headers: {}, jwt: {email: "email@email.it", role: AuthRoles.USER}}
        checkRole([AuthRoles.OPERATOR, AuthRoles.USER])(req as Request, res as Response, next);

        const err = (next as jest.Mock).mock.calls[0][0];
        console.log(err)
        expect(err).toBeUndefined()
    })


});
