import { Request, Response } from "express";
import { AppErrorName } from "../enum/AppErrorName";
import { AppSuccessName } from "../enum/AppSuccessName";
import { AuthRoles } from "../enum/AuthRoles";
import { AppLogicError } from "../errors/AppLogicError";
import { successFactory } from "../factories/HTTPSuccessFactory";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest";
import { OperatorRoleService } from "../services/OperatorRoleService";
import { UserRoleService } from "../services/UserRoleService";
import { appSuccessMessages } from "../utils/messages/messages_utils";
import { create } from "xmlbuilder2";

/**
 * Controller per la gestione delle risposte HTTP su rotte autenticate, 
 * che possono ricevere richieste sia da utenti 'user' che 'operator'.
 */
export class UserOpRoleController
{
    private userRoleService: UserRoleService;
    private opRoleService: OperatorRoleService;
    constructor(userRoleService: UserRoleService, opRoleService: OperatorRoleService)
    {
        this.userRoleService = userRoleService;
        this.opRoleService = opRoleService;
    }

    /**
     * Gestisce la visualizzazione dei piani di navigazione filtrati per ruolo.
     * Permette agli utenti di scaricare i piani in formati specifici (es. XML) o riceverli come JSON.
     * Permette agli operatori di visualizzare i piani filtrando eventualmente soltanto per stato.
     * @param req Oggetto della richiesta HTTP contenente il token JWT, il ruolo e i parametri di formattazione.
     * @param res Oggetto della risposta HTTP per l'invio dei dati o del file allegato.
     * @returns Una promessa che si risolve con l'invio della lista dei piani o del file al client.
     * @throws AppLogicError se il ruolo dell'utente non è autorizzato o se mancano i parametri necessari.
     */
    view = async (req: Request, res: Response): Promise<void> => {
        let navPlans: NavPlan[];

        if(req.jwt?.role === AuthRoles.USER && req.viewNavPlanQS){
            navPlans = await this.userRoleService.viewNavPlan(req.jwt.email, req.viewNavPlanQS);
        }
        else if(req.jwt?.role === AuthRoles.OPERATOR && req.viewNavPlanQS){
            navPlans = await this.opRoleService.viewNavPlan(req.viewNavPlanQS);
        }
        else
        {
            throw new AppLogicError(AppErrorName.UNAUTHORIZED_JWT)
        }

        if(req.viewNavPlanQS?.format && req.jwt?.role === AuthRoles.USER)
        {
            res.header('Content-Type', `application/${req.viewNavPlanQS.format}`);
            res.attachment(`navigation-plan.${req.viewNavPlanQS.format}`);

            if(req.viewNavPlanQS.format === "xml")
            {
                const dataForXml = {
                    navPlans: {
                        plan: navPlans.map(item => ({
                            id: item.id,
                            submittedAt: item.submittedAt?.toISOString(),
                            status: item.status,
                            motivation: item.motivation,
                            dateStart: item.dateStart?.toISOString(),
                            dateEnd: item.dateEnd?.toISOString(),
                            droneId: item.droneId,
                            route: {
                                point: item.route?.map(point => ({
                                    lon: point[0],
                                    lat: point[1]
                                }))
                            }
                        })),
                }};
                const data = create(dataForXml);
                const xml = data.end({ prettyPrint: true });
                res.status(appSuccessMessages[AppSuccessName.NAVPLAN_VIEW_SUCCESS].statusCode).send(xml)
            }
            else
            {
                const navPlanToJSON = JSON.stringify(navPlans, null, 2)
                res.status(appSuccessMessages[AppSuccessName.NAVPLAN_VIEW_SUCCESS].statusCode).send(navPlanToJSON);
            }
        }
        else
        {
            const message = successFactory(AppSuccessName.NAVPLAN_VIEW_SUCCESS, {navplans: navPlans});
            res.status(message.statusCode).json(message)

        }
        
    }
}