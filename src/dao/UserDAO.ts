import { OrmModels } from '../connector/OrmModels';
import { User } from '../models/User';
import { IDao } from './IDAO';
export class UserDAO implements IDao<User>
{
    private userModel;
    constructor()
    {
        this.userModel = OrmModels.initModels().user;
        OrmModels.authenticate();
    }

    async create(item: User): Promise<void> {
        return this.userModel.create({
            id: item.id,
            email: item.email,
            role: item.role,
            tokens: item.tokens
        })
        .then(user => console.log("User created or updated: ", user.toJSON()))
        .catch(error => console.error(error))
    }
    async read(id: number): Promise<User> {
        return this.userModel.findByPk(id)
        .then(user => user?.toJSON())
        .catch(error => console.error(error))
    }
    async readAll(): Promise<User[] | void> {
        return this.userModel.findAll()
        .then(users => users.map(user => user.toJSON()))
        .catch(error => console.error(error));
    }
    async update(item: User): Promise<void> {
        return this.create(item);
    }
    async delete(item: User): Promise<void> {
        return this.userModel.findByPk(item.id)
        .then(user => user?.destroy())
        .catch(error => console.error(error));
    }

}