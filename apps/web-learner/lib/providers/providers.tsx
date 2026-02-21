"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import StoreProvider from "@/store/provider"

const queryClient = new QueryClient()

import { AuthInitializer } from "@/store/auth-initializer"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthInitializer>
        <QueryClientProvider client={queryClient}>
          <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </NextThemesProvider>
        </QueryClientProvider>
      </AuthInitializer>
    </StoreProvider>
  )
}
