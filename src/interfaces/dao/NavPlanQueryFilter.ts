import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

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