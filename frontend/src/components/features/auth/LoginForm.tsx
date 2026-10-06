import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import type { LoginCredentials } from '../../../types/user'
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginCredentials>({
    Email: '',
    Password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.Email || !formData.Password) {
      return
    }

    try {
      await login(formData)
      // Redirect to home dashboard after successful login
      navigate('/')
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="Email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          id="Email"
          name="Email"
          type="email"
          autoComplete="email"
          required
          value={formData.Email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 border-black/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 dark:bg-white/10 dark:text-white dark:placeholder-white/40 dark:border-white/10"
          placeholder="Enter your email"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="Password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <input
          id="Password"
          name="Password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.Password}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 border-black/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 dark:bg-white/10 dark:text-white dark:placeholder-white/40 dark:border-white/10"
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </div>

      {/* <div className="flex items-center justify-between"> */}
        {/* <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded border-black/20 bg-white dark:border-white/20 dark:bg-white/10"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Remember me
          </label>
        </div> */}

        {/* <div className="text-sm">
          <a href="#" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Forgot your password?
          </a>
        </div> */}
      {/* </div> */}

      <button
        type="submit"
        disabled={isLoading || !formData.Email || !formData.Password}
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Signing in...
          </div>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
