// All types for users will be written here

export interface User {
    id: string
    username: string
    Email: string
    Password: string
    createdAt: Date
}

export interface MessageResponse {
    code: number
    message: string
    data: any
}

export interface ErrorResponse {
    error: string
    details: string
}

export interface LoginRequest {
    Email: string
    Password: string
}

export interface RegisterRequest {
    username: string
    Email: string
    Password: string
}

export interface AuthResponse {
    token: string
    user: User
}

export interface LoginCredentials {
    Email: string
    Password: string
}

export interface RegisterCredentials {
    username: string
    Email: string
    Password: string
}

export interface UpdateUserProfile {
    username?: string
    Email?: string
    Password?: string
}




