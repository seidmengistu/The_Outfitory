import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { User, Menu, ChevronDown, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Person } from '@mui/icons-material';

interface HeaderProps {
  onToggleSidebar?: () => void;  
  isSidebarOpen?: boolean;       
  isMobile?: boolean;
}

export default function Header({ onToggleSidebar, isSidebarOpen = true, isMobile = false }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout, getToken, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = getToken()
  const hasValidToken = !!token

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className={`
        sticky top-0 z-40 transition-all duration-300 ease-in-out
        backdrop-blur-md 
        ${theme === 'dark' 
          ? 'bg-transparent' 
          : 'bg-transparent'
        }
        ${hasValidToken && !isMobile
          ? (isSidebarOpen ? 'ml-54' : 'ml-20') 
          : '' 
        }
      `}
    >
      <div className="px-6">
        <div className="flex justify-between items-center py-4">
          
          <div className="flex items-center gap-4">
            {(!hasValidToken || isMobile) && (
              <Link to="/" className="flex items-center">
                <h1 className="text-xl font-bold text-black dark:text-white">
                  The Outfitory
                </h1>
              </Link>
            )}

          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-4 ml-auto">
            {hasValidToken ? (
              <>
                {/* Hamburger menu - only on mobile */}
                {isMobile && onToggleSidebar && (
                  <button
                    onClick={onToggleSidebar}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                    aria-label="Toggle sidebar"
                  >
                    <Menu size={24} />
                  </button>
                )}

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  >
                    <Person fontSize="small" />
                    <span className="hidden sm:block">{user?.username}</span>
                    <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${theme === 'dark'
                      ? 'bg-gray-800/95 backdrop-blur-md border-gray-700'
                      : 'bg-white/95 backdrop-blur-md border-gray-200'
                      }`}>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme toggle */}
                <Button
                  variant="outlined"
                  onClick={toggleTheme}
                  size="small"
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    backgroundColor: 'transparent',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    color: theme === 'dark' ? 'white' : 'black',
                    '&:hover': {
                      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    }
                  }}
                >
                  {theme === "light" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Navigation for non-authenticated users */}
                <nav className="hidden md:flex items-center space-x-8">
                  <Link to="/about-us" className={`transition-colors ${theme === 'dark'
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}>
                    About
                  </Link>
                  <Link to="/features" className={`transition-colors ${theme === 'dark'
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}>
                    Features
                  </Link>
                  <Link to="/contact" className={`transition-colors ${theme === 'dark'
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}>
                    Contact
                  </Link>
                </nav>

                {/* Theme toggle */}
                <Button
                  variant="outlined"
                  onClick={toggleTheme}
                  size="small"
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    backgroundColor: 'transparent',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    color: theme === 'dark' ? 'white' : 'black',
                    '&:hover': {
                      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    }
                  }}
                >
                  {theme === "light" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}