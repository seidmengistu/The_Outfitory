// filepath: src/components/layout/MainLayout.tsx
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../../hooks/useAuth'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { getToken } = useAuth()

  const token = getToken()
  const hasValidToken = !!token

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768 
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false) 
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gradient-to-b from-[rgba(6,19,45,1)] to-[#1A0F2E] text-black dark:text-white">
      {/* Sidebar */}
      {hasValidToken && !isMobile && (
        <Sidebar isOpen={isSidebarOpen} />
      )}

      {hasValidToken && isMobile && (
        <>
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          {/* Mobile sidebar */}
          {isSidebarOpen && <Sidebar isOpen={true} />}
        </>
      )}
      
      {/* Header - positioned after sidebar */}
      <Header 
        onToggleSidebar={hasValidToken ? toggleSidebar : undefined}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      
      {/* Main content */}
      <main 
        className={`
          min-h-[calc(100vh-5rem)]
          transition-all duration-300 ease-in-out
          ${hasValidToken && !isMobile
            ? (isSidebarOpen ? 'ml-54 px-6 py-6' : 'ml-20 px-6 py-6')
            : 'p-6'
          }
        `}
      >
        {children}
      </main>
    </div>
  )
}