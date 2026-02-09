import { AppErrorName } from "../enum/AppErrorName.js";
import { AppSuccessName } from "../enum/AppSuccessName.js";
import { HTTPSuccessMsgStructure } from "../interfaces/messages/success/HTTPSuccessMsgStructure.js";
import { appSuccessMessages } from "../utils/messages/messages_utils.js";

export const successFactory = (name: AppSuccessName, data:object):HTTPSuccessMsgStructure => 
    {
        return {
            statusCode: appSuccessMessages[name].statusCode,
            message: appSuccessMessages[name].message,
            data: data
        }
    }