import { AuthRoles } from "../../enum/AuthRoles";

export interface HTTPUserLogin
{
    token: string;
    user: HTTPUser;
}

export interface HTTPUser
{
    id: number;
    email: string;
    role: AuthRoles;
    tokens: number;
}