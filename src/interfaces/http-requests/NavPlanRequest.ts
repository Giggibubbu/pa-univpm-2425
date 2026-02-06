import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

export interface NavPlan
{
    id?: number;
    status?: NavPlanReqStatus;
    motivation?: string;
    submittedAt?: Date;
    dateStart: Date;
    dateEnd: Date;
    droneId: string;
    route: Array<Array<number>>;
}