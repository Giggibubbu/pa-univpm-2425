export interface IDao<T>{
    create(item: T): Promise<void>;
    read(id: number): Promise<T | void | undefined>;
    readAll(): Promise<T[] | void>; 
    update(item: T): Promise<void>;
    delete(item:T): Promise<void>;
}