'use client';

import { Suspense } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/plugnmeet-styles.css';
import '@/lib/plugnmeet-helpers/i18n';

import { store } from '@/store/plugnmeet';
import App from '@/components/plugnmeet/app';
import Loading from '@/components/plugnmeet/extra-pages/Loading';

/**
 * PlugNmeet Room Page
 * Main video conferencing room interface
 * 
 * This page integrates the complete PlugNmeet client functionality:
 * - Live video/audio conferencing (LiveKit)
 * - Real-time messaging (NATS)
 * - Whiteboard collaboration
 * - Screen sharing
 * - Breakout rooms
 * - Polls & Q&A
 * - AI-powered features
 * - And more...
 */
export default function RoomPage() {
    return (
        <ReduxProvider store={store}>
            <DndProvider backend={HTML5Backend}>
                <Suspense fallback={<Loading text="Loading room..." />}>
                    <App />
                </Suspense>
                <ToastContainer
                    position="bottom-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </DndProvider>
        </ReduxProvider>
    );
}
