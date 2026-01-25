import { HTTPAppMsgMap } from "../../interfaces/HTTPAppMsgMap";
import { HTTPMsgStructure } from "../../interfaces/HTTPMsgStructure";
import { getReasonPhrase } from "http-status-codes";

export class AppLogicError extends Error
{
    constructor(name:string)
    {
        super();
        this.name = name;
    }
}

