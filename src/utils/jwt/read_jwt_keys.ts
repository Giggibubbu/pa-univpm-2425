import fs from "fs";
import { AppParameter } from "../env/AppParameter";


export const readJwtKeys = async () => 
    {

        const JWT_PRIVKEY = fs.readFileSync(`./${AppParameter.JWT_KEYS_DIRNAME}/${AppParameter.JWT_PRIVKEY_NAME}`, 'utf-8')
        const JWT_PUBKEY = fs.readFileSync(`./${AppParameter.JWT_KEYS_DIRNAME}/${AppParameter.JWT_PUBKEY_NAME}`, 'utf-8')
        return {
            privKey: JWT_PRIVKEY,
            pubKey: JWT_PUBKEY
        }
    }
