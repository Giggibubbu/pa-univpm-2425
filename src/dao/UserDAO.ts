
import { Op } from 'sequelize';
import { OrmModels } from '../db/OrmModels';
import { IDao } from '../interfaces/dao/IDAO';
import { UserAttributes } from '../models/sequelize-auto/User';

export class UserDAO implements IDao<UserAttributes>
{
    private userModel;
    constructor()
    {
        this.userModel = OrmModels.initModels().User;
    }

    async create(item: UserAttributes): Promise<UserAttributes> {
        return await this.userModel.create({
            id: item.id,
            email: item.email,
            password: item.password,
            role: item.role,
            tokens: item.tokens
        });
    }

    async read(field: number | string): Promise<UserAttributes | null> {
        let user;
        switch(true)
        {
            case typeof field === "string":
                user = await this.userModel.findOne({ where: { email: field } });
                return user;
            case typeof field === "number":
                user = await this.userModel.findByPk(field);
                return user;
            default:
                return null;
        }
    }

    async readAll(item?: UserAttributes, itemKeyName?: string): Promise<UserAttributes[]> {
        if(item && itemKeyName)
        {
            const users = await this.userModel.findAll({
                where: {
                    [itemKeyName]: {
                        [Op.eq]: item[itemKeyName as keyof UserAttributes]
                    }
                }
            });
            return users;
        }
        else
        {
            const users = await this.userModel.findAll();
            return users;
        }
    }

    async update(item: UserAttributes): Promise<UserAttributes | null> {
        const [affectedCount, users] = await this.userModel.update({ tokens: item.tokens }, {where: {id: item.id}, returning: true});
        if(affectedCount)
        {
            for(const user of users)
            {
                if(item.id === user.id)
                {
                    return user;
                }
            }

        }
        return null;
    }
    async delete(item: UserAttributes): Promise<boolean>
    {
        const user = await this.userModel.findByPk(item.id)
        if(user === null)
        {
                return false;
        }
        return true;
    }
}