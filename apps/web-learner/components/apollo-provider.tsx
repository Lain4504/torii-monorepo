"use client"

import { ApolloProvider } from "@apollo/client"
import { ReactNode, useMemo } from "react"

import { makeApolloClient } from "@workspace/data-access"

export function GraphQLProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => makeApolloClient(), [])
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

