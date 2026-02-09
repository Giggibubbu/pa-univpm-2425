import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

export interface ViewNavPlanQS
{
    dateFrom?: Date;
    dateTo?: Date;
    status?: NavPlanReqStatus;
    format?: string;
}