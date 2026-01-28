import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService";
export class AuthController
{
    private authService: AuthService;
    constructor(authService: AuthService)
    {
        this.authService = authService;
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        if(req.login?.email && req.login?.password)
        {
            const jwtToken = await this.authService.loginUser(req.login.email, req.login.password);
            res.status(200).json({message: "La risorsa esiste!", token: jwtToken});
        }

    }

}