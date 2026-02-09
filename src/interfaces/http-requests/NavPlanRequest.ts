import { NavPlanReqStatus } from "../../enum/NavPlanReqStatus";

export interface NavPlan
{
    id?: number;
    submittedAt?: Date;
    status?: NavPlanReqStatus;
    motivation?: string;
    dateStart: Date;
    dateEnd: Date;
    droneId: string;
    route: number[][];
}


