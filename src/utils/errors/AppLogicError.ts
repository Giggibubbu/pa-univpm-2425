export class AppLogicError extends Error
{
    constructor(name:string)
    {
        super();
        this.name = name;
        Object.setPrototypeOf(this, AppLogicError.prototype);
    }
}

