import { OrmModels } from "../db/OrmModels.js";
import { IDao } from "../interfaces/dao/IDAO.js";
import { NoNavigationZone } from "../models/sequelize-auto/NoNavigationZone.js";

export class NoNavZoneDAO implements IDao<NoNavigationZone>
{
    private noNavZoneModel;
    constructor()
    {
        this.noNavZoneModel = OrmModels.initModels().NoNavigationZone;
    }
    create(item: NoNavigationZone): Promise<NoNavigationZone> {
        throw new Error("Method not implemented.");
    }
    read(field: number | string): Promise<NoNavigationZone | null | undefined> {
        throw new Error("Method not implemented.");
    }
    readAll(item?: NoNavigationZone | undefined, itemKeyName?: string): Promise<void | NoNavigationZone[]> {
        throw new Error("Method not implemented.");
    }
    update(item: NoNavigationZone): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }
    delete(item: NoNavigationZone): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }
}