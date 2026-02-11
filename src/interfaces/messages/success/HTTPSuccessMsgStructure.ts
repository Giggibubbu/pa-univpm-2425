/**
 * Rappresenta la struttura standard di una risposta HTTP di successo.
 * Utilizzata per standardizzare la struttura dei dati restituiti al client.
 */

export interface HTTPSuccessMsgStructure
{
    statusCode: number;
    message: string;
    data: object;
}