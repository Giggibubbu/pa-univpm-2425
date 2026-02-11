
/**
 * Configurazione dell'applicazione.
 * 
 * Carica le variabili d'ambiente dal file .env.
 * Se una variabile non è definita, viene usato un valore di default per lo sviluppo locale.
 * 
 * Variabili disponibili:
 * - APP_PORT: Porta del server Express (default: 3000)
 * - PGDATABASE: Nome database PostgreSQL (default: pa2425)
 * - PGHOST: Host PostgreSQL (default: localhost)
 * - PGPORT: Porta PostgreSQL (default: 5432)
 * - PGUSER: Username PostgreSQL (default: postgres)
 * - PGUSERPSW: Password PostgreSQL (default: postgres)
 * - JWT_PRIVKEY_NAME: File chiave privata JWT (default: jwtRS256.key)
 * - JWT_KEYS_DIRNAME: Directory chiavi JWT (default: keys)
 * - JWT_PUBKEY_NAME: File chiave pubblica JWT (default: jwtRS256.key.pub.pem)
 */

export const APP_PORT = process.env.APP_PORT ?? "3000";
export const PGDATABASE = process.env.PGDATABASE ?? "pa2425";
export const PGHOST = process.env.PGHOST ?? "localhost";
export const PGPORT = process.env.PGPORT ?? 5432;
export const PGUSER = process.env.PGUSER ?? "postgres";
export const PGUSERPSW = process.env.PGUSERPSW ?? "postgres";
export const JWT_PRIVKEY_NAME = process.env.JWT_PRIVKEY_NAME ?? "jwtRS256.key";
export const JWT_KEYS_DIRNAME = process.env.JWT_KEYS_PATH ?? "keys";
export const JWT_PUBKEY_NAME = process.env.JWT_PUBKEY_NAME ?? "jwtRS256.key.pub.pem";
