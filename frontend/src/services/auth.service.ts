import api from '../lib/api'
import type { 
    LoginRequest, 
    RegisterRequest, 
    AuthResponse 
} from '../types/user'

export const authService = {
    // Login user
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const payload = {
                email: credentials.Email,
                password: credentials.Password
            }
            
            const response = await api.post('/login', payload)
            
            const responseData = response.data
            
            if (responseData?.ok && responseData?.data?.access_token) {
                // Store the access token
                localStorage.setItem('token', responseData.data.access_token)
                // Persist client IP if backend provided it (used for geolocation-based features)
                if (responseData.data?.client_ip) {
                    localStorage.setItem('client_ip', responseData.data.client_ip)
                }
                
                // Extract user info from the token
                const userFromToken = this.getUserFromToken()
                
                return {
                    token: responseData.data.access_token,
                    user: {
                        id: userFromToken?.sub || userFromToken?.user_id || '',
                        username: userFromToken?.username || '',
                        Email: credentials.Email,
                        Password: '',
                        createdAt: new Date()
                    }
                }
            } else {
                throw new Error('Invalid response format')
            }
        } catch (error: any) {
            if(error.message.includes('Backend server is not available')) {
                throw new Error('Backend server is not available. Please start the backend server to test login functionality.')
            }
            throw new Error(error.response?.data?.message || 'Login failed')
        }
    },

    // Register user
    async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            const payload = {
                username: userData.username,
                email: userData.Email,
                password: userData.Password
            }
            
            const response = await api.post('/register', payload)
            
            // After successful registration, user needs to login
            return {
                token: '',
                user: {
                    id: '',
                    username: userData.username,
                    Email: userData.Email,
                    Password: '',
                    createdAt: new Date()
                }
            }
        } catch (error: any) {
            if(error.message.includes('Backend server is not available')) {
                throw new Error('Backend server is not available. Please start the backend server to test registration functionality.')
            }
            throw new Error(error.response?.data?.message || 'Registration failed')
        }
    },

    // Logout user
    async logout(): Promise<void> {
        localStorage.removeItem('token')
        localStorage.removeItem('client_ip')
    },

    // Get current token
    getToken(): string | null {
        return localStorage.getItem('token')
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        const token = this.getToken()
        if (!token) return false
        
        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentTime = Date.now() / 1000
            return payload.exp > currentTime
        } catch {
            return false
        }
    },

    // Extract user info from token
    getUserFromToken(): any {
        const token = this.getToken()
    
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                console.log('Token payload:', payload) 
                return payload
            } catch (error) {
                console.error('Error parsing token:', error)
                return null
            }
        }
        return null
    },
    // Get client IP stored at login (if available)
    getClientIp(): string | null {
        return localStorage.getItem('client_ip')
    },
    // Get current user ID from token 
    getCurrentUserId(): string | null {
        const userFromToken = this.getUserFromToken()
        return userFromToken?.sub || null
    },
}