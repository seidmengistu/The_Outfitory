import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Automatically attach token to every protected request
api.interceptors.request.use((config: any) => {
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, let the browser set the proper multipart boundary
    if (config.data instanceof FormData) {
        if (config.headers) {
            delete config.headers['Content-Type'];
            delete (config.headers as any)['content-type'];
        }
    }
    return config
})

// Handle errors globally
api.interceptors.response.use((response: any) => response, (error: any) =>{
    if(error.response?.status === 401){
        // Clear invalid token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
    }
    
    // Handle network errors when backend is not available
    if(error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // console.warn('Backend server is not available. Running in frontend-only mode.');
        return Promise.reject(new Error('Backend server is not available. Please start the backend server to use full functionality.'));
    }
    
    if(error.response?.status >= 400) {
        // console.error('Backend error:', error.response.status, error.response.data);
        
        const backendData = error.response.data
        let errorMessage = 'Server error'
        
        if (typeof backendData === 'object' && backendData.message) {
            errorMessage = backendData.message
        } else if (typeof backendData === 'string') {
            errorMessage = backendData
        }
        
        const enhancedError = new Error(errorMessage) as any
        enhancedError.response = error.response  
        enhancedError.status = error.response.status  
        
        return Promise.reject(enhancedError)
    }
    
    return Promise.reject(error)
})

export default api