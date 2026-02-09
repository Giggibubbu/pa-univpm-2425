import { Request, Response } from "express";
import { NoAuthService } from "../services/NoAuthService.js";
import { successFactory } from "../factories/HTTPSuccessFactory.js";
import { AppSuccessName } from "../enum/AppSuccessName.js";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest.js";
export class NoAuthController
{
    private authService: NoAuthService;
    constructor(authService: NoAuthService)
    {
        this.authService = authService;
    }

    login = async (req: Request, res: Response) => {
        if(req.login?.email && req.login.password)
        {
            const loginObject = await this.authService.loginUser(req.login.email, req.login.password);
            const message = successFactory(AppSuccessName.LOGIN_SUCCESS, loginObject);
            res.status(message.statusCode).json(message);
        }
    }

    view = async (req: Request, res: Response) => {
        const noNavPlans: NoNavZone[] = await this.authService.viewNoNavZones();
        const message = successFactory(AppSuccessName.NAVPLAN_VIEW_SUCCESS, noNavPlans);
        res.status(message.statusCode).json(message);
    }

}