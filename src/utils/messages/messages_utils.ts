import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { HTTPAppMsgMap } from "../../interfaces/HTTPAppMsgMap"
import { AppErrorMessage } from "../../enum/AppErrorMessage";
import { AppErrorName } from "../../enum/AppErrorName";

export const appErrorMessages: HTTPAppMsgMap = {
    [AppErrorName.INVALID_CREDENTIALS]: {
        statusCode: StatusCodes.UNAUTHORIZED,
        name: AppErrorName.INVALID_CREDENTIALS,
        message: AppErrorMessage.INVALID_CREDENTIALS
    },
    [AppErrorName.LOGIN_INVALID]: {
        statusCode: StatusCodes.UNAUTHORIZED,
        name: AppErrorName.LOGIN_INVALID,
        message: AppErrorMessage.LOGIN_INVALID
    },
    [AppErrorName.INTERNAL_SERVER_ERROR]: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        name: AppErrorName.INTERNAL_SERVER_ERROR,
        message: AppErrorMessage.INTERNAL_SERVER_ERROR
    },
    [AppErrorName.ROUTE_NOT_FOUND]: {
        statusCode: StatusCodes.NOT_FOUND,
        name: AppErrorName.ROUTE_NOT_FOUND,
        message: AppErrorMessage.ROUTE_NOT_FOUND
    },
    [AppErrorName.MALFORMED_REQUEST_BODY]: {
        statusCode: StatusCodes.BAD_REQUEST,
        name: AppErrorName.MALFORMED_REQUEST_BODY,
        message: AppErrorMessage.MALFORMED_REQUEST_BODY
    },
    [AppErrorName.INVALID_JWT]: {
        statusCode: StatusCodes.BAD_REQUEST,
        name: AppErrorName.INVALID_JWT,
        message: AppErrorMessage.INVALID_JWT
    }
}