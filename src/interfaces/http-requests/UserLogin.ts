import { AuthRoles } from "../../enum/AuthRoles";

/**
 * Struttura della risposta inviata al client a seguito di un login con successo.
 */
export interface HTTPUserLogin
{
    token: string;
    user: HTTPUser;
}

/**
 * Rappresenta le informazioni di un utente da restituire in output.
 */

export interface HTTPUser
{
    id: number;
    email: string;
    role: AuthRoles;
    tokens: number;
}