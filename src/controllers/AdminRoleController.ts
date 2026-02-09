import { Request, Response } from "express";
import { AdminRoleService } from "../services/AdminRoleService.js";
import { HTTPUser } from "../interfaces/http-requests/UserLogin.js";
import { successFactory } from "../factories/HTTPSuccessFactory.js";
import { AppSuccessName } from "../enum/AppSuccessName.js";

export class AdminRoleController
{
    private adminService: AdminRoleService;
    constructor(adminService: AdminRoleService){
        this.adminService = adminService;
    }

    load = async (req: Request, res: Response) => {
        if(req.userToken)
        {
            const user: HTTPUser = await this.adminService.chargeToken(req.userToken)
            const message = successFactory(AppSuccessName.TOKENS_CHARGED_SUCCESSFULLY, {user: user})
            res.status(message.statusCode).json(message);
        }
    }


}