import { OrmModels } from "../db/OrmModels.js";
import { IDao } from "../interfaces/dao/IDAO.js";
import { NavigationRequest } from "../models/sequelize-auto/NavigationRequest.js";

export class NavPlanDAO implements IDao<NavigationRequest>
{
    private navReqModel;
    constructor()
    {
        this.navReqModel = OrmModels.initModels().NavigationRequest;
    }
    create(item: NavigationRequest): Promise<NavigationRequest> {
        throw new Error("Method not implemented.");
    }
    read(field: number | string): Promise<NavigationRequest | null | undefined> {
        throw new Error("Method not implemented.");
    }
    readAll(item?: NavigationRequest | undefined, itemKeyName?: string): Promise<void | NavigationRequest[]> {
        throw new Error("Method not implemented.");
    }
    update(item: NavigationRequest): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }
    delete(item: NavigationRequest): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }

}