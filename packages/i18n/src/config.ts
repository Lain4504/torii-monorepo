import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
    FALLBACK_LANGUAGE,
    DEFAULT_NAMESPACE,
    NAMESPACES,
} from './types';

// Import translation files
import viCommon from './locales/vi/common.json';
import viTranslation from './locales/vi/translation.json';
import viAdmin from './locales/vi/admin.json';
import viLearner from './locales/vi/learner.json';
import viMeet from './locales/vi/meet';

/**
 * i18next configuration
 * This is the core configuration that will be used by both Vite and Next.js apps
 */
export const i18nConfig = {
    resources: {
        vi: {
            [NAMESPACES.COMMON]: viCommon,
            [NAMESPACES.TRANSLATION]: viTranslation,
            [NAMESPACES.ADMIN]: viAdmin,
            [NAMESPACES.LEARNER]: viLearner,
            [NAMESPACES.MEET]: viMeet,
        },
    },

    lng: 'vi', // Force Vietnamese
    fallbackLng: 'vi',
    defaultNS: DEFAULT_NAMESPACE,
    ns: [NAMESPACES.TRANSLATION, NAMESPACES.COMMON, NAMESPACES.ADMIN, NAMESPACES.LEARNER],

    interpolation: {
        escapeValue: false, // React already does escaping
    },

    detection: {
        // Disable detection or just rely on default
        order: [],
        caches: [],
    },

    // Enable debug mode in development
    debug: false,
};

/**
 * Initialize i18next for client-side applications (Vite, Next.js)
 * Call this function once at app startup
 */
export const initializeI18n = async (config?: Partial<typeof i18nConfig>) => {
    if (!i18n.isInitialized) {
        await i18n
            .use(initReactI18next)
            .init({
                ...i18nConfig,
                ...config,
            });
    }
    return i18n;
};

export default i18n;
