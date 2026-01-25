export class AppParameter
{
    static APP_PORT = process.env.APP_PORT || 3000;
    static PGDATABASE = process.env.PGDATABASE || "pa2425";
    static PGHOST = process.env.PGHOST || "localhost";
    static PGPORT = process.env.PGPORT || 5432;
    static PGUSER = process.env.PGUSER || "postgres";
    static PGUSERPSW = process.env.PGUSERPSW || "postgres";
    static JWT_PRIVKEY_NAME = process.env.JWT_PRIVKEY_NAME || "jwtRS256.key"
    static JWT_KEYS_DIRNAME = process.env.JWT_KEYS_PATH || "keys"
    static JWT_PUBKEY_NAME = process.env.JWT_PUBKEY_NAME || this.JWT_PRIVKEY_NAME + ".pub"
}
