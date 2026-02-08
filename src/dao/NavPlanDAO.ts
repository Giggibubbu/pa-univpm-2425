import { OrmModels } from "../db/OrmModels.js";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus.js";
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
    async read(field: number): Promise<NavigationRequestAttributes | null> {
        return await this.navReqModel.findOne({where: {id: field}});
    }
    async readAll(): Promise<NavigationRequestAttributes[]> {
        return await this.navReqModel.findAll();
    }
    async update(item: NavigationRequestAttributes): Promise<NavigationRequestAttributes | null> {
        const [affectedCount, navPlans] = await this.navReqModel.update({ status: item.status }, {where: {id: item.id}, returning: true});
        if(affectedCount)
        {
            for(const navPlan of navPlans)
            {
                if(item.id === navPlan.id)
                {
                    return navPlan;
                }
            }

        }
        return null;
    }

 
    async delete(item: NavigationRequestAttributes | number): Promise<Boolean> {
        switch(true)
        {
            case typeof(item) === "number":
                const affectedCount = await this.navReqModel.destroy({where: {id: item, status: NavPlanReqStatus.PENDING}});
                return affectedCount? true : false;
             default:
                return await this.navReqModel.destroy({where: {id: item.id}})? true : false;
        }
    }

}