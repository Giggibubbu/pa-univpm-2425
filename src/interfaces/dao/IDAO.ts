export interface IDao<T>{
    create(item: T): Promise<T>;
    read(field: number | string): Promise<T | null | undefined>;
    readAll(item?: T, itemKeyName?: string): Promise<T[] | void>; 
    update(item: T): Promise<Boolean>;
    delete(item:T): Promise<Boolean>;
}