import { AppErrorName } from "../../../enum/AppErrorName";
import { HTTPErrorMsgStructure } from "./HTTPErrorMsgStructure";

/**
 * Mappa che mette in relazione i nomi degli errori interni dell'applicazione
 * con le rispettive strutture di errore HTTP pronte per essere inviate al client.
 */
export interface HTTPAppErrorMsgMap
{
    messageMap: Record<AppErrorName, HTTPErrorMsgStructure>;
}




