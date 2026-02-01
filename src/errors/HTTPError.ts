import { HTTPErrorMsgStructure } from "../interfaces/messages/error/HTTPErrorMsgStructure";

export class HTTPError extends Error
{
    constructor(readonly statusCode: number, name: string, message:string)
    {
        super(message);
        this.name = name;
        this.message = message;
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
    
    toJSON(): HTTPErrorMsgStructure {
        return {
            statusCode: this.statusCode,
            name:this.name,
            message:this.message
        };
    }
}

