import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import Loader from '../../ui/Loader'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, getToken } = useAuth()
  const location = useLocation()

  // Check token validity on each protected route access and if token does not exist, return to login
  useEffect(() => {
    if (requireAuth) {
      const token = getToken()
      if (!token) {
        return
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Date.now() / 1000
        
        if (payload.exp && payload.exp < currentTime) {
          // Token expired, logout user
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      } catch (error) {
        // Invalid token format
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
  }, [requireAuth, getToken, location.pathname])

  // Show loading spinner while checking auth
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <Loader label="Loading..." />
      </div>
    )
  }

  // Redirect to login if not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    // Save current location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Redirect authenticated users away from auth pages
  if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}