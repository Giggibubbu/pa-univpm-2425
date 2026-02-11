/**
 * Associa l'identificativo email di un utente al suo attuale saldo token.
 * Viene utilizzata per il ritorno delle informazioni minimali all'utente
 * dopo aver effettuato la creazione di un piano di navigazione.
 */
export interface UserTokenInterface
{
    email: string;
    tokens: number;
}