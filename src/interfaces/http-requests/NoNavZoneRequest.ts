/**
 * Rappresenta una zona proibita.
 * È utilizzata nella richiesta express per mappare i dati validati e sanificati provenienti
 * dal corpo della richiesta HTTP.
 * Viene inoltre utilizzata per la restituzione dei dati al client. 
 */
export interface NoNavZone
{
    id?: number
    operatorId?: number;
    validityStart?: Date | null
    validityEnd?: Date | null
    route?: number[][]
}