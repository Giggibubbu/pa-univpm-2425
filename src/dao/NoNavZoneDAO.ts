import { Op, WhereOptions } from "sequelize";
import { OrmModels } from "../db/OrmModels";
import { IDao } from "../interfaces/dao/IDAO";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest";
import { NoNavigationZoneAttributes } from "../models/sequelize-auto/NoNavigationZone";

export class NoNavZoneDAO implements IDao<NoNavigationZoneAttributes>
{
    private noNavZoneModel;
    constructor()
    {
        this.noNavZoneModel = OrmModels.initModels().NoNavigationZone;
    }
    async create(item: NoNavigationZoneAttributes): Promise<NoNavigationZoneAttributes> {
        return await this.noNavZoneModel.create({
            operatorId: item.operatorId,
            route: item.route,
            validityStart: item.validityStart,
            validityEnd: item.validityEnd
        })
    }
    read(): Promise<NoNavigationZoneAttributes> {
        throw new Error("Method not implemented.");
    }

    async readAll(item?: NoNavigationZoneAttributes | NavigationRequestAttributes): Promise<NoNavigationZoneAttributes[] | undefined> {

        if(item != undefined)
        {
            let whereClause: WhereOptions<NoNavigationZoneAttributes> = {}
            if('userId' in item)
            {
                if(item.dateStart && item.dateEnd)
                {
                    if(item.dateEnd && item.dateStart)
                    {
                        whereClause = {[Op.and]: [{
                            [Op.or]: [
                                { validityEnd: { [Op.gte]: item.dateStart } },
                                { validityEnd: { [Op.eq]: null } }
                            ]
                        },
                        {
                            [Op.or]: [
                                { validityStart: { [Op.lte]: item.dateEnd } },
                                { validityStart: { [Op.eq]: null } }
                            ]
                        }
                        ]
                        };
                        return this.noNavZoneModel.findAll({where: whereClause});
                    } 
                }
            }
            else if('operatorId' in item)
            {
                if(item.route)
                {
                    whereClause = { route: {[Op.eq]: item.route }}
                }
                return this.noNavZoneModel.findAll({where: whereClause});

            }
        }
        else
        {
            const noNavZones = await this.noNavZoneModel.findAll();
            return noNavZones;
        }
        
    }
    async update(item: NoNavigationZoneAttributes): Promise<NoNavigationZoneAttributes | null> {
        if(item.id)
        {
            if((item.validityEnd === null && item.validityStart === null) || (item.validityEnd && item.validityStart))
            {
                const [affectedCount, noNavPlan] = await this.noNavZoneModel.update({ validityStart: item.validityStart, validityEnd: item.validityEnd }, {where: {id: item.id}, returning: true});
                return noNavPlan[0];
            }

        }
        return null
    }
    async delete(item: NoNavigationZoneAttributes): Promise<boolean | number> {
        if(item.id)
        {
            return await this.noNavZoneModel.destroy({where: {id: item.id}})
        }
        else
        {
            return false;
        }
    }
}