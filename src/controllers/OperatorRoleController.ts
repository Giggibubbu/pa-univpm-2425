import { Request, Response } from "express";
import { AppErrorName } from "../enum/AppErrorName";
import { AppSuccessName } from "../enum/AppSuccessName";
import { AppLogicError } from "../errors/AppLogicError";
import { successFactory } from "../factories/HTTPSuccessFactory";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest";
import { OperatorRoleService } from "../services/OperatorRoleService";



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
        if(req.noNavZone)
        {
            const noNavZoneCreated = await this.opRoleService.updateNoNavZone(req.noNavZone);
            if(noNavZoneCreated)
            {
                const message = successFactory(AppSuccessName.NONAVZONE_UPDATED, noNavZoneCreated)
                res.status(message.statusCode).json(message)
            }
        }
        
        res.status(200).json()
    }

    deleteNoNavZone = async (req: Request, res: Response) => {
        if(req.noNavZone && req.jwt)
        {
            const deleted: boolean = await this.opRoleService.deleteNoNavZone(req.noNavZone, req.jwt?.email)
            if(deleted)
            {
                const message = successFactory(AppSuccessName.NONAVZONE_DELETED, {deleted});
                res.status(message.statusCode).json();
            }
            res.status(200).json()
        }
        
    }

    updateNavPlan = async (req: Request, res: Response) => {
        if(req.navPlan)
        {
            const navPlan: NavPlan = await this.opRoleService.updateNavPlan(req.navPlan);
            const message = successFactory(AppSuccessName.NAVPLAN_UPDATED, {navplan: navPlan})
            res.status(message.statusCode).json(message)
        }
        res.status(200).json()
    }

    
}