import { body, param } from "express-validator";
import { DateCompareConst } from "../enum/DateCompareConst.js";

export const validateDate = (date: string) => {
    return body(date)
    .exists()
    .withMessage("Il campo non contiene alcun valore.").bail()
    .isString()
    .withMessage("Il campo non è una stringa.").bail()
    .notEmpty()
    .withMessage("Il campo contiene una stringa vuota.").bail()
    .customSanitizer((value:string) => {
        return value.replace(/\s/g, '');
    })
    .isISO8601()
    .withMessage("Il campo non contiene una stringa avente formato ISO8601").bail()
    .toDate()
    .isAfter()
    .withMessage("Il campo data non contiene un valore successivo alla data odierna.").bail();
}

export const validateCompareDates = (start: Date, end: Date) => {
    const diff: DateCompareConst = end.getTime() - start.getTime() 
    return  diff > DateCompareConst.TIME_DIFF_30M_TO_MS;
}


export const validateId = param('id')
.isInt({gt: 0}).bail()
.withMessage("Il campo non contiene un numero intero positivo.").bail()
.toInt()