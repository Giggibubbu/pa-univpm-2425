import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

/**
 * Interfaccia per il filtraggio delle query relative ai piani di navigazione.
 * Contiene sia attributi dei navplans che parametri contenuti nella query string della richiesta.
 * Viene utilizzata per permettere la costruzione di clausole where dinamiche.
 */

export interface NavPlanQueryFilter
{
    userId?: number
    dateFrom?: Date;
    dateTo?: Date;
    status?: NavPlanReqStatus[]|NavPlanReqStatus;
    format?: string;
    id?: number;
    submittedAt?: Date;
    motivation?: string;
    dateStart?: Date;
    dateEnd?: Date;
    droneId?: string;
    route?: number[][];
}