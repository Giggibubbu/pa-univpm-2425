import { getReasonPhrase, StatusCodes } from "http-status-codes";
import {HTTPAppMsgMap} from "../../interfaces/HTTPAppMsgMap"

export const appErrorMessages: HTTPAppMsgMap = {
    "INVALID_CREDENTIALS": {
        statusCode: StatusCodes.UNAUTHORIZED,
        name: getReasonPhrase(StatusCodes.UNAUTHORIZED),
        message: "Le credenziali inserite non sono corrette."
    },
    "INTERNAL_SERVER_ERROR": {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        name: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        message: "Impossibile completare l'operazione a causa di un errore interno del sistema."
    },
    "ROUTE_NOT_FOUND": {
        statusCode: StatusCodes.NOT_FOUND,
        name: getReasonPhrase(StatusCodes.NOT_FOUND),
        message: "La rotta richiesta non è stata trovata."
    },
    "MALFORMED_REQUEST_BODY": {
        statusCode: StatusCodes.BAD_REQUEST,
        name: getReasonPhrase(StatusCodes.BAD_REQUEST),
        message: "Il corpo della richiesta non è valido."
    }
}