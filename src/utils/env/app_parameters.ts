
export const APP_PORT = process.env.APP_PORT ?? 3000;
export const PGDATABASE = process.env.PGDATABASE ?? "pa2425";
export const PGHOST = process.env.PGHOST ?? "localhost";
export const PGPORT = process.env.PGPORT ?? 5432;
export const PGUSER = process.env.PGUSER ?? "postgres";
export const PGUSERPSW = process.env.PGUSERPSW ?? "postgres";
export const JWT_PRIVKEY_NAME = process.env.JWT_PRIVKEY_NAME ?? "jwtRS256.key";
export const JWT_KEYS_DIRNAME = process.env.JWT_KEYS_PATH ?? "keys";
export const JWT_PUBKEY_NAME = process.env.JWT_PUBKEY_NAME ?? "jwtRS256.key.pub";
