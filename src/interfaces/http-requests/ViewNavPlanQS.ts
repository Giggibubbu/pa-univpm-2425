import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

/**
 * Contiene i parametri query string opzionali che possono essere utilizzati nella richiesta HTTP 
 * per la visualizzazione dei piani di navigazione.
 * È presente nella richiesta express e viene utilizzata per mappare i dati validati e sanificati
 * provenienti dalla query string della richiesta HTTP.
 */
export interface ViewNavPlanQS
{
    dateFrom?: Date;
    dateTo?: Date;
    status?: NavPlanReqStatus;
    format?: string;
}