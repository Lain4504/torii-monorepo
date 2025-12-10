import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GraphQLProvider } from './apollo-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GraphQLProvider>
    <App />
    </GraphQLProvider>
  </StrictMode>,
)
