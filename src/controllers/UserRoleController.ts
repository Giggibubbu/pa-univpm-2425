import { Request, Response } from "express";
import { UserRoleService } from "../services/UserRoleService.js";
import { HTTPMessageFactory } from "../factories/HTTPSuccessFactory.js";
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
        const navPlanAndUser = await this.userRoleService.createNavPlan(req.jwt!, req.navPlan!);
        const message = HTTPMessageFactory.getMessage(AppSuccessName.NAVPLAN_REQ_CREATED, {navplan: navPlanAndUser[0], user: navPlanAndUser[1]});
        res.status(message.statusCode).json(message)
    }

}