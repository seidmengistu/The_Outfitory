import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme';
import { navItems } from '../../lib/helper/navItems';
import type { SidebarProps } from '../../types/sidebar';

export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation()
  const { theme } = useTheme()

  return (
    <aside
      className={`
      fixed left-0 top-0 h-full
      backdrop-blur-md shadow-lg
      ${theme === 'dark' 
        ? 'bg-gradient-to-b from-[rgba(6,19,45,0.9)] to-[rgba(26,15,46,0.9)] border-purple-500/40 shadow-purple-900/40' 
        : 'bg-gradient-to-b from-slate-50/90 to-purple-50/90 border-purple-300/60 shadow-purple-100/40'
      }
      flex flex-col py-6 z-30
      transition-all duration-300 ease-in-out
      ${isOpen ? 'w-54' : 'w-20'}
      `}
    >
      <div className={`px-6 mb-8 pt-4 ${!isOpen ? 'px-3' : ''}`}>
        {isOpen ? (
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            The Outfitory
          </h1>
        ) : (
          <h1 className="text-lg font-bold text-purple-600 dark:text-purple-400 text-center">
            TO
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-3 w-full px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-4 p-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-purple-100/50 dark:hover:bg-purple-800/30'
                }
                ${!isOpen ? 'justify-center' : ''}
              `}
              title={item.label}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}