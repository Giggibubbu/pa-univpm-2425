import { AppErrorName } from "../enum/AppErrorName";
import { AppSuccessName } from "../enum/AppSuccessName";
import { HTTPSuccessMsgStructure } from "../interfaces/messages/success/HTTPSuccessMsgStructure";
import { appSuccessMessages } from "../utils/messages/messages_utils";

export const successFactory = (name: AppSuccessName, data:object):HTTPSuccessMsgStructure => 
    {
        return {
            statusCode: appSuccessMessages[name].statusCode,
            message: appSuccessMessages[name].message,
            data: data
        }
    }