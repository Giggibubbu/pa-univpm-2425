import { Request, Response } from "express";
import { AppSuccessName } from "../enum/AppSuccessName";
import { successFactory } from "../factories/HTTPSuccessFactory";
import { NoNavZone } from "../interfaces/http-requests/NoNavZoneRequest";
import { NoAuthService } from "../services/NoAuthService";

/**
 * Controller per la gestione delle risposte HTTP su rotte pubbliche, che quindi
 * non richiedono autenticazione e autorizzazione.
 */

export class NoAuthController
{
    private authService: NoAuthService;
    constructor(authService: NoAuthService)
    {
        this.authService = authService;
    }

    /**
     * Gestisce la procedura di login verificando le credenziali fornite dall'utente.
     * @param req Oggetto della richiesta HTTP contenente email e password nel corpo della richiesta.
     * @param res Oggetto della risposta HTTP per restituire il token di sessione e i dati utente.
     * @returns Una promessa che si risolve con l'invio del messaggio di successo del login.
     */
    login = async (req: Request, res: Response) => {
        if(req.login?.email && req.login.password)
        {
            const loginObject = await this.authService.loginUser(req.login.email, req.login.password);
            const message = successFactory(AppSuccessName.LOGIN_SUCCESS, loginObject);
            res.status(message.statusCode).json(message);
        }
    }

    /**
     * Gestisce il recupero e la visualizzazione delle zone di navigazione proibite attive.
     * @param req Oggetto della richiesta HTTP.
     * @param res Oggetto della risposta HTTP utilizzato per inviare la lista delle zone proibite.
     * @returns Una promessa che si risolve con la restituzione delle zone di navigazione proibite.
     */
    view = async (req: Request, res: Response) => {
        const noNavPlans: NoNavZone[] = await this.authService.viewNoNavZones();
        const message = successFactory(AppSuccessName.NAVPLAN_VIEW_SUCCESS, noNavPlans);
        res.status(message.statusCode).json(message);
    }

}