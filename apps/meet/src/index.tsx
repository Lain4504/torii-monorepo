import React, { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import 'react-toastify/dist/ReactToastify.css';
import './styles/index.css';
import { initializeI18n, NAMESPACES, i18n } from '@workspace/i18n';
import { store } from './store';
import App from './components/app';
import Loading from './components/extra-pages/Loading';

const container = document.getElementById('torii-meet-app');

// Initialize i18n before rendering
initializeI18n({
  defaultNS: NAMESPACES.MEET,
  ns: [NAMESPACES.MEET],
}).then(() => {
  if (container) {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <I18nextProvider i18n={i18n}>
          <ReduxProvider store={store}>
            <DndProvider backend={HTML5Backend}>
              <Suspense fallback={<Loading text="" />}>
                <App />
              </Suspense>
              <ToastContainer />
            </DndProvider>
          </ReduxProvider>
        </I18nextProvider>
      </StrictMode>,
    );
  } else {
    throw new Error(
      "Root element with ID 'torii-meet-app' was not found in the document. Ensure there is a corresponding HTML element with the ID 'torii-meet-app' in your HTML file.",
    );
  }
});
