import { Request, Response } from "express";
import { NoAuthService } from "../services/NoAuthService.js";
import { HTTPMessageFactory } from "../factories/HTTPSuccessFactory.js";
import { AppSuccessName } from "../enum/AppSuccessName.js";
export class NoAuthController
{
    private authService: NoAuthService;
    constructor(authService: NoAuthService)
    {
        this.authService = authService;
    }

    login = async (req: Request, res: Response) => {
        if(req.login?.email && req.login?.password)
        {
            const loginObject = await this.authService.loginUser(req.login.email, req.login.password);
            const message = HTTPMessageFactory.getMessage(AppSuccessName.LOGIN_SUCCESS, loginObject);
            res.status(message.statusCode).json(message);
        }
    }

}