import { Request, Response } from "express";
import { UserRoleService } from "../services/UserRoleService.js";
export class UserRoleController
{
    private userRoleService: UserRoleService;
    constructor(userRoleService: UserRoleService)
    {
        this.userRoleService = userRoleService;
    }

    create = async (req: Request, res: Response) =>
    {
        res.status(200).json({fiffo: "fiffa"});

    }

}