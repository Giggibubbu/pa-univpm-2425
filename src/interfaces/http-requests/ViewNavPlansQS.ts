import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

export interface ViewNavPlansQS
{
    userId?: number
    dateFrom?: Date;
    dateTo?: Date;
    status?: NavPlanReqStatus;
    format?: string;
}