/**
 * Rappresenta la struttura del body della richiesta per 
 * l'effettuazione di ricarica token utente effettuata da un amministratore.
 * Viene dichiarata come opzionale all'interno della richiesta express.
 * È dedicata ad ospitare i dati validati e sanificati del corpo della richiesta HTTP.
 */

export interface AdminChargeToken {
    userId: number,
    tokenToAdd: number
}