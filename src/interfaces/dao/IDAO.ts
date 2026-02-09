import { NavPlanQueryFilter } from "./NavPlanQueryFilter";

export interface IDao<T>{
    create(item: T): Promise<T>;
    read(field: number | string | T): Promise<T | null>;
    readAll(item?: T | NavPlanQueryFilter): Promise<T[]>; 
    update(item: T, field?: number): Promise<T | null>;
    delete(item:T): Promise<boolean>;
}