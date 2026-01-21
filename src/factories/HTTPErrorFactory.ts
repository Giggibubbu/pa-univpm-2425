import { HTTPError } from "../errors/http/HTTPError";
import { appErrorMessages } from "../utils/messages/messages_utils";
import { HTTPMsgStructure } from "../interfaces/HTTPMsgStructure";

export class HTTPErrorFactory {
    private constructor(){}
    static getError(appErrorName: string):HTTPError {
        if(appErrorName !== undefined)
            {
                const error: HTTPMsgStructure = appErrorMessages[appErrorName];
                return new HTTPError(error.statusCode, error.name, error.message);
            }
        else
            {
                const error: HTTPMsgStructure = appErrorMessages["INTERNAL_SERVER_ERROR"];
                return new HTTPError(error.statusCode, error.name, error.message);
            }
    }
}

