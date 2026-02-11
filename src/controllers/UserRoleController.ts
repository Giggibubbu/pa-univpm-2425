import { Request, Response } from "express";
import { AppSuccessName } from "../enum/AppSuccessName";
import { successFactory } from "../factories/HTTPSuccessFactory";
import { UserRoleService } from "../services/UserRoleService";

/**
 * Controller per la gestione delle risposte HTTP su rotte autenticate, 
 * che possono ricevere richieste solo da utenti 'user'.
 */

export class UserRoleController
{
    private userRoleService: UserRoleService;
    constructor(userRoleService: UserRoleService)
    {
        this.userRoleService = userRoleService;
    }

    /**
     * Gestisce la creazione di una nuova richiesta/piano di navigazione per l'utente autenticato.
     * @param req Oggetto della richiesta HTTP contenente il token JWT e i dati del piano di navigazione.
     * @param res Oggetto della risposta HTTP per confermare la creazione del piano e aggiornare i dati utente.
     * @returns Una promessa che si risolve con l'invio del messaggio di avvenuta creazione.
     */
    
    create = async (req: Request, res: Response) =>
    {
        if(req.jwt && req.navPlan)
        {
            const navPlanAndUser = await this.userRoleService.createNavPlan(req.jwt, req.navPlan);
            const message = successFactory(AppSuccessName.NAVPLAN_REQ_CREATED, {navplan: navPlanAndUser[0], user: navPlanAndUser[1]});
            res.status(message.statusCode).json(message)

        }
    }

    /**
     * Gestisce la richiesta di eliminazione di una richiesta/piano di navigazione esistente.
     * @param req Oggetto della richiesta HTTP contenente l'email dell'utente e l'ID del piano da eliminare.
     * @param res Oggetto della risposta HTTP per confermare l'avvenuta rimozione.
     * @returns Una promessa che si risolve con l'invio della conferma di cancellazione.
     */
    delete = async (req: Request, res: Response) =>
    {
        if(req.jwt?.email && req.navPlan?.id)
        {
            await this.userRoleService.deleteNavPlan(req.jwt.email, req.navPlan.id);
            const message = successFactory(AppSuccessName.NAVPLAN_REQ_DELETED, {});
            res.status(message.statusCode).json()
        }
    }
}