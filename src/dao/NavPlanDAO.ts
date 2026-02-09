import { Op, WhereOptions } from "sequelize";
import { OrmModels } from "../db/OrmModels.js";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus.js";
import { IDao } from "../interfaces/dao/IDAO.js";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest.js";
import { NavPlanQueryFilter } from "../interfaces/dao/NavPlanQueryFilter.js";
import { isArray } from "util";

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
    async readAll(item?: NavPlanQueryFilter): Promise<NavigationRequestAttributes[]> {
        item = item?? {}
        const whereClause: WhereOptions<NavigationRequestAttributes> = {};
        switch(Object.keys(item).length > 0)
        {
            case true:
                if(item.dateEnd && item.dateStart)
                {
                    whereClause.dateEnd = {[Op.gte]: item.dateStart}
                    whereClause.dateStart = {[Op.lte]: item.dateEnd}
                }
                if(item.dateFrom && item.dateTo)
                {
                    whereClause.submittedAt = {[Op.between]: [item.dateFrom, item.dateTo]};
                }
                else if(item.dateFrom)
                {
                    whereClause.submittedAt = {[Op.gte]: item.dateFrom}
                }
                else if(item.dateTo)
                {
                    whereClause.submittedAt = {[Op.lte]: item.dateTo}
                }
                if(Array.isArray(item.status))
                {
                    whereClause.status = {[Op.in]: item.status}
                }
                else if(item.status)
                {
                    whereClause.status = {[Op.eq]: item.status}
                }
                if(item.userId)
                {
                    whereClause.userId = {[Op.eq]: item.userId}
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