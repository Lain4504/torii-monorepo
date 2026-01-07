import { createContext, useContext, type ReactNode } from "react"
import { useDarkMode } from "@workspace/ui/hooks/use-dark-mode"

type Theme = "dark" | "light"

type ThemeProviderProps = {
    children: ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const initialState: ThemeProviderState = {
    theme: "dark",
    setTheme: () => null,
    toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
    const { isDarkMode, set, toggle } = useDarkMode({
        localStorageKey: storageKey,
        initializeWithValue: true,
    })

    const theme: Theme = isDarkMode ? "dark" : "light"

    const value = {
        theme,
        setTheme: (newTheme: Theme) => set(newTheme === "dark"),
        toggleTheme: toggle,
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
