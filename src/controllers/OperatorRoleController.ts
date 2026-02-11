import { Request, Response } from "express";
import { AppErrorName } from "../enum/AppErrorName";
import { AppSuccessName } from "../enum/AppSuccessName";
import { AppLogicError } from "../errors/AppLogicError";
import { successFactory } from "../factories/HTTPSuccessFactory";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest";
import { OperatorRoleService } from "../services/OperatorRoleService";

/**
 * Controller per la gestione delle risposte HTTP su rotte che possono ricevere richieste
 * solo da utenti 'operator'.
 */

export class OperatorRoleController
{
    private opRoleService: OperatorRoleService;
    constructor(opRoleService: OperatorRoleService)
    {
        this.opRoleService = opRoleService;
    }


    /**
     * Gestisce la creazione di una nuova zona di navigazione proibita.
     * @param req Oggetto della richiesta HTTP contenente il token e i dati della zona.
     * @param res Oggetto della risposta HTTP, utilizzato per confermare l'avvenuta creazione.
     * @returns Una promessa che si risolve con l'invio della risposta al client.
     * @throws AppLogicError se la creazione della zona fallisce internamente nonostante la validità dei dati.
     */
    createNoNavZone = async (req: Request, res: Response) => {
        let noNavZone: NoNavZone;
        if(req.jwt?.email && req.noNavZone)
        {
            noNavZone = await this.opRoleService.createNoNavZone(req.jwt?.email, req.noNavZone);
            if(noNavZone.id)
            {
                const message = successFactory(AppSuccessName.NONAVZONE_CREATED, noNavZone)
                res.status(message.statusCode).json(message)
            }
            else
            {
                throw new AppLogicError(AppErrorName.INTERNAL_SERVER_ERROR)
            }
        }
    }

    /**
     * Gestisce l'aggiornamento di una zona di navigazione proibita esistente.
     * @param req Oggetto della richiesta HTTP contenente i nuovi dati della zona.
     * @param res Oggetto della risposta HTTP per confermare l'aggiornamento.
     * @returns Una promessa che si risolve con l'esito dell'operazione.
     */

    updateNoNavZone = async (req: Request, res: Response) => {
        if(req.noNavZone)
        {
            const noNavZoneCreated = await this.opRoleService.updateNoNavZone(req.noNavZone);
            if(noNavZoneCreated)
            {
                const message = successFactory(AppSuccessName.NONAVZONE_UPDATED, noNavZoneCreated)
                res.status(message.statusCode).json(message)
            }
        }
    }

    /**
     * Gestisce la cancellazione di una zona di navigazione proibita..
     * @param req Oggetto della richiesta HTTP contenente l'identificativo della zona e il JWT.
     * @param res Oggetto della risposta HTTP.
     * @returns Una promessa che si risolve con la conferma della cancellazione.
     */

    deleteNoNavZone = async (req: Request, res: Response) => {
        if(req.noNavZone && req.jwt)
        {
            const deleted: boolean = await this.opRoleService.deleteNoNavZone(req.noNavZone, req.jwt?.email)
            if(deleted)
            {
                const message = successFactory(AppSuccessName.NONAVZONE_DELETED, {deleted});
                res.status(message.statusCode).json();
            }
        }
        
    }

    /**
     * Gestisce l'aggiornamento di una richiesta/piano di navigazione (approvazione o rifiuto).
     * @param req Oggetto della richiesta HTTP contenente i dati del piano aggiornato.
     * @param res Oggetto della risposta HTTP.
     * @returns Una promessa che si risolve con l'invio del piano aggiornato al client.
     */
    updateNavPlan = async (req: Request, res: Response) => {
        if(req.navPlan)
        {
            const navPlan: NavPlan = await this.opRoleService.updateNavPlan(req.navPlan);
            const message = successFactory(AppSuccessName.NAVPLAN_UPDATED, {navplan: navPlan})
            res.status(message.statusCode).json(message)
        }
        res.status(200).json()
    }

    
}