import { HTTPError } from "../utils/errors/HTTPError";
import { appErrorMessages } from "../utils/messages/messages_utils";
import { HTTPMsgStructure } from "../interfaces/HTTPMsgStructure";
import { AppErrorName } from "../enum/AppErrorName";

export class HTTPErrorFactory {
    private constructor(){}
    static getError(name: string):HTTPError {
        return new HTTPError(appErrorMessages[name].statusCode, appErrorMessages[name].name, appErrorMessages[name].message)
    }
}

