"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import { GraphQLProvider } from "./apollo-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GraphQLProvider>
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
    </NextThemesProvider>
    </GraphQLProvider>
  )
}
