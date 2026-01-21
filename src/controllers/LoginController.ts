import { Request, Response } from "express";
import { EnvVariable } from "../utils/env/EnvVariable";
export class AuthController
{
    constructor(){}

    login = async (req: Request, res: Response) => {
        console.log(EnvVariable.JWT_SECRET);
        res.status(200).json({statusCode: 200, message: "Existing user in backend!"})
    }

}