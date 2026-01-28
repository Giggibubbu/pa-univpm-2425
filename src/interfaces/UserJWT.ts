export interface UserJwt {
  email: string;
  role: "user" | "operator" | "admin";
  tokens: number;
}