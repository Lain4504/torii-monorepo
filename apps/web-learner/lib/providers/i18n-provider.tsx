'use client';

import { initializeI18n } from '@workspace/i18n';
import { useEffect, useState } from 'react';

/**
 * I18n initialization component for Next.js
 * This component initializes i18n once when the app loads
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        initializeI18n().then(() => {
            setIsInitialized(true);
        });
    }, []);

    if (!isInitialized) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
}
