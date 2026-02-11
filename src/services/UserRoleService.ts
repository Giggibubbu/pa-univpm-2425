import * as turf from "@turf/turf";
import { NavPlanDAO } from "../dao/NavPlanDAO";
import { NoNavZoneDAO } from "../dao/NoNavZoneDAO";
import { UserDAO } from "../dao/UserDAO";
import { AppErrorName } from "../enum/AppErrorName";
import { AppLogicError } from "../errors/AppLogicError";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest";
import { UserJwt } from "../interfaces/jwt/UserJwt";
import { NavigationRequestAttributes } from "../models/sequelize-auto/NavigationRequest";
import { UserAttributes } from "../models/sequelize-auto/User";
import { NavPlanReqStatus } from "../enum/NavPlanReqStatus";
import { DateCompareConst } from "../enum/DateCompareConst";
import { TokenPayment } from "../enum/TokenPayment";
import { UserTokenInterface } from "../interfaces/UserTokenInterface";
import { LineString, Position } from "geojson";
import { ViewNavPlanQS } from "../interfaces/http-requests/ViewNavPlanQS";
import { NavPlanQueryFilter } from "../interfaces/db/NavPlanQueryFilter";

/**
 * Service per la gestione delle operazioni riservate agli utenti autenticati.
 * Gestisce creazione, visualizzazione ed eliminazione dei piani di navigazione,
 * inclusa la validazione delle rotte e la gestione dei token che possono
 * essere ricondotte a logiche di business.
 */
export class UserRoleService
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
     * Verifica che l'utente abbia token sufficienti e scala il costo specificato.
     * 
     * @param user - Dati JWT dell'utente
     * @param cost - Numero di token da scalare
     * @returns L'utente aggiornato con il nuovo saldo token
     * @throws {AppLogicError} INSUFFICIENT_TOKENS se l'utente ha meno di cost token
     * @throws {AppLogicError} INTERNAL_SERVER_ERROR se l'utente non esiste o l'aggiornamento fallisce
     */
    private checkAndDecreaseToken = async (user:UserJwt, cost: TokenPayment):Promise<UserAttributes> =>
    {
        let userUpdated: UserAttributes|null= await this.userDao.read(user.email);
        
        if(userUpdated !== null)
        {
            if(userUpdated.tokens < cost)
            {
                throw new AppLogicError(AppErrorName.INSUFFICIENT_TOKENS);
            }
            else
            {
                userUpdated.tokens = userUpdated.tokens - cost;
                userUpdated = await this.userDao.update(userUpdated);
                if(userUpdated !== null)
                {
                    return userUpdated;
                }
                else
                {
                    throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
                }
            }
        }
        else
        {
            throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Verifica se il piano di navigazione attraversa zone proibite.
     * Controlla ogni punto della rotta per determinare se cade all'interno di zone proibite attive.
     * 
     * @param navPlan - Piano di navigazione da verificare
     * @returns true se la rotta attraversa zone proibite, false altrimenti
     */
    private checkInNoNavZone = async (navPlan: NavPlan):Promise<boolean> =>
    {
        const noNavZoneQueryFilters: NavigationRequestAttributes = {
            userId: 0,
            status: navPlan.status as NavPlanReqStatus,
            submittedAt: navPlan.submittedAt as Date,
            dateStart: navPlan.dateStart as Date,
            dateEnd: navPlan.dateEnd as Date,
            droneId: navPlan.droneId as string,
            navigationPlan: turf.lineString(navPlan.route? navPlan.route:[]).geometry
        }
        const noNavZones = await this.noNavZoneDao.readAll(noNavZoneQueryFilters);
        
        if(noNavZones)
        {
            if(noNavZones.length > 0 && navPlan.route)
            {
                let nPointsInPolygon: number;
                const lineString: LineString = {type: "LineString", coordinates:navPlan.route};
                const navPlanPoints = turf.explode(lineString);
                for(const item of noNavZones)
                {
                    if(item.route)
                    {
                        nPointsInPolygon = turf.pointsWithinPolygon(navPlanPoints, item.route).features.length;  
                        return nPointsInPolygon === 0? false : true;
                    }
                    
                }
            }
        }
        return false;
    }

     /**
     * Verifica che la data di inizio del piano sia almeno 48 ore dopo la data di richiesta.
     * 
     * @param navPlan - Piano di navigazione da validare
     * @returns true se la data è valida (>48h), false altrimenti
     * @throws {AppLogicError} INTERNAL_SERVER_ERROR se le date mancano
     */
    private checkReqDateStart = (navPlan: NavPlan):boolean =>
    {
        let isReqDateValid: boolean;
        
        if(navPlan.submittedAt && navPlan.dateStart)
        {
            const timeValue: DateCompareConst = navPlan.dateStart.getTime() - navPlan.submittedAt.getTime()
            isReqDateValid =  timeValue > DateCompareConst.TIME_DIFF_48H_TO_MS
        }
        else
        {
            throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
        }
        return isReqDateValid;
    }

     /**
     * Verifica se l'utente ha già piani di navigazione approvati o in sospeso
     * che si sovrappongono temporalmente con il nuovo piano.
     * 
     * @param user - Utente richiedente
     * @param navPlan - Piano di navigazione da verificare
     * @returns true se esiste conflitto temporale, false altrimenti
     */

    private checkUserNavPlanConflict = async (user: UserAttributes, navPlan: NavPlan): Promise<boolean> =>
    {
        const navPlanFilters: NavPlanQueryFilter = {
            userId: user.id,
            dateStart: navPlan.dateStart,
            dateEnd: navPlan.dateEnd,
            status: [NavPlanReqStatus.APPROVED, NavPlanReqStatus.PENDING]
        }
        const navPlans = await this.navPlanDao.readAll(navPlanFilters);
        
        return navPlans.length > 0;
    }

    /**
     * Aggiunge token al saldo dell'utente (usato per rimborsi).
     * 
     * @param user - Utente a cui aggiungere i token
     * @param tokens - Numero di token da aggiungere
     * @throws {AppLogicError} INTERNAL_SERVER_ERROR se l'aggiornamento fallisce
     */

    private addToken = async (user: UserAttributes, tokens: TokenPayment): Promise<void> => 
    {
        user.tokens = user.tokens + tokens;
        const userDecreasedTokens = await this.userDao.update(user);
        if(userDecreasedTokens === null)
        {
            throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Crea un nuovo piano di navigazione.
     * Effettua validazioni complete: token sufficienti, data valida (>48h),
     * assenza in zone proibite e conflitti temporali.
     * In caso di validazione fallita, rimborsa i token all'utente.
     * 
     * @param user - Dati JWT dell'utente richiedente
     * @param navPlan - Piano di navigazione da creare
     * @returns Tupla con il piano creato e il nuovo saldo token dell'utente
     * @throws {AppLogicError} INSUFFICIENT_TOKENS se i token sono insufficienti
     * @throws {AppLogicError} INVALID_NAVPLAN_DATE se la data è < 48h dalla richiesta
     * @throws {AppLogicError} FORBIDDEN_AREA_ERROR se la rotta attraversa zone proibite
     * @throws {AppLogicError} NAVPLAN_CONFLICT se esiste sovrapposizione temporale
     */

    createNavPlan = async (user: UserJwt, navPlan: NavPlan): Promise<[NavPlan, UserTokenInterface]> => {
        

        const userDecreasedTokens: UserAttributes = await this.checkAndDecreaseToken(user, TokenPayment.REQ_TOTAL_COST);

        Object.keys(navPlan).forEach(key => {
            if(navPlan[key as keyof NavPlan] === undefined)
            {
                void this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
                throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR);
            }
        });

        const isReqDateValid = this.checkReqDateStart(navPlan);
        if(!isReqDateValid)
        {
            void this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.INVALID_NAVPLAN_DATE);
        }

        const isInNoNavZone = await this.checkInNoNavZone(navPlan);
        if(isInNoNavZone)
        {
            void this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.FORBIDDEN_AREA_ERROR);
        }
        
        const isNavPlanInConflict = await this.checkUserNavPlanConflict(userDecreasedTokens, navPlan);
        if(isNavPlanInConflict)
        {
            void this.addToken(userDecreasedTokens, TokenPayment.NAVPLAN_INVALID_REFUND);
            throw new AppLogicError(AppErrorName.NAVPLAN_CONFLICT);
        }


        const lineString: LineString = {
            type: "LineString",
            coordinates: navPlan.route? navPlan.route:[]
        }

        const navPlanReqToCreate: NavigationRequestAttributes = {
            userId: userDecreasedTokens.id,
            status: NavPlanReqStatus.PENDING,
            motivation: undefined,
            submittedAt: navPlan.submittedAt as Date,
            dateStart: navPlan.dateStart as Date,
            dateEnd: navPlan.dateEnd as Date,
            navigationPlan: lineString,
            droneId: navPlan.droneId as string
        }

        const navPlanToReturn: NavigationRequestAttributes = await this.navPlanDao.create(navPlanReqToCreate)

        return [{
                id: navPlanToReturn.id,
                submittedAt: navPlanToReturn.submittedAt,
                status: navPlanToReturn.status,
                dateStart: navPlanToReturn.dateStart,
                dateEnd: navPlanToReturn.dateEnd,
                droneId: navPlanToReturn.droneId,
                route: navPlanToReturn.navigationPlan.coordinates,
            },
            {
                email: userDecreasedTokens.email,
                tokens: userDecreasedTokens.tokens
            }
        ];
        
    }

    /**
     * Elimina (cancella) un piano di navigazione dell'utente.
     * Solo piani in stato PENDING possono essere cancellati.
     * 
     * @param email - Email dell'utente richiedente
     * @param navPlanId - ID del piano da eliminare
     * @throws {AppLogicError} NAVPLAN_DEL_NOT_FOUND se il piano non esiste
     * @throws {AppLogicError} FORBIDDEN_NAVPLAN_DELETE se il piano non appartiene all'utente o non è PENDING
     */

    deleteNavPlan = async (email: string, navPlanId: number): Promise<void> =>
    {
        const userDeletionReq = await this.userDao.read(email);
        const navPlanToDelete = await this.navPlanDao.read(navPlanId);

        if(userDeletionReq !== null && navPlanToDelete !== null)
        {
            if(navPlanToDelete.userId === userDeletionReq.id)
            {
                if(navPlanToDelete.status === NavPlanReqStatus.PENDING)
                {
                    navPlanToDelete.status = NavPlanReqStatus.CANCELLED;
                    await this.navPlanDao.update(navPlanToDelete);
                    return;
                }
                else
                {
                    throw new AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE);
                }
                
            }
            else
            {
                throw new AppLogicError(AppErrorName.FORBIDDEN_NAVPLAN_DELETE);
            }
            
        }
        else
        {
            throw new AppLogicError(AppErrorName.NAVPLAN_DEL_NOT_FOUND);
        }


    }

    /**
     * Recupera i piani di navigazione dell'utente con filtri opzionali.
     * 
     * @param email - Email dell'utente
     * @param query - Filtri di ricerca (status, date, ecc.)
     * @returns Lista dei piani di navigazione dell'utente
     * @throws {AppLogicError} NAVPLAN_VIEW_NOT_FOUND se non ci sono piani che corrispondono ai filtri
     */

    viewNavPlan = async (email: string, query: ViewNavPlanQS):Promise<NavPlan[]> => {
        const user = await this.userDao.read(email);

        const queryFilters: NavPlanQueryFilter = query as NavPlanQueryFilter;
        queryFilters.userId = user?.id
        const navPlans = await this.navPlanDao.readAll(queryFilters);
        const navPlansToReturn: NavPlan[] = [];

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
}