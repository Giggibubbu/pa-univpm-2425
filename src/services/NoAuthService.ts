import { UserDAO } from "../dao/UserDAO.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { UserJwt } from "../interfaces/jwt/UserJwt.js";
import { UserAttributes } from "../models/sequelize-auto/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { AppLogicError } from "../errors/AppLogicError.js";
import { AuthRoles } from "../enum/AuthRoles.js";
import { readJwtKeys } from "../utils/jwt/jwt_utils.js";
import { HTTPUserLogin } from "../interfaces/http-requests/UserLogin.js";

export class NoAuthService
{
    private userDao: UserDAO;
    constructor(userDao: UserDAO)
    {
        this.userDao = userDao;
    }

    async loginUser(email:string, password:string): Promise<HTTPUserLogin>
    {
        const user:UserAttributes|null|undefined = await this.userDao.read(email);
        if(!user)
        {
            throw new AppLogicError(AppErrorName.INVALID_CREDENTIALS);
        }
        const isPasswordOk: Boolean = await this.comparePassword(password, user.password);
        if(!isPasswordOk)
        {
            throw new AppLogicError(AppErrorName.INVALID_CREDENTIALS);
        }
        const userJwt: UserJwt = {
            email: user.email,
            role: user.role as AuthRoles
        }
        
        const jwtToken:string = await this.generateJwt(userJwt);

        const loginResponseObject: HTTPUserLogin = {
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role as AuthRoles,
                tokens: user.tokens
            }
        }
        return loginResponseObject
    }

    private async generateJwt(userJwt: UserJwt):Promise<string>
    {
        const jwtSecret = (await readJwtKeys()).privKey
        const jwtToken: string = jwt.sign(userJwt, jwtSecret, {algorithm: "RS256", expiresIn: "1h"});
        return jwtToken;
    }

    private async comparePassword(password: string, dbUserPassword:string): Promise<Boolean>
    {
        return await bcrypt.compare(password, dbUserPassword);
    }

}