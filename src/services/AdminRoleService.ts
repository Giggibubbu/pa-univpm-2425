import { UserDAO } from "../dao/UserDAO";
import { AppErrorName } from "../enum/AppErrorName";
import { AuthRoles } from "../enum/AuthRoles";
import { AppLogicError } from "../errors/AppLogicError";
import { AdminChargeToken } from "../interfaces/http-requests/AdminChargeToken";
import { HTTPUser } from "../interfaces/http-requests/UserLogin";
import { UserAttributes } from "../models/sequelize-auto/User";

/**
 * Service per la gestione delle operazioni amministrative.
 * Gestisce funzionalità riservate agli amministratori come la ricarica dei token.
 */

export class AdminRoleService
{
    private userDao: UserDAO;
    constructor(userDao: UserDAO)
    {
        this.userDao = userDao
    }

    /**
     * Ricarica i token di un utente.
     * Aggiunge i token specificati al saldo esistente dell'utente.
     * 
     * @param user - Dati della ricarica. (ID utente e quantità di token da aggiungere)
     * @returns L'utente aggiornato con il nuovo saldo token.
     * @throws {AppLogicError} USER_NOT_FOUND se l'utente non esiste.
     * @throws {AppLogicError} INTERNAL_SERVER_ERROR se l'utente non ha il campo tokens.
     */

    chargeToken = async (user: AdminChargeToken):Promise<HTTPUser> => {
        
        let userToSearch: UserAttributes|null = await this.userDao.read(user.userId);

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