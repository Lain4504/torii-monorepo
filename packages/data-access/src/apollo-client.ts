import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const getEnv = (key: string): string | undefined => {
  // Next.js / Node (avoid requiring Node types)
  const maybeProcessEnv =
    typeof globalThis !== 'undefined' &&
    (globalThis as any)?.process?.env &&
    typeof (globalThis as any).process.env[key] === 'string'
      ? ((globalThis as any).process.env as Record<string, string>)
      : undefined;
  if (maybeProcessEnv?.[key]) return maybeProcessEnv[key];

  // Vite / browser
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key] as string;
  }
  return undefined;
};

const defaultUri =
  getEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT') ??
  getEnv('VITE_GRAPHQL_ENDPOINT') ??
  'http://localhost:8080/graphql';

export const makeApolloClient = () =>
  new ApolloClient({
    link: new HttpLink({ uri: defaultUri }),
    cache: new InMemoryCache(),
  });

