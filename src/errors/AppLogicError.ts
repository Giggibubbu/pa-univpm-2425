import { AppErrorName } from "../enum/AppErrorName";

/**
 * Rappresenta un errore specifico della logica di business.
 * Viene utilizzata per sollevare eccezioni interne che non contengono dettagli HTTP,
 * delegando alla factory il compito di tradurle in risposte per il client.
 */

export class AppLogicError extends Error
{
    constructor(name:AppErrorName)
    {
        super();
        this.name = name;
        Object.setPrototypeOf(this, AppLogicError.prototype);
    }
}

