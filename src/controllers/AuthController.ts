import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
export class AuthController
{
    constructor(authService: AuthService){}

    login = async (req: Request, res: Response) => {
        res.status(200).json({statusCode: 200, message: "Existing user in backend!"})
    }

}