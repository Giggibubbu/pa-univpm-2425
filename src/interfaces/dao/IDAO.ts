import { NavigationRequestAttributes } from "../../models/sequelize-auto/NavigationRequest";
import { NavPlanQueryFilter } from "./NavPlanQueryFilter";

export interface IDao<T>{
    create(item: T): Promise<T>;
    read(field: number | string | T): Promise<T | null>;
    readAll(item?: T | NavPlanQueryFilter | NavigationRequestAttributes): Promise<T[] | undefined>; 
    update(item: T, field?: number): Promise<T | null>;
    delete(item:T): Promise<boolean>;
}