
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import './index.css'
import App from './App.tsx'
import { i18n, initializeI18n } from '@workspace/i18n'


// Initialize i18n before rendering
initializeI18n({
    defaultNS: 'admin',
}).then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        </StrictMode>,
    )
});
