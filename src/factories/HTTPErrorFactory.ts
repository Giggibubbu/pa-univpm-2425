import { AppErrorName } from "../enum/AppErrorName.js";
import { HTTPError } from "../errors/HTTPError.js";
import { appErrorMessages } from "../utils/messages/messages_utils.js";

export const errorFactory = (name: AppErrorName):HTTPError => {
    return new HTTPError(
        appErrorMessages[name].statusCode,
        appErrorMessages[name].name,
        appErrorMessages[name].message
);}
