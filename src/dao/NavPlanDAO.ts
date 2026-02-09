import { Op, WhereOptions } from "sequelize";
import { OrmModels } from "../db/OrmModels.js";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus.js";
import { IDao } from "../interfaces/dao/IDAO.js";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest.js";
import { ViewNavPlansQS } from "../interfaces/http-requests/ViewNavPlansQS.js";

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
    async readAll(item?: NavigationRequestAttributes, filters?:ViewNavPlansQS): Promise<NavigationRequestAttributes[]> {
        filters = filters?? {}
        const whereClause: WhereOptions<NavigationRequestAttributes> = {};
        switch(Object.keys(filters).length > 0)
        {
            case true:
                if(filters.dateFrom && filters.dateTo)
                {
                    whereClause.submittedAt = {[Op.between]: [filters.dateFrom, filters.dateTo]};
                }
                else if(filters.dateFrom)
                {
                    whereClause.submittedAt = {[Op.gte]: filters.dateFrom}
                }
                else if(filters.dateTo)
                {
                    whereClause.submittedAt = {[Op.lte]: filters.dateTo}
                }
                if(filters.status)
                {
                    whereClause.status = filters.status;
                }
                if(filters.userId)
                {
                    whereClause.userId = filters.userId;
                }
                console.log(whereClause)
                return await this.navReqModel.findAll({where: whereClause});
            default:
                return await this.navReqModel.findAll();
        }
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

 
    async delete(item: NavigationRequestAttributes | number): Promise<boolean> {
        let affectedCount: number;
        switch(true)
        {
            case typeof(item) === "number":
                affectedCount = await this.navReqModel.destroy({where: {id: item, status: NavPlanReqStatus.PENDING}});
                return affectedCount? true : false;
             default:
                return await this.navReqModel.destroy({where: {id: item.id}})? true : false;
        }
    }

}