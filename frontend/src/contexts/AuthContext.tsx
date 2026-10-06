import React, { createContext, useState, useEffect, type ReactNode } from 'react'
import { authService } from '../services/auth.service'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/user'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginCredentials) => Promise<void>
    register: (credentials: RegisterCredentials) => Promise<void>
    logout: () => Promise<void>
    error: string | null
    clearError: () => void
    getToken: () => string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const isAuthenticated = !!user

    // Initialize auth state on app load
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = authService.getToken()
                if (token && authService.isAuthenticated()) {
                    // Extract user from token and restore user state
                    const userFromToken = authService.getUserFromToken()
                    
                    if (userFromToken) {
                        setUser({
                            id: userFromToken.sub || userFromToken.user_id || '',
                            username: userFromToken.username || userFromToken.name || '',
                            Email: userFromToken.email || '',
                            Password: '',
                            createdAt: new Date()
                        })
                    }
                } else {
                    // Clear invalid token
                    localStorage.removeItem('token')
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                localStorage.removeItem('token')
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response: AuthResponse = await authService.login(credentials)
            setUser(response.user)
        } catch (error: any) {
            // Handle backend not available error
            if(error.message.includes('Backend server is not available')) {
                setError('Backend server is not running. Please start the backend server to test login functionality.')
            } else {
                setError(error.message)
            }
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (credentials: RegisterCredentials) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response: AuthResponse = await authService.register(credentials)
            // Backend doesn't return a token on registration, so we don't set the user
            // User will be redirected to login page
            // Only set user if we have a token
            if (response.token) {
                setUser(response.user)
            }
        } catch (error: any) {
            // Handle backend not available error
            if(error.message.includes('Backend server is not available')) {
                setError('Backend server is not running. Please start the backend server to test registration functionality.')
            } else {
                setError(error.message)
            }
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            setIsLoading(true)

            await authService.logout()
            setUser(null)
            setError(null)
            // Force redirect to homepage
            window.location.href = '/'
        } catch (error: any) {
            console.error('Logout error:', error)

            setUser(null)
            window.location.href = '/'
        } finally {
            setIsLoading(false)
        }
    }

    const clearError = () => {
        setError(null)
    }

    // Get access token
    const getToken = () => {
        return authService.getToken() 
    }

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
        getToken
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}