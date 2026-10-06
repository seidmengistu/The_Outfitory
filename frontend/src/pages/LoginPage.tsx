import { Link } from 'react-router-dom';
import LoginForm from '../components/features/auth/LoginForm';

export default function LoginPage() {

  return (
    <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-transparent">
      {/* Header/Card Container */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-600 dark:text-white/70">
            Sign in to your account to continue styling
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border p-8 shadow-lg bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 backdrop-blur-sm">
          <LoginForm />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10 dark:border-white/10" />
              </div>
            
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-white/70">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
