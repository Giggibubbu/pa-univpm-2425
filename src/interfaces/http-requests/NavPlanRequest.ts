import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

export interface NavPlan
{
    status?: NavPlanReqStatus;
    motivation?: string;
    submittedAt?: Date;
    dateStart: Date;
    dateEnd: Date;
    droneId: string;
    route: string;
}