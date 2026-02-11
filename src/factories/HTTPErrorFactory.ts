import { AppErrorName } from "../enum/AppErrorName";
import { HTTPError } from "../errors/HTTPError";
import { appErrorMessages } from "../utils/messages/messages_utils";


/**
 * Factory di errori. Crea un oggetto HTTPError a partire da un nome di errore applicativo.
 * recupera automaticamente i dettagli facendo uso della mappa appErrorMessages,
 * che corrispondentemente all'errore applicativo, contiene un oggetto definito
 * secondo lo standard per la struttura dei messaggi di errore HTTP (HTTPErrorMsgStructure).
 * * @param name - Identificativo univoco dell'errore applicativo (enum AppErrorName).
 * @returns Un'istanza di HTTPError configurata e pronta per essere passata al middleware di gestione errori.
 */
export const errorFactory = (name: AppErrorName):HTTPError => {
    return new HTTPError(
        appErrorMessages[name].statusCode,
        appErrorMessages[name].name,
        appErrorMessages[name].message
);}
