import { OrmModels } from '../db/OrmModels.js';
import { UserAttributes } from '../models/sequelize-auto/User.js';
import { IDao } from '../interfaces/dao/IDAO.js';
import { Op } from 'sequelize';
import { User } from '../tests/test.test.js';

export class UserDAO implements IDao<UserAttributes>
{
    private userModel;
    constructor()
    {
        this.userModel = OrmModels.initModels().User;
    }

    async create(item: UserAttributes): Promise<UserAttributes> {
        const user = this.create(item)
        return await this.userModel.create({
            id: item.id,
            email: item.email,
            password: item.password,
            role: item.role,
            tokens: item.tokens
        });
    }

    async read(id: number): Promise<UserAttributes | null>;
    async read(email: string): Promise<UserAttributes | null>;

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

    async readAll(item?: UserAttributes, itemKeyName?: string): Promise<UserAttributes[] | void> {
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
        let userUpdated: UserAttributes | null;
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
    async delete(item: UserAttributes): Promise<Boolean>
    {
        const user = await this.userModel.findByPk(item.id)
        if(user === null)
        {
                console.error("Impossibile cancellare l'utente con item id: "+`${item.id}`)
                return false;
        }
        return true;
    }

}