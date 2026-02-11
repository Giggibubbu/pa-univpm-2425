import { AppSuccessName } from "../enum/AppSuccessName";
import { successFactory } from "../factories/HTTPSuccessFactory";
import { HTTPUser } from "../interfaces/http-requests/UserLogin";
import { AdminRoleService } from "../services/AdminRoleService";
import { Request, Response } from "express";

/**
 * Controller per la gestione delle risposte HTTP per quanto concerne
 * le operazioni effettuabili dall'admin. (es. ricarica token)
 */

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