import { body, param } from "express-validator";
import { DateCompareConst } from "../enum/DateCompareConst";

/**
 * Modulo middleware per la validazione dei dati.
 * Gestisce la logica di validazione e sanificazione dei dati (date, ID) inviati tramite body e params HTTP.
 * Contiene utilities/middleware riutilizzabili in più contesti all'interno dell'applicazione.
 */

/**
 * Verifica se l'intervallo temporale tra due date è superiore a 30 minuti.
 * * @param start - Data di inizio del periodo.
 * @param end - Data di fine del periodo.
 * @returns Esito del controllo (true se la differenza supera i 30 min).
 */

export const validateCompareDates = (start: Date, end: Date) => {
    const diff: DateCompareConst = end.getTime() - start.getTime() 
    return  diff > DateCompareConst.TIME_DIFF_30M_TO_MS;
}

/**
 * Middleware per la validazione dell'ID passato come parametro nell'URL.
 * Verifica che il valore sia un intero positivo e lo converte automaticamente in numero.
 */

export const validateId = param('id')
.isInt({gt: 0}).bail()
.withMessage("Il campo non contiene un numero intero positivo.").bail()
.toInt()