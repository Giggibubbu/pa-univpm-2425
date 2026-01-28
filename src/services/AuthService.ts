import { UserDAO } from "../dao/UserDAO.js";
import { AppErrorName } from "../enum/AppErrorName.js";
import { UserJwt } from "../interfaces/jwt/UserJwt.js";
import { UserAttributes } from "../models/sequelize-auto/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { readJwtKeys } from "../utils/jwt/jwt_utils.js";
import { AppLogicError } from "../messages/errors/AppLogicError.js";

export class AuthService
{
    private userDao: UserDAO;
    constructor(userDao: UserDAO)
    {
        this.userDao = userDao;
    }

    async loginUser(email:string, password:string): Promise<string>
    {
        const user:UserAttributes|null = await this.userDao.findByEmail(email);
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
            role: user.role,
            tokens: user.tokens
        }
        const jwtToken:string = await this.generateJwt(userJwt);
        return jwtToken;
    }

    private async generateJwt(userJwt: UserJwt):Promise<string>
    {
        const jwtSecret = (await readJwtKeys()).privKey;
        const jwtToken: string = jwt.sign(userJwt, jwtSecret, {algorithm: "RS256", expiresIn: "1h"});
        return jwtToken;
    }

    private async comparePassword(password: string, dbUserPassword:string): Promise<Boolean>
    {
        return await bcrypt.compare(password, dbUserPassword);
    }



}