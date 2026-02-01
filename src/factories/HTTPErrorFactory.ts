import { HTTPError } from "../errors/HTTPError.js";
import { appErrorMessages } from "../utils/messages/messages_utils.js";

export class HTTPErrorFactory {
    private constructor(){}
    static getError(name: string):HTTPError {
        return new HTTPError(appErrorMessages[name].statusCode, appErrorMessages[name].name, appErrorMessages[name].message)
    }
    
}

