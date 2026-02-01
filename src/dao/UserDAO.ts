import { OrmModels } from '../db/OrmModels.js';
import { UserAttributes } from '../models/sequelize-auto/User.js';
import { IDao } from '../interfaces/dao/IDAO.js';
import { updateLanguageServiceSourceFile } from 'typescript';
import { Op } from 'sequelize';
export class UserDAO implements IDao<UserAttributes>
{
    private userModel;
    constructor()
    {
        this.userModel = OrmModels.initModels().User;
    }

    async create(item: UserAttributes): Promise<UserAttributes> {
        const user = this.create(item)
        return this.userModel.create({
            id: item.id,
            email: item.email,
            password: item.password,
            role: item.role,
            tokens: item.tokens
        });
    }

    async read(id: number): Promise<UserAttributes | null | undefined>;
    async read(email: string): Promise<UserAttributes | null | undefined>;

    async read(field: any): Promise<UserAttributes | null | undefined> {
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

    async findByEmail(email: string): Promise<UserAttributes | null> {
        let user: UserAttributes | null = await this.userModel.findOne({
            where: { email: email }});
        return user;
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
    async update(item: UserAttributes): Promise<Boolean> {
        this.userModel.update({ email: "example@€xample.it" }, {where: {id: 1}});
        return !this.create(item);
    }
    async delete(item: UserAttributes): Promise<Boolean>
    {
        const user = await this.userModel.findByPk(item.id)
        if(user === null)
        {
                console.error("Impossibile cancellare l'utente con item id: "+`${item.id}`)
                return false;
        }
        console.log("Utente " + `${item.id}` + "cancellato con successo.")
        return true;
    }

}