import { HTTPSuccessMsgStructure } from "../interfaces/messages/success/HTTPSuccessMsgStructure.js";
import { appSuccessMessages } from "../utils/messages/messages_utils.js";

export class HTTPMessageFactory {
    private constructor(){}
    static getMessage(name: string, data:Object):HTTPSuccessMsgStructure {
        return {
            statusCode: appSuccessMessages[name].statusCode,
            message: appSuccessMessages[name].message,
            data: data
        }
    }
}
