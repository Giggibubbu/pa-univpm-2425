import { Request, Response } from "express";
import { OperatorRoleService } from "../services/OperatorRoleService.js";
import { UserRoleService } from "../services/UserRoleService.js";
import { AuthRoles } from "../enum/AuthRoles.js";
import { NavPlan } from "../interfaces/http-requests/NavPlanRequest.js";
import { appSuccessMessages } from "../utils/messages/messages_utils.js";
import { AppSuccessName } from "../enum/AppSuccessName.js";
import { successFactory } from "../factories/HTTPSuccessFactory.js";
import { create } from "xmlbuilder2";
import { AppLogicError } from "../errors/AppLogicError.js";
import { AppErrorName } from "../enum/AppErrorName.js";


export class UserOpRoleController
{
    private userRoleService: UserRoleService;
    private opRoleService: OperatorRoleService;
    constructor(userRoleService: UserRoleService, opRoleService: OperatorRoleService)
    {
        this.userRoleService = userRoleService;
        this.opRoleService = opRoleService;
    }

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
                res.status(appSuccessMessages[AppSuccessName.NAVPLAN_VIEW_SUCCESS].statusCode).send(JSON.stringify(navPlans, null, 2));
            }
        }
        else
        {
            const message = successFactory(AppSuccessName.NAVPLAN_VIEW_SUCCESS, {navplans: navPlans});
            res.status(message.statusCode).json(message)

        }
        
    }
}