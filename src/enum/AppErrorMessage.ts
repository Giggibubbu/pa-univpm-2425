export enum AppErrorMessage {
    INVALID_JWT="Il token di autenticazione non è valido.",
    INVALID_CREDENTIALS="Le credenziali inserite non sono corrette.",
    LOGIN_INVALID="Errore di validazione nella richiesta di login.",
    ROUTE_NOT_FOUND="La rotta richiesta non è stata trovata.",
    MALFORMED_REQUEST_BODY="Non è possibile elaborare il corpo della richiesta.",
    INTERNAL_SERVER_ERROR="Il server non è riuscito a gestire correttamente la richiesta",
    LOGIN_NOT_AVAILABLE = "Errore critico: servizio di login del server non disponibile."
}