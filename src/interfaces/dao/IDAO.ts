import { ViewNavPlansQS } from "../http-requests/ViewNavPlansQS";

export interface IDao<T>{
    create(item: T): Promise<T>;
    read(field: number | string | T): Promise<T | null>;
    readAll(item?: T, parameter?: string|object|ViewNavPlansQS): Promise<T[]>; 
    update(item: T, field?: number): Promise<T | null>;
    delete(item:T): Promise<boolean>;
}