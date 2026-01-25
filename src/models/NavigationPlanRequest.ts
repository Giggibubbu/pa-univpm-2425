export interface NavigationPlanRequest
{
    id: number;
    userId: number;
    status: "pending" | "accepted" | "rejected" | "cancelled";
    submittedAt: Date;
    dateStart: Date;
    dateEnd: Date;
    droneId: string;
    navigationPlan: [];
    motivation?: string;
}