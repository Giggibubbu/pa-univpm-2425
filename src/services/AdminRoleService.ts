import { Console } from "console";
import { UserDAO } from "../dao/UserDAO";
import { AppErrorName } from "../enum/AppErrorName.js";
import { AuthRoles } from "../enum/AuthRoles.js";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AdminChargeToken } from "../interfaces/http-requests/AdminChargeToken.js";
import { HTTPUser } from "../interfaces/http-requests/UserLogin.js";
import { UserAttributes } from "../models/sequelize-auto/User.js";

export class AdminRoleService
{
    private userDao: UserDAO;
    constructor(userDao: UserDAO)
    {
        this.userDao = userDao
    }

    chargeToken = async (user: AdminChargeToken):Promise<HTTPUser> => {
        
        let userToSearch: UserAttributes|null = await this.userDao.read(user.userId);
        console.log(userToSearch)
        if(userToSearch?.tokens)
        {
            const newBalance: number = user.tokenToAdd + userToSearch.tokens
            const userToUpdate: UserAttributes|null = {
                id: userToSearch.id,
                email: userToSearch.email,
                role: "user",
                tokens: newBalance
            }
            const userUpdated: UserAttributes|null = await this.userDao.update(userToUpdate)
            if(userUpdated)
            {
                const userHttp: HTTPUser = {
                    id: userUpdated.id,
                    email: userUpdated.email,
                    role: userUpdated.role as AuthRoles,
                    tokens: userUpdated.tokens
                }
                return userHttp
            }
            else
            {
                throw new AppLogicError(AppErrorName.USER_NOT_FOUND);
            }
        }
        else
        {
            throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
        }
        

       


       
    }
}