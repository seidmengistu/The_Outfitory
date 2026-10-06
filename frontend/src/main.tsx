import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { OutfitProvider } from './contexts/OutfitContext.tsx'
import { WardrobeProvider } from './contexts/WardrobeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <WardrobeProvider>
          <OutfitProvider>
            <App />
          </OutfitProvider>
        </WardrobeProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
