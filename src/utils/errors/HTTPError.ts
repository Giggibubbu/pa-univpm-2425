import { HTTPAppMsgMap } from "../../interfaces/HTTPAppMsgMap";
import { HTTPMsgStructure } from "../../interfaces/HTTPMsgStructure";
import { getReasonPhrase } from "http-status-codes";

export class HTTPError extends Error
{
    constructor(readonly statusCode: number, name: string, message:string)
    {
        super(message);
        this.name = name;
    }
    
    toJSON(): HTTPMsgStructure {
        return {
            statusCode: this.statusCode,
            name:this.name,
            message:this.message
        };
    }
}

