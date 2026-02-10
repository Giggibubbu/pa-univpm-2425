import { AppErrorName } from "../enum/AppErrorName";
import { HTTPError } from "../errors/HTTPError";
import { appErrorMessages } from "../utils/messages/messages_utils";

export const errorFactory = (name: AppErrorName):HTTPError => {
    return new HTTPError(
        appErrorMessages[name].statusCode,
        appErrorMessages[name].name,
        appErrorMessages[name].message
);}
