import { Point } from "geojson";

export interface NavPlanRequest
{
    id: number;
    userId: number;
    status: "pending" | "accepted" | "rejected" | "cancelled";
    motivation?: string;
    submittedAt: Date;
    navPlan: NavPlan;
}


export interface NavPlan
{
    dateStart: Date;
    dateEnd: Date;
    droneId: string;
    route: Point[];
}