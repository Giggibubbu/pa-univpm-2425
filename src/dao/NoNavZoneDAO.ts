import Op from "sequelize/lib/operators";
import { OrmModels } from "../db/OrmModels.js";
import { IDao } from "../interfaces/dao/IDAO.js";
import { NoNavigationZoneAttributes } from "../models/sequelize-auto/NoNavigationZone.js";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest.js";
import { NavPlanDAO } from "./NavPlanDAO.js";

export class NoNavZoneDAO implements IDao<NoNavigationZoneAttributes>
{
    private noNavZoneModel;
    constructor()
    {
        this.noNavZoneModel = OrmModels.initModels().NoNavigationZone;
    }
    create(item: NoNavigationZoneAttributes): Promise<NoNavigationZoneAttributes> {
        throw new Error("Method not implemented.");
    }
    async read(field: number | string): Promise<NoNavigationZoneAttributes | null> {
        return null;
    }
    async readAll(item?: NoNavigationZoneAttributes): Promise<NoNavigationZoneAttributes[]> {
        const noNavZones = await this.noNavZoneModel.findAll();
        return noNavZones;
    }
    update(item: NoNavigationZoneAttributes, field?: number | string): Promise<NoNavigationZoneAttributes | null> {
        throw new Error("Method not implemented.");
    }
    delete(item: NoNavigationZoneAttributes): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }
}