export interface IDao<T>{
    create(item: T): Promise<T>;
    read(id: number): Promise<T | void | undefined>;
    readAll(): Promise<T[] | void>; 
    update(item: T): Promise<Boolean>;
    delete(item:T): Promise<void>;
}