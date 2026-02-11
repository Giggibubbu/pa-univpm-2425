import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../middlewares/error_middlewares";
import { AppLogicError } from "../errors/AppLogicError";
import { AppErrorName } from "../enum/AppErrorName";
import { HTTPError } from "../errors/HTTPError";

/**
 * Test jest per il middleware di gestione errori.
 * Verifica la corretta trasformazione degli errori in risposte HTTP standardizzate.
 */

let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;

/**
 * Test del middleware errorHandler.
 * Verifica che diversi tipi di errore vengano convertiti correttamente in HTTPError.
 * Ulteriore verifica dello statusCode che sarà presente nell'header della risposta.
 */

describe("errorHandler Middleware testing", () => {
    
    beforeEach(() => {

        req = { headers: {} }
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }
        next = jest.fn()
    })

    it("caso AppLogicError", () => {

        errorHandler(new AppLogicError(AppErrorName.FORBIDDEN_AREA_ERROR), req as Request, res as Response, next)
        
        expect((res.json as jest.Mock).mock.calls[0][0]).toBeInstanceOf(HTTPError)
        expect((res.status as jest.Mock).mock.calls[0][0]).toBe(403)

    })

    it("caso HTTPError", () => {

        errorHandler(new HTTPError(403, "pippo", "message"), req as Request, res as Response, next)

        expect((res.json as jest.Mock).mock.calls[0][0]).toBeInstanceOf(HTTPError)
        expect((res.status as jest.Mock).mock.calls[0][0]).toBe(403)

    })

    it("caso Error", () => {

        errorHandler(new Error("pippo"), req as Request, res as Response, next)

        expect((res.json as jest.Mock).mock.calls[0][0]).toBeInstanceOf(HTTPError)
        expect((res.status as jest.Mock).mock.calls[0][0]).toBe(500)

    })

    

})