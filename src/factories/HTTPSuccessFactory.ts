import { AppErrorName } from "../enum/AppErrorName";
import { AppSuccessName } from "../enum/AppSuccessName";
import { HTTPSuccessMsgStructure } from "../interfaces/messages/success/HTTPSuccessMsgStructure";
import { appSuccessMessages } from "../utils/messages/messages_utils";

/**
 * Factory di messaggi di successo che prende un errore applicativo e genera un oggetto
 * appropriato basandosi sulla mappa appSuccessMessages.
 * L'oggetto restituito avrà una struttura definita dall'interfaccia HTTPSuccessMsgStructure.
 * * @param name - Identificativo dell'esito positivo (enum AppSuccessName).
 * @param data - Oggetto contenente i dati effettivi da restituire nel payload.
 * @returns Un oggetto formattato secondo la struttura standard HTTPSuccessMsgStructure.
 */

export const successFactory = (name: AppSuccessName, data:object):HTTPSuccessMsgStructure => 
    {
        return {
            statusCode: appSuccessMessages[name].statusCode,
            message: appSuccessMessages[name].message,
            data: data
        }
    }