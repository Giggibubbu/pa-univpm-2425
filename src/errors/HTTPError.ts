import { HTTPErrorMsgStructure } from "../interfaces/messages/error/HTTPErrorMsgStructure";

/**
 * Rappresenta un errore strutturato pronto per essere inviato via HTTP.
 * Estende la classe Error includendo lo status code e un metodo per la serializzazione JSON.
 */


export class HTTPError extends Error
{
    /**
     * Crea un'istanza di HTTPError.
     * * @param statusCode - Il codice di stato HTTP (es. 404, 500).
     * @param name - Il nome dell'errore (es. "ROUTE_NOT_FOUND").
     * @param message - Descrizione testuale dell'errore.
     */
    constructor(readonly statusCode: number, name: string, message:string)
    {
        super(message);
        this.name = name;
        this.message = message;
        Object.setPrototypeOf(this, HTTPError.prototype);
    }

    /**
     * Serializza l'oggetto errore in un formato compatibile con il body della risposta HTTP.
     * * @returns Un oggetto conforme alla struttura HTTPErrorMsgStructure.
     */
    toJSON(): HTTPErrorMsgStructure {
        return {
            statusCode: this.statusCode,
            name:this.name,
            message:this.message
        };
    }
}

