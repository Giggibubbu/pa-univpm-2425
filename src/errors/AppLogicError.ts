import { AppErrorName } from "../enum/AppErrorName";

export class AppLogicError extends Error
{
    constructor(name:AppErrorName)
    {
        super();
        this.name = name;
        Object.setPrototypeOf(this, AppLogicError.prototype);
    }
}

