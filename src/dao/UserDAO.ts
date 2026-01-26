import { OrmModels } from '../connector/OrmModels';
import { UserFields } from '../models/sequelize-auto/user';
import { IDao } from './IDAO';
export class UserDAO implements IDao<UserFields>
{
    private userModel;
    constructor()
    {
        this.userModel = OrmModels.initModels().user;
    }

    async create(item: UserFields): Promise<void> {
        return this.userModel.create({
            id: item.id,
            email: item.email,
            role: item.role,
            tokens: item.tokens,
            password: ''
        })
        .then(user => console.log("User created or updated: ", user.toJSON()))
        .catch(error => console.error(error))
    }
    async read(id: number): Promise<UserFields | void | undefined > {
        return this.userModel.findByPk(id)
        .then(user => user?.toJSON())
        .catch(error => console.error(error))
    }
    async readAll(): Promise<UserFields[] | void> {
        return this.userModel.findAll()
        .then(users => users.map(user => user.toJSON()))
        .catch(error => console.error(error));
    }
    async update(item: UserFields): Promise<void> {
        return this.create(item);
    }
    async delete(item: UserFields): Promise<void> {
        return this.userModel.findByPk(item.id)
        .then(user => user?.destroy())
        .catch(error => console.error(error));
    }

}