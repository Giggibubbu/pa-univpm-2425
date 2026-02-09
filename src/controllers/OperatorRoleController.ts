import { Request, Response } from "express";
import { OperatorRoleService } from "../services/OperatorRoleService.js";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest.js";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { successFactory } from "../factories/HTTPSuccessFactory.js";
import { AppSuccessName } from "../enum/AppSuccessName.js";


export class OperatorRoleController
{
    private opRoleService: OperatorRoleService;
    constructor(opRoleService: OperatorRoleService)
    {
        this.opRoleService = opRoleService;
    }


    createNoNavZone = async (req: Request, res: Response) => {
        let noNavZone: NoNavZone;
        if(req.jwt?.email && req.noNavZone)
        {
            noNavZone = await this.opRoleService.createNoNavZone(req.jwt?.email, req.noNavZone);
            if(noNavZone.id)
            {
                const message = successFactory(AppSuccessName.NONAVZONE_CREATED, noNavZone)
                res.status(message.statusCode).json(message)
            }
            else
            {
                throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR)
            }
        }
    }

    updateNoNavZone = async (req: Request, res: Response) => {
        res.status(200).json()
    }

    viewNoNavZone = async (req: Request, res: Response) => {
        res.status(200).json()
    }

    deleteNoNavZone = async (req: Request, res: Response) => {
        res.status(200).json()
    }

    updateNavPlan = async (req: Request, res: Response) => {
        res.status(200).json()
    }

    
}