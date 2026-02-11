import { Op, WhereOptions } from "sequelize";
import { OrmModels } from "../db/OrmModels";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus";
import { IDao } from "../interfaces/db/IDAO";
import { NavPlanQueryFilter } from "../interfaces/db/NavPlanQueryFilter";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest";

/**
 * Data Access Object (DAO) per la gestione delle richieste di navigazione.
 * Fornisce i metodi per l'interazione, per il tramite di Sequelize
 * con la tabella delle richieste/piani di navigazione nel database.
 */

export class NavPlanDAO implements IDao<NavigationRequestAttributes>
{
    private navReqModel;
    constructor()
    {
        this.navReqModel = OrmModels.initModels().NavigationRequest;
    }

    /**
     * Crea una nuova richiesta/piano di navigazione nel database.
     * @param item Oggetto contenente gli attributi della richiesta da creare.
     * @returns Una promessa che risolve con l'istanza della richiesta/piano creata/o.
     */
    async create(item: NavigationRequestAttributes): Promise<NavigationRequestAttributes> {
        return await this.navReqModel.create({
            userId: item.userId,
            motivation: null,
            dateStart: item.dateStart,
            dateEnd: item.dateEnd,
            droneId: item.droneId,
            navigationPlan: item.navigationPlan
        });
    }

    /**
     * Recupera una singola richiesta/piano di navigazione tramite il suo ID.
     * @param field L'identificativo univoco della richiesta.
     * @returns L'istanza trovata o null se non corrispondente ad alcun record.
     */
    async read(field: number): Promise<NavigationRequestAttributes | null> {
        return await this.navReqModel.findOne({where: {id: field}});
    }

    /**
     * Recupera una lista di richieste di navigazione basata su filtri opzionali.
     * @param item Oggetto contenente i parametri di filtraggio.
     * @returns Un array di richieste di navigazione che soddisfano i criteri.
     */
    async readAll(item?: NavPlanQueryFilter): Promise<NavigationRequestAttributes[]> {
        item = item?? {}
        const whereClause: WhereOptions<NavigationRequestAttributes> = {};
        switch(true)
        {
            case true:
                if(item.dateEnd && item.dateStart)
                {
                    whereClause.dateEnd = {[Op.gte]: item.dateStart}
                    whereClause.dateStart = {[Op.lte]: item.dateEnd}
                }
                if(item.dateFrom && item.dateTo)
                {
                    whereClause.submittedAt = {[Op.between]: [item.dateFrom, item.dateTo]};
                }
                else if(item.dateFrom)
                {
                    whereClause.submittedAt = {[Op.gte]: item.dateFrom}
                }
                else if(item.dateTo)
                {
                    whereClause.submittedAt = {[Op.lte]: item.dateTo}
                }
                if(Array.isArray(item.status))
                {
                    let condition: boolean = true;

                    for(const element of item.status)
                    {
                        condition = element? true && condition: false;
                    }

                    if(condition)
                    {
                        whereClause.status = {[Op.in]: item.status}
                    }
                    
                }
                else if(item.status)
                {
                    whereClause.status = {[Op.eq]: item.status}
                }
                if(item.userId)
                {
                    whereClause.userId = {[Op.eq]: item.userId}
                }
                return await this.navReqModel.findAll({where: whereClause});
            default:
                return await this.navReqModel.findAll();
        }
    }

    /**
     * Aggiorna lo solo lo stato o lo stato e la motivazione (se valorizzata) di una richiesta esistente.
     * @param item Oggetto contenente l'ID della richiesta e i campi da modificare.
     * @returns L'istanza aggiornata o null se l'ID non è stato trovato.
     */
    async update(item: NavigationRequestAttributes|NavPlanQueryFilter): Promise<NavigationRequestAttributes | null> {
        if('dateFrom' in item && !Array.isArray(item.status) && item.motivation)
        {
            const [affectedCount, navPlans] = await this.navReqModel.update({ status: item.status, motivation: item.motivation }, {where: {id: item.id}, returning: true});
            if(affectedCount)
            {
                for(const navPlan of navPlans)
                {
                    if(item.id === navPlan.id)
                    {
                        return navPlan;
                    }
                }

            }
            return null;
        }
        else if(!Array.isArray(item.status))
        {
            const [affectedCount, navPlans] = await this.navReqModel.update({ status: item.status }, {where: {id: item.id}, returning: true});
            if(affectedCount)
            {
                for(const navPlan of navPlans)
                {
                    if(item.id === navPlan.id)
                    {
                        return navPlan;
                    }
                }

            }
            return null;
        }
        return null;
    }

 
    /**
     * Rimuove una richiesta di navigazione dal sistema.
     * @param item ID numerico della richiesta o l'intero oggetto attributi.
     * @returns Esito dell'operazione di eliminazione.
     */
    async delete(item: NavigationRequestAttributes | number): Promise<boolean> {
        let affectedCount: number;
        switch(true)
        {
            case typeof(item) === "number":
                affectedCount = await this.navReqModel.destroy({where: {id: item, status: NavPlanReqStatus.PENDING}});
                return affectedCount? true : false;
             default:
                return await this.navReqModel.destroy({where: {id: item.id}})? true : false;
        }
    }

}