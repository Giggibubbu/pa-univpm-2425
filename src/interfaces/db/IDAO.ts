import { NavPlanQueryFilter } from "./NavPlanQueryFilter";

/**
 * Interfaccia generica per i DAO.
 */

export interface IDao<T>{
    create(item: T): Promise<T>;
    read?(field: number | string | T): Promise<T | null>;
    readAll(item?: T|NavPlanQueryFilter): Promise<T[] | undefined>; 
    update(item: T, field?: number): Promise<T | null>;
    delete(item:T): Promise<boolean|number>;
}