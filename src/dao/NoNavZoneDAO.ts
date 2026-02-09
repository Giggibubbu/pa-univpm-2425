import { OrmModels } from "../db/OrmModels.js";
import { IDao } from "../interfaces/dao/IDAO.js";
import { NoNavigationZoneAttributes } from "../models/sequelize-auto/NoNavigationZone.js";
export class NoNavZoneDAO implements IDao<NoNavigationZoneAttributes>
{
    private noNavZoneModel;
    constructor()
    {
        this.noNavZoneModel = OrmModels.initModels().NoNavigationZone;
    }
    create(): Promise<NoNavigationZoneAttributes> {
        throw new Error("Method not implemented.");
    }
    read(): Promise<NoNavigationZoneAttributes> {
        throw new Error("Method not implemented.");
    }

    async readAll(): Promise<NoNavigationZoneAttributes[]> {
        const noNavZones = await this.noNavZoneModel.findAll();
        return noNavZones;
    }
    update(): Promise<NoNavigationZoneAttributes | null> {
        throw new Error("Method not implemented.");
    }
    delete(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}