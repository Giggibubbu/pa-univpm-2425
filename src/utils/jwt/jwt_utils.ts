import fs from "fs/promises";
import { JWT_KEYS_DIRNAME, JWT_PRIVKEY_NAME, JWT_PUBKEY_NAME } from "../env/app_parameters.js";
import { AppErrorName } from "../../enum/AppErrorName.js";
import { AppLogicError } from "../../errors/AppLogicError.js";

export const readJwtKeys = async () => {
    try
    {
        const privKey = await fs.readFile(`./${JWT_KEYS_DIRNAME}/${JWT_PRIVKEY_NAME}`, 'utf-8');
        const pubKey = await fs.readFile(`./${JWT_KEYS_DIRNAME}/${JWT_PUBKEY_NAME}`, 'utf-8');
        return {privKey: privKey, pubKey: pubKey};
    }
    catch(e)
    {
        throw new AppLogicError(AppErrorName.LOGIN_NOT_AVAILABLE);
    }
}