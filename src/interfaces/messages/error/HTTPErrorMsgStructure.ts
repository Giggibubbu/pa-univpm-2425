/**
 * Definisce la struttura di base per i messaggi di errore restituiti dall'applicazione.
 */
export interface HTTPErrorMsgStructure
{
    statusCode: number;
    name: string;
    message: string;
}