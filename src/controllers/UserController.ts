import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";
import { HTTPMessageFactory } from "../factories/HTTPSuccessFactory.js";
import { AppSuccessName } from "../enum/AppSuccessName.js";
export class AuthController
{
    private authService: AuthService;
    constructor(authService: AuthService)
    {
        this.authService = authService;
    }

    login = async (req: Request, res: Response) => {
        if(req.login?.email && req.login?.password)
        {
            const jwtToken = await this.authService.loginUser(req.login.email, req.login.password);
            const objJwtToken = {token: jwtToken}
            const message = HTTPMessageFactory.getMessage(AppSuccessName.LOGIN_SUCCESS, objJwtToken);
            res.status(message.statusCode).json(message);
        }
    }

}