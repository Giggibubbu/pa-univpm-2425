import { Op, WhereOptions } from "sequelize";
import { OrmModels } from "../db/OrmModels";
import { IDao } from "../interfaces/db/IDAO";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest";
import { NoNavigationZoneAttributes } from "../models/sequelize-auto/NoNavigationZone";

/**
 * Data Access Object (DAO) per la gestione proibite di navigazione.
 * Fornisce i metodi per l'interazione, per il tramite di Sequelize
 * con la tabella delle zone proibite nel database.
 */

export class NoNavZoneDAO implements IDao<NoNavigationZoneAttributes>
{
    private noNavZoneModel;
    constructor()
    {
        this.noNavZoneModel = OrmModels.initModels().NoNavigationZone;
    }

    /**
     * Crea una nuova zona di navigazione proibita nel database.
     * @param item Oggetto contenente i dati della zona (coordinate, date di validità).
     * @returns Una promessa che risolve con l'istanza della zona creata.
     */
    async create(item: NoNavigationZoneAttributes): Promise<NoNavigationZoneAttributes> {
        return await this.noNavZoneModel.create({
            operatorId: item.operatorId,
            route: item.route,
            validityStart: item.validityStart,
            validityEnd: item.validityEnd
        })
    }
    
    /**
     * Recupera le zone proibite attive che si sovrappongono a un intervallo temporale specifico se
     * l'oggetto passato in input è un oggetto di tipo NavigationRequestAttributes, altrimenti
     * se è di tipo NoNavigationZoneAttributes recupera le zone proibite che corrispondono alla rotta specificata.
     * @param item Oggetto contenente le date di inizio e fine per il controllo della sovrapposizione oppure 
     * oggetto contenente la rotta.
     * @returns Un array di zone proibite che risultano attive nel periodo indicato oppure che corrispondono alla rotta specificata.
     */

    async readAll(item?: NoNavigationZoneAttributes | NavigationRequestAttributes): Promise<NoNavigationZoneAttributes[] | undefined> {

        if(item != undefined)
        {
            let whereClause: WhereOptions<NoNavigationZoneAttributes> = {}
            if('userId' in item)
            {
                if(item.dateStart && item.dateEnd)
                {
                    if(item.dateEnd && item.dateStart)
                    {
                        whereClause = {[Op.and]: [{
                            [Op.or]: [
                                { validityEnd: { [Op.gte]: item.dateStart } },
                                { validityEnd: { [Op.eq]: null } }
                            ]
                        },
                        {
                            [Op.or]: [
                                { validityStart: { [Op.lte]: item.dateEnd } },
                                { validityStart: { [Op.eq]: null } }
                            ]
                        }
                        ]
                        };
                        return this.noNavZoneModel.findAll({where: whereClause});
                    } 
                }
            }
            else if('operatorId' in item)
            {
                if(item.route)
                {
                    whereClause = { route: {[Op.eq]: item.route }}
                }
                return this.noNavZoneModel.findAll({where: whereClause});

            }
        }
        else
        {
            const noNavZones = await this.noNavZoneModel.findAll();
            return noNavZones;
        }
        
    }

    /**
     * Aggiorna i le date di una zona di navigazione proibita esistente.
     * @param item Oggetto contenente l'ID della zona e i nuovi parametri da salvare.
     * @returns L'istanza aggiornata o null se l'ID non è stato trovato.
     */
    async update(item: NoNavigationZoneAttributes): Promise<NoNavigationZoneAttributes | null> {
        
        if(item.id)
        {
            if((item.validityEnd === null && item.validityStart === null) || (item.validityEnd && item.validityStart))
            {
                const [affectedCount, noNavPlan] = await this.noNavZoneModel.update({ validityStart: item.validityStart, validityEnd: item.validityEnd }, {where: {id: item.id}, returning: true});
                return noNavPlan[0];
            }

        }
        return null
    }

    /**
     * Elimina definitivamente una zona di navigazione proibita dal database.
     * @param item Oggetto contenente l'ID della zona da rimuovere.
     * @returns Esito dell'operazione di eliminazione.
     */
    async delete(item: NoNavigationZoneAttributes): Promise<boolean | number> {
        if(item.id)
        {
            return await this.noNavZoneModel.destroy({where: {id: item.id}})
        }
        else
        {
            return false;
        }
    }
}