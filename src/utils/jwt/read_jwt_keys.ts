import fs from "fs";
import { JWT_KEYS_DIRNAME, JWT_PRIVKEY_NAME, JWT_PUBKEY_NAME } from "../env/app_parameters";


export const readJwtKeys = () => 
    {
        // introdurre try e catch

        const JWT_PRIVKEY = fs.readFileSync(`./${JWT_KEYS_DIRNAME}/${JWT_PRIVKEY_NAME}`, 'utf-8')
        const JWT_PUBKEY = fs.readFileSync(`./${JWT_KEYS_DIRNAME}/${JWT_PUBKEY_NAME}`, 'utf-8')
        return {
            privKey: JWT_PRIVKEY,
            pubKey: JWT_PUBKEY
        }
    }
