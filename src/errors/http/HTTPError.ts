import { HTTPMsgStructure } from "../../interfaces/HTTPMsgStructure";
import { getReasonPhrase } from "http-status-codes";

export class HTTPError extends Error
{
    readonly statusCode: number;

    constructor(statusCode: number, name: string, message: string)
    {
        super(message);
        this.statusCode = statusCode;
        this.name = getReasonPhrase(statusCode);
    }
    
    getError(): HTTPMsgStructure {
        return {
            statusCode: this.statusCode,
            name:this.name,
            message:this.message
        };
    }
}

