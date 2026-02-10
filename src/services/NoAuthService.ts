import { UserDAO } from "../dao/UserDAO";
import { AppErrorName } from "../enum/AppErrorName";
import { UserJwt } from "../interfaces/jwt/UserJwt";
import { UserAttributes } from "../models/sequelize-auto/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { AppLogicError } from "../errors/AppLogicError";
import { AuthRoles } from "../enum/AuthRoles";
import { readJwtKeys } from "../utils/jwt/jwt_utils";
import { HTTPUserLogin } from "../interfaces/http-requests/UserLogin";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest";
import { NoNavigationZoneAttributes } from "../models/sequelize-auto/NoNavigationZone";
import { transformPolygonToArray } from "../utils/geojson_utils";

export class NoAuthService
{
    private userDao: UserDAO;
    private noNavZoneDao: NoNavZoneDAO
    constructor(userDao: UserDAO, noNavZoneDao: NoNavZoneDAO)
    {
        this.noNavZoneDao = noNavZoneDao;
        this.userDao = userDao;
    }

    async loginUser(email:string, password:string): Promise<HTTPUserLogin>
    {
        const user:UserAttributes|null|undefined = await this.userDao.read(email);
        if(!user)
        {
            throw new AppLogicError(AppErrorName.INVALID_CREDENTIALS);
        }
        const isPasswordOk: boolean = await this.comparePassword(password, user.password as string);
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

    viewNoNavZones = async ():Promise<NoNavZone[]> =>
    {
        const noNavZones: NoNavigationZoneAttributes[]|undefined = await this.noNavZoneDao.readAll();
        let arrayNoNavZone: NoNavZone[] = []
        if(noNavZones)
        {
            for(const item of noNavZones)
            {
                arrayNoNavZone.push({
                    id: item.id,
                    operatorId: item.operatorId,
                    validityStart: item.validityStart,
                    validityEnd: item.validityEnd,
                    route: item.route? transformPolygonToArray(item.route) : []
                })
            }
        }
        else
        {
            throw new AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND);
        }
        return arrayNoNavZone;
        

    }

    private async generateJwt(userJwt: UserJwt):Promise<string>
    {
        const jwtSecret = (await readJwtKeys()).privKey
        const jwtToken: string = jwt.sign(userJwt, jwtSecret, {algorithm: "RS256", expiresIn: "1h"});
        return jwtToken;
    }

    private async comparePassword(password: string, dbUserPassword:string): Promise<boolean>
    {
        return await bcrypt.compare(password, dbUserPassword);
    }

}