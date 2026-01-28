import { HTTPMsgStructure } from "../../interfaces/HTTPMsgStructure";

export class HTTPError extends Error
{
    constructor(readonly statusCode: number, name: string, message:string)
    {
        super(message);
        this.name = name;
        this.message = message;
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
    
    toJSON(): HTTPMsgStructure {
        return {
            statusCode: this.statusCode,
            name:this.name,
            message:this.message
        };
    }
}

