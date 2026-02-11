
import { Op } from 'sequelize';
import { OrmModels } from '../db/OrmModels';
import { IDao } from '../interfaces/db/IDAO';
import { UserAttributes } from '../models/sequelize-auto/User';

/**
 * Data Access Object (DAO) per la gestione degli utenti.
 * Fornisce i metodi per l'interazione, per il tramite di Sequelize
 * con la tabella degli utenti nel database.
 */

export class UserDAO implements IDao<UserAttributes>
{
    private userModel;
    constructor()
    {
        this.userModel = OrmModels.initModels().User;
    }

    /**
     * Registra un nuovo utente nel sistema.
     * @param item Oggetto contenente i dati del profilo utente (email, password, ruolo, token).
     * @returns Una promessa che risolve con l'istanza dell'utente creato.
     */

    async create(item: UserAttributes): Promise<UserAttributes> {
        return await this.userModel.create({
            id: item.id,
            email: item.email,
            password: item.password,
            role: item.role,
            tokens: item.tokens
        });
    }

    /**
     * Ricerca un utente specifico tramite email o identificativo numerico a seconda
     * del tipo dell'argomento passato.
     * @param field L'indirizzo email o l'ID univoco dell'utente.
     * @returns L'istanza dell'utente trovato o null se la ricerca non produce risultati.
     */
    async read(field: number | string): Promise<UserAttributes | null> {
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

    /**
     * Recupera la lista degli utenti, con possibilità di filtrare per un campo specifico.
     * @param item Oggetto contenente il valore del filtro da applicare.
     * @param itemKeyName Il nome della colonna su cui applicare il filtro di uguaglianza.
     * @returns Un array di utenti che soddisfano i criteri di ricerca o la lista completa.
     */

    async readAll(item?: UserAttributes, itemKeyName?: string): Promise<UserAttributes[]> {
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

    /**
     * Aggiorna esclusivamente il saldo token di un utente esistente.
     * @param item Oggetto contenente l'ID dell'utente e il nuovo valore dei token.
     * @returns L'istanza dell'utente aggiornata o null se l'utente non viene trovato.
     */

    async update(item: UserAttributes): Promise<UserAttributes | null> {
        const [affectedCount, users] = await this.userModel.update({ tokens: item.tokens }, {where: {id: item.id}, returning: true});
        if(affectedCount)
        {
            for(const user of users)
            {
                if(item.id === user.id)
                {
                    return user;
                }
            }

        }
        return null;
    }

    /**
     * Verifica l'esistenza di un utente nel sistema.
     * @param item Oggetto contenente l'identificativo dell'utente da verificare.
     * @returns Vero se l'utente esiste, falso altrimenti.
     */
    async delete(item: UserAttributes): Promise<boolean>
    {
        const user = await this.userModel.findByPk(item.id)
        if(user === null)
        {
                return false;
        }
        return true;
    }
}