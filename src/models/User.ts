export interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'operator' | 'admin';
    tokens: number;
}