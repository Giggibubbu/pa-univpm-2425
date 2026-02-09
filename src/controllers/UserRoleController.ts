import { Request, Response } from "express";
import { UserRoleService } from "../services/UserRoleService.js";
import { successFactory } from "../factories/HTTPSuccessFactory.js";
import { AppSuccessName } from "../enum/AppSuccessName.js";
export class UserRoleController
{
    private userRoleService: UserRoleService;
    constructor(userRoleService: UserRoleService)
    {
        this.userRoleService = userRoleService;
    }

    create = async (req: Request, res: Response) =>
    {
        if(req.jwt && req.navPlan)
        {
            const navPlanAndUser = await this.userRoleService.createNavPlan(req.jwt, req.navPlan);
            const message = successFactory(AppSuccessName.NAVPLAN_REQ_CREATED, {navplan: navPlanAndUser[0], user: navPlanAndUser[1]});
            res.status(message.statusCode).json(message)

        }
    }

    delete = async (req: Request, res: Response) =>
    {
        if(req.jwt?.email && req.navPlan?.id)
        {
            await this.userRoleService.deleteNavPlan(req.jwt.email, req.navPlan.id);
            const message = successFactory(AppSuccessName.NAVPLAN_REQ_DELETED, {});
            res.status(message.statusCode).json()
        }
    }
}