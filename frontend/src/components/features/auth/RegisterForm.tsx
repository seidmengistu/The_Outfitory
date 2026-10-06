import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import type { RegisterCredentials } from '../../../types/user'
import { useNavigate } from 'react-router-dom'

export default function RegisterForm() {
  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
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


    console.log('Submitting registration form with data:', formData)
    
    if (!formData.username || !formData.Email || !formData.Password) {
      return
    }

    try {
      console.log("Before registration")
      await register(formData)
      console.log("After registration")

      // Redirect to login page after successful registration
      navigate('/login')
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration failed:', error)
    }
  }

  console.log("Finished the registration")

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 border-black/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 dark:bg-white/10 dark:text-white dark:placeholder-white/40 dark:border-white/10"
          placeholder="Enter your username"
          disabled={isLoading}
        />
      </div>

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
          autoComplete="new-password"
          required
          value={formData.Password}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 border-black/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 dark:bg-white/10 dark:text-white dark:placeholder-white/40 dark:border-white/10"
          placeholder="Create a password"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded border-black/20 bg-white dark:border-white/20 dark:bg-white/10"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          I agree to the{' '}
          <a href="#" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
            Privacy Policy
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.username || !formData.Email || !formData.Password}
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Creating account...
          </div>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
}