import { AuthRoles } from "../../enum/AuthRoles";

/**
 * Rappresenta il payload contenuto all'interno di un JSON Web Token (JWT).
 * È contenuto nella richiesta express e viene valorizzato dal middleware di autenticazione.
 */
export interface UserJwt {
  email: string;
  role: AuthRoles;
}