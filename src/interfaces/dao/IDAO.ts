export interface IDao<T>{
    create(item: T): Promise<T>;
    read(field: number | string): Promise<T | null | undefined>;
    readAll(item?: T, parameter?: string): Promise<T[] | void>; 
    update(item: T, field?: number): Promise<T | null>;
    delete(item:T): Promise<Boolean>;
}