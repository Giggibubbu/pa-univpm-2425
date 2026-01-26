import { OrmModels } from '../db/OrmModels';
import { UserAttributes } from '../models/sequelize-auto/User';
import { IDao } from './IDAO';
export class UserDAO implements IDao<UserAttributes>
{
    private userModel;
    constructor()
    {
        this.userModel = OrmModels.initModels().User;
    }

    async create(item: UserAttributes): Promise<void> {
        return this.userModel.create({
            id: item.id,
            email: item.email,
            password: item.password,
            role: item.role,
            tokens: item.tokens
        })
        .then(user => console.log("User created or updated: ", user.toJSON()))
        .catch(error => console.error(error))
    }
    async read(id: number): Promise<UserAttributes | void | undefined > {
        return this.userModel.findByPk(id)
        .then(user => user?.toJSON())
        .catch(error => console.error(error))
    }
    async readAll(): Promise<UserAttributes[] | void> {
        return this.userModel.findAll()
        .then(users => users.map(user => user.toJSON()))
        .catch(error => console.error(error));
    }
    async update(item: UserAttributes): Promise<void> {
        return this.create(item);
    }
    async delete(item: UserAttributes): Promise<void> {
        return this.userModel.findByPk(item.id)
        .then(user => user?.destroy())
        .catch(error => console.error(error));
    }

}