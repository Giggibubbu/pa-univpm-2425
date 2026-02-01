import { AuthRoles } from "../../enum/AuthRoles";

export interface UserJwt {
  email: string;
  role: AuthRoles;
}