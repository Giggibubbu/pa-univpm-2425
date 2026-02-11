import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

/**
 * Rappresenta una richiesta/piano di navigazione.
 * È presente nella richiesta express e viene utilizzata per mappare i dati validati e sanificati
 * provenienti dal corpo della richiesta HTTP.
 * Viene inoltre utilizzata per la restituzione dei dati al client.
 */

export interface NavPlan
{
    id?: number;
    submittedAt?: Date;
    status?: NavPlanReqStatus;
    motivation?: string|null;
    dateStart?: Date;
    dateEnd?: Date;
    droneId?: string;
    route?: number[][];
}


