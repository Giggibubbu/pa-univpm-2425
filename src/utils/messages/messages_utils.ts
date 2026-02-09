import { StatusCodes } from "http-status-codes"
import { AppErrorName } from "../../enum/AppErrorName.js"
import { AppErrorMessage } from "../../enum/AppErrorMessage.js"
import { AppSuccessName } from "../../enum/AppSuccessName.js"
import { AppSuccessMessage } from "../../enum/AppSuccessMessage.js"
import { HTTPErrorMsgStructure } from "../../interfaces/messages/error/HTTPErrorMsgStructure.js"
import { HTTPSuccessMsgStructure } from "../../interfaces/messages/success/HTTPSuccessMsgStructure.js"

type HTTPAppErrorMsgMap = Record<AppErrorName, HTTPErrorMsgStructure>;
type HTTPAppSuccessMsgMap = Record<AppSuccessName, HTTPSuccessMsgStructure>

export const appErrorMessages:HTTPAppErrorMsgMap = {
    [AppErrorName.INVALID_CREDENTIALS]: {
        statusCode: StatusCodes.UNAUTHORIZED,
        name: AppErrorName.INVALID_CREDENTIALS,
        message: AppErrorMessage.INVALID_CREDENTIALS
    },
    [AppErrorName.LOGIN_INVALID]: {
        statusCode: StatusCodes.BAD_REQUEST,
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
        statusCode: StatusCodes.UNAUTHORIZED,
        name: AppErrorName.INVALID_JWT,
        message: AppErrorMessage.INVALID_JWT
    },
    [AppErrorName.UNAUTHORIZED_JWT]: {
        statusCode: StatusCodes.UNAUTHORIZED,
        name: AppErrorName.UNAUTHORIZED_JWT,
        message: AppErrorMessage.UNAUTHORIZED_JWT
    },
    [AppErrorName.LOGIN_NOT_AVAILABLE]: {
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        name: AppErrorName.LOGIN_NOT_AVAILABLE,
        message: AppErrorMessage.LOGIN_NOT_AVAILABLE
    },
    [AppErrorName.AUTH_TOKEN_NOTFOUND]: {
        statusCode: StatusCodes.UNAUTHORIZED,
        name: AppErrorName.AUTH_TOKEN_NOTFOUND,
        message: AppErrorMessage.AUTH_TOKEN_NOTFOUND
    },
    [AppErrorName.JWT_EXPIRED]: {
        statusCode: StatusCodes.UNAUTHORIZED,
        name: AppErrorName.JWT_EXPIRED,
        message: AppErrorMessage.TOKEN_EXPIRED
    },
    [AppErrorName.NAVPLAN_REQ_INVALID]: {
        statusCode: StatusCodes.BAD_REQUEST,
        name: AppErrorName.NAVPLAN_REQ_INVALID,
        message: AppErrorMessage.NAVPLAN_REQ_INVALID
    },
    [AppErrorName.NAVPLAN_INVALID]: {
        statusCode: StatusCodes.BAD_REQUEST,
        name: AppErrorName.NAVPLAN_REQ_INVALID,
        message: AppErrorMessage.NAVPLAN_REQ_INVALID
    },
    [AppErrorName.INSUFFICIENT_TOKENS]: {
        statusCode: StatusCodes.FORBIDDEN,
        name: AppErrorName.INSUFFICIENT_TOKENS,
        message: AppErrorMessage.INSUFFICIENT_TOKENS
    },
    [AppErrorName.INVALID_NAVPLAN_DATE]: {
        statusCode: StatusCodes.FORBIDDEN,
        name: AppErrorName.INVALID_NAVPLAN_DATE,
        message: AppErrorMessage.INVALID_NAVPLAN_DATE
    },
    [AppErrorName.FORBIDDEN_AREA_ERROR]: {
        statusCode: StatusCodes.FORBIDDEN,
        name: AppErrorName.FORBIDDEN_AREA_ERROR,
        message: AppErrorMessage.FORBIDDEN_AREA_ERROR
    },
    [AppErrorName.NAVPLAN_CONFLICT]: {
        statusCode: StatusCodes.CONFLICT,
        name: AppErrorName.NAVPLAN_CONFLICT,
        message: AppErrorMessage.NAVPLAN_CONFLICT
    },
    [AppErrorName.FORBIDDEN_NAVPLAN_DELETE]: {
        statusCode: StatusCodes.FORBIDDEN,
        name: AppErrorName.FORBIDDEN_NAVPLAN_DELETE,
        message: AppErrorMessage.FORBIDDEN_NAVPLAN_DELETE
    },
    [AppErrorName.NAVPLAN_DEL_NOT_FOUND]: {
        statusCode: StatusCodes.NOT_FOUND,
        name: AppErrorName.NAVPLAN_DEL_NOT_FOUND,
        message: AppErrorMessage.NAVPLAN_DEL_NOT_FOUND
    },
    [AppErrorName.NAVPLAN_DEL_REQ_INVALID]: {
        statusCode: StatusCodes.BAD_REQUEST,
        name: AppErrorName.NAVPLAN_DEL_REQ_INVALID,
        message: AppErrorMessage.NAVPLAN_DEL_REQ_INVALID
    },
    [AppErrorName.NAVPLAN_VIEW_REQ_INVALID]: {
        statusCode: StatusCodes.BAD_REQUEST,
        name: AppErrorName.NAVPLAN_VIEW_REQ_INVALID,
        message: AppErrorMessage.NAVPLAN_VIEW_REQ_INVALID
    },
    [AppErrorName.NAVPLAN_VIEW_NOT_FOUND]: {
        statusCode: StatusCodes.NOT_FOUND,
        name: AppErrorName.NAVPLAN_VIEW_NOT_FOUND,
        message: AppErrorMessage.NAVPLAN_VIEW_NOT_FOUND
    },
    [AppErrorName.INVALID_NONAVPLAN_CREATE_REQ]: {
        statusCode: StatusCodes.BAD_REQUEST,
        name: AppErrorName.INVALID_NONAVPLAN_CREATE_REQ,
        message: AppErrorMessage.INVALID_NONAVPLAN_CREATE_REQ
    },
    [AppErrorName.NONAVZONE_CONFLICT]: {
        statusCode: StatusCodes.CONFLICT,
        name: AppErrorName.NONAVZONE_CONFLICT,
        message: AppErrorMessage.NONAVZONE_CONFLICT
    }
}

export const appSuccessMessages: HTTPAppSuccessMsgMap = 
{
    [AppSuccessName.LOGIN_SUCCESS]: {
        statusCode: StatusCodes.OK,
        message: AppSuccessMessage.LOGIN_SUCCESS,
        data: {}
    },
    [AppSuccessName.NAVPLAN_REQ_CREATED]: {
        statusCode: StatusCodes.CREATED,
        message: AppSuccessMessage.NAVPLAN_REQ_CREATED,
        data: {}
    },
    [AppSuccessName.NAVPLAN_REQ_DELETED]: {
        statusCode: StatusCodes.NO_CONTENT,
        message: AppSuccessMessage.NAVPLAN_REQ_CREATED,
        data: {}
    },
    [AppSuccessName.NAVPLAN_VIEW_SUCCESS]: {
        statusCode: StatusCodes.OK,
        message: AppSuccessMessage.NAVPLAN_VIEW_SUCCESS,
        data: {}
    },
    [AppSuccessName.NONAVZONE_CREATED]: {
        statusCode: StatusCodes.CREATED,
        message: AppSuccessMessage.NONAVZONE_CREATED,
        data: {}
    }

}