/**
 * Rappresenta struttura del body della richiesta di login da parte di un utente generico.
 * È presente nella richiesta express e viene utilizzata per mappare i dati validati e sanificati
 * provenienti dal corpo della richiesta HTTP.
 */
export interface ILogin
{
    email: string;
    password: string;
}