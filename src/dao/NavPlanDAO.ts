import { OrmModels } from "../db/OrmModels.js";
import { IDao } from "../interfaces/dao/IDAO.js";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest.js";

export class NavPlanDAO implements IDao<NavigationRequestAttributes>
{
    private navReqModel;
    constructor()
    {
        this.navReqModel = OrmModels.initModels().NavigationRequest;
    }
    async create(item: NavigationRequestAttributes): Promise<NavigationRequestAttributes> {
        return await this.navReqModel.create({
            userId: item.userId,
            dateStart: item.dateStart,
            dateEnd: item.dateEnd,
            droneId: item.droneId,
            navigationPlan: item.navigationPlan
        });
    }
    read(field: number | string): Promise<NavigationRequestAttributes | null> {
        throw new Error("Method not implemented.");
    }
    async readAll(item?: NavigationRequestAttributes | undefined, itemKeyName?: string): Promise<NavigationRequestAttributes[]> {
        const navPlans = await this.navReqModel.findAll();
        return navPlans;
    }
    update(item: NavigationRequestAttributes): Promise<NavigationRequestAttributes> {
        return new Promise((resolve, reject) => {
            throw new Error("Method not implemented.");
        });
    }
    delete(item: NavigationRequestAttributes): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }

}