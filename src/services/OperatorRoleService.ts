import { Polygon } from "geojson";
import { NavPlanDAO } from "../dao/NavPlanDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";
import { UserDAO } from "../dao/UserDAO";
import { AppErrorName } from "../enum/AppErrorName";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus";
import { AppLogicError } from "../errors/AppLogicError";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest";
import { ViewNavPlanQS } from "../interfaces/http-requests/ViewNavPlanQS";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest";
import { NoNavigationZoneAttributes } from "../models/sequelize-auto/NoNavigationZone";
import { UserAttributes } from "../models/sequelize-auto/User";
import {transformArrayToPolygon, transformPolygonToArray} from "../utils/geo_utils"
import { NavPlanQueryFilter } from "../interfaces/db/NavPlanQueryFilter";

/**
 * Service per le operazioni riservate agli operatori.
 * Gestisce visualizzazione e aggiornamento piani di navigazione, creazione/modifica/eliminazione zone proibite.
 */


export class OperatorRoleService
{
    private userDao: UserDAO;
    private navPlanDao: NavPlanDAO;
    private noNavZoneDao: NoNavZoneDAO;
    constructor(userDao: UserDAO, navPlanDao: NavPlanDAO, noNavZoneDao: NoNavZoneDAO)
    {
        this.userDao = userDao;
        this.navPlanDao = navPlanDao;
        this.noNavZoneDao = noNavZoneDao;
    }

     /**
     * Recupera i piani di navigazione filtrati per stato.
     * 
     * @param query - Parametri di ricerca (status)
     * @returns Lista dei piani di navigazione
     * @throws {AppLogicError} NAVPLAN_VIEW_NOT_FOUND se non ci sono piani con lo stato richiesto
     */

    viewNavPlan = async (query: ViewNavPlanQS): Promise<NavPlan[]> => {


        const navPlans: NavigationRequestAttributes[] = await this.navPlanDao.readAll({status: [query.status as NavPlanReqStatus]});
        const navPlansToReturn: NavPlan[] = []

        if(!navPlans.length)
                {
                    throw new AppLogicError(AppErrorName.NAVPLAN_VIEW_NOT_FOUND);
                }
        
        
                for(const navPlan of navPlans)
                {
                    navPlansToReturn.push({
                        id: navPlan.id,
                        submittedAt: navPlan.submittedAt,
                        status: navPlan.status,
                        motivation: navPlan.motivation,
                        dateStart: navPlan.dateStart,
                        dateEnd: navPlan.dateEnd,
                        droneId: navPlan.droneId,
                        route: navPlan.navigationPlan.coordinates
                    });
                }
        return navPlansToReturn;
        
    }

    /**
     * Crea una nuova zona proibita.
     * Verifica che non esista un'altra zona proibita valorizzata con la stessa rotta.
     * 
     * 
     * @param email - Email dell'operatore che crea la zona
     * @param noNavZone - Dati della zona da creare
     * @returns La zona creata con ID assegnato
     * @throws {AppLogicError} NONAVZONE_CONFLICT se esiste sovrapposizione con altre zone
     */

    createNoNavZone = async (email: string, noNavZone: NoNavZone):Promise<NoNavZone> =>
    {
        let routeBBoxPolygon: Polygon;
        let navPlanToSearch: NoNavigationZoneAttributes;
        const user: UserAttributes|null = await this.userDao.read(email);

        if(noNavZone.route)
        {
            routeBBoxPolygon = transformArrayToPolygon(noNavZone.route);

            if(user?.id && routeBBoxPolygon)
            {
                navPlanToSearch = {
                    id: 0,
                    operatorId: user?.id,
                    route: routeBBoxPolygon,
                    validityStart: noNavZone.validityStart,
                    validityEnd: noNavZone.validityEnd
                }

                const navPlansConflicts: NoNavigationZoneAttributes[]|undefined = await this.noNavZoneDao.readAll(navPlanToSearch);
                
                if(navPlansConflicts && navPlansConflicts.length > 0)
                {
                    throw new AppLogicError(AppErrorName.NONAVZONE_CONFLICT);
                }
                
                const noNavZoneToCreate: NoNavigationZoneAttributes = 
                {
                    operatorId: user.id,
                    route: routeBBoxPolygon,
                    validityStart: noNavZone.validityStart,
                    validityEnd: noNavZone.validityEnd
                }

                const noNavZoneCreated: NoNavigationZoneAttributes = await this.noNavZoneDao.create(noNavZoneToCreate);

                if(noNavZoneCreated.route)
                {
                    const pointBBoxArray: number[][] = transformPolygonToArray(noNavZoneCreated.route)

                    return {
                        id: noNavZoneCreated.id,
                        operatorId: noNavZoneCreated.operatorId,
                        validityStart: noNavZoneCreated.validityStart,
                        validityEnd: noNavZoneCreated.validityEnd,
                        route: pointBBoxArray
                    }
                }
                

            }
        }
        
        return noNavZone;

    }

    /**
     * Aggiorna le date di validità di una zona proibita.
     * Un operatore può modificare la data inizio e fine validità della zona creata inizialmente da un altro operatore.
     * 
     * @param noNavZone - Dati della zona da aggiornare (con nuove date)
     * @returns La zona aggiornata
     * @throws {AppLogicError} NONAVZONE_NOT_FOUND se la zona non esiste
     */
    updateNoNavZone = async (noNavZone: NoNavZone):Promise<NoNavZone> => {
        const noNavZoneToSearch: NoNavigationZoneAttributes = {
            id: noNavZone.id,
            validityStart: noNavZone.validityStart,
            validityEnd: noNavZone.validityEnd
        }

        const noNavZoneSearched: NoNavigationZoneAttributes | null = await this.noNavZoneDao.update(noNavZoneToSearch);

        if(!noNavZoneSearched)
        {
            throw new AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND);
        }

        if(noNavZoneSearched.route)
        {
            const pointBBoxArray = transformPolygonToArray(noNavZoneSearched.route)

            noNavZone = {
                id: noNavZoneSearched.id,
                operatorId: noNavZoneSearched.operatorId,
                validityStart: noNavZoneSearched.validityStart,
                validityEnd: noNavZoneSearched.validityEnd,
                route: pointBBoxArray
            }
        }

        

        return noNavZone
    }

    /**
     * Elimina una zona proibita.
     * Solo l'operatore creatore può eliminare la zona.
     * 
     * @param noNavZone - Zona da eliminare
     * @param email - Email dell'operatore che richiede l'eliminazione
     * @returns true se l'eliminazione ha successo
     * @throws {AppLogicError} NONAVZONE_NOT_FOUND se la zona non esiste o non appartiene all'operatore
     */
    deleteNoNavZone = async (noNavZone: NoNavZone, email: string):Promise<boolean> => {
        const user: UserAttributes| null = await this.userDao.read(email);

        const noNavZoneToDelete: NoNavigationZoneAttributes = {
            id: noNavZone.id,
            operatorId: user?.id
        }
        const deletion = await this.noNavZoneDao.delete(noNavZoneToDelete);


        if(deletion === 1)
        {
            return true;
        }
        else
        {
            throw new AppLogicError(AppErrorName.NONAVZONE_NOT_FOUND);
        }
    }

    /**
     * Aggiorna lo stato di un piano di navigazione (approva, rigetta o cancella).
     * Non permette l'aggiornamento di piani già approvati, rigettati o cancellati.
     * 
     * @param navPlan - Piano con nuovo stato e motivazione opzionale
     * @returns Il piano aggiornato
     * @throws {AppLogicError} FORBIDDEN_NAVPLAN_UPDATE se il piano è già in uno stato finale
     * @throws {AppLogicError} NAVPLAN_UPD_NOT_FOUND se il piano non esiste
     */
    updateNavPlan = async (navPlan: NavPlan):Promise<NavPlan> => {

        if(navPlan.status)
        {
            let navPlanToUpdate: NavPlanQueryFilter;
            let navPlanToSearch: NavigationRequestAttributes|null;

            if(navPlan.id){
                navPlanToSearch = await this.navPlanDao.read(navPlan.id)
                const allowedStatuses = [
                    NavPlanReqStatus.CANCELLED,
                    NavPlanReqStatus.REJECTED,
                    NavPlanReqStatus.APPROVED
                    ];
                if(navPlanToSearch)
                {
                    if(allowedStatuses.includes(navPlanToSearch.status))
                    {
                        throw new AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_UPDATE)
                    }
                }
            }
            

            navPlanToUpdate = {
                id: navPlan.id,
                status: navPlan.status,
            }

            if(navPlan.motivation)
            {
                navPlanToUpdate = {
                    id: navPlan.id,
                    status: navPlan.status,
                    motivation: navPlan.motivation
                }
            }
            
            const navPlanUpdated: NavigationRequestAttributes|null = await this.navPlanDao.update(navPlanToUpdate);

            if(navPlanUpdated)
            {
                const navPlanToReturn: NavPlan = {
                    id: navPlanUpdated.id,
                    submittedAt: navPlanUpdated.submittedAt,
                    status: navPlanUpdated.status,
                    dateStart: navPlanUpdated.dateStart,
                    dateEnd: navPlanUpdated.dateEnd,
                    droneId: navPlanUpdated.droneId,
                    route: navPlanUpdated.navigationPlan.coordinates,
                }
                return navPlanToReturn;
            }
            else
            {
                throw new AppLogicError(AppErrorName.NAVPLAN_UPD_NOT_FOUND)
            }


        }

        return navPlan;

    }
    
}