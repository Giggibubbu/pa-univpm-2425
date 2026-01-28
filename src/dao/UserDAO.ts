import { OrmModels } from '../db/OrmModels.js';
import { UserAttributes } from '../models/sequelize-auto/User.js';
import { IDao } from '../interfaces/IDAO.js';
export class UserDAO implements IDao<UserAttributes>
{
    private userModel;
    constructor()
    {
        this.userModel = OrmModels.initModels().User;
    }

    async create(item: UserAttributes): Promise<UserAttributes> {
        return this.userModel.create({
            id: item.id,
            email: item.email,
            password: item.password,
            role: item.role,
            tokens: item.tokens
        });
    }
    async read(id: number): Promise<UserAttributes | void | undefined > {
        return this.userModel.findByPk(id)
        .then(user => user?.toJSON())
        .catch(error => console.error(error))
    }
    async findByEmail(email: string): Promise<UserAttributes | null> {
        const user: UserAttributes | null = await this.userModel.findOne({
            where: { email: email }});
        return user;
    }
    async readAll(): Promise<UserAttributes[] | void> {
        return this.userModel.findAll()
        .then(users => users.map(user => user.toJSON()))
        .catch(error => console.error(error));
    }
    async update(item: UserAttributes): Promise<Boolean> {
        return !this.create(item);
    }
    async delete(item: UserAttributes): Promise<void> {
        return this.userModel.findByPk(item.id)
        .then(user => user?.destroy())
        .catch(error => console.error(error));
    }

}