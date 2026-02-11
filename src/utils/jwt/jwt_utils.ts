import fs from "fs/promises";
import { JWT_KEYS_DIRNAME, JWT_SECRET, JWT_PUBKEY_NAME } from "../env/app_parameters";
import { AppErrorName } from "../../enum/AppErrorName";
import { AppLogicError } from "../../errors/AppLogicError";


/**
 * Interfaccia utilizzata dall'oggetto restituito da readJwtKeys
 * @property privKey - Chiave privata in formato PEM per firmare i token
 * @property pubKey - Chiave pubblica in formato PEM per verificare i token
 */

export interface JwtKeysCouple
{
    privKey: string;
    pubKey: string;
}

/**
 * Legge le chiavi RSA (pubblica e privata) dal filesystem.
 * Le chiavi vengono caricate dalla directory configurata in JWT_KEYS_DIRNAME.
 * 
 * @returns Coppia di chiavi RSA in formato stringa PEM
 * @throws {AppLogicError} Con nome LOGIN_NOT_AVAILABLE se le chiavi non esistono o non sono leggibili
 */

export const readJwtKeys = async (): Promise<JwtKeysCouple> => {
    try
    {
        const privKey = JWT_SECRET;
        if(!privKey)
        {
            throw new AppLogicError(AppErrorName.LOGIN_NOT_AVAILABLE);
        }
        const pubKey = await fs.readFile(`./${JWT_KEYS_DIRNAME}/${JWT_PUBKEY_NAME}`, 'utf-8');
        return {privKey: privKey, pubKey: pubKey};
    }
    catch(e)
    {

        throw new AppLogicError(AppErrorName.LOGIN_NOT_AVAILABLE);
    }
}