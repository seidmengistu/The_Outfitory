// Theme contextualized provider (Like for light/dark mode)

import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Initialize theme from localStorage or default to light
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme) {
                return savedTheme;
            }
            
            // Check system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            
            return 'light';
        }
        return 'light';
    })

    // Apply tailwindcss theme class to document root
    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")
        root.classList.add(theme)
        localStorage.setItem("theme", theme)
        
        // Also set data-theme attribute for our custom theme system
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme])

    // Toggle between light and dark themes
    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light")
    }

    // Create Material UI theme dynamically
    const muiTheme = createTheme({
        palette: {
            mode: theme,
        },
    })

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <MuiThemeProvider theme={muiTheme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    )
}
