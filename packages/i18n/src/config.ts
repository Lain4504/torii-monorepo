import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
    FALLBACK_LANGUAGE,
    DEFAULT_NAMESPACE,
    NAMESPACES,
} from './types';

// Import translation files
import enCommon from './locales/en/common.json';
import enTranslation from './locales/en/translation.json';
import enAdmin from './locales/en/admin.json';
import enLearner from './locales/en/learner.json';

import viCommon from './locales/vi/common.json';
import viTranslation from './locales/vi/translation.json';
import viAdmin from './locales/vi/admin.json';
import viLearner from './locales/vi/learner.json';

import enMeet from './locales/en/meet';
import viMeet from './locales/vi/meet';

/**
 * i18next configuration
 * This is the core configuration that will be used by both Vite and Next.js apps
 */
export const i18nConfig = {
    resources: {
        en: {
            [NAMESPACES.COMMON]: enCommon,
            [NAMESPACES.TRANSLATION]: enTranslation,
            [NAMESPACES.ADMIN]: enAdmin,
            [NAMESPACES.LEARNER]: enLearner,
            [NAMESPACES.MEET]: enMeet,
        },
        vi: {
            [NAMESPACES.COMMON]: viCommon,
            [NAMESPACES.TRANSLATION]: viTranslation,
            [NAMESPACES.ADMIN]: viAdmin,
            [NAMESPACES.LEARNER]: viLearner,
            [NAMESPACES.MEET]: viMeet,
        },
    },

    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: [NAMESPACES.TRANSLATION, NAMESPACES.COMMON, NAMESPACES.ADMIN, NAMESPACES.LEARNER],

    interpolation: {
        escapeValue: false, // React already does escaping
    },

    detection: {
        // Order of language detection
        order: ['localStorage', 'navigator', 'htmlTag'],
        // Keys to look up language from
        lookupLocalStorage: 'i18nextLng',
        // Cache user language
        caches: ['localStorage'],
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
            .use(LanguageDetector)
            .use(initReactI18next)
            .init({
                ...i18nConfig,
                ...config,
            });
    }
    return i18n;
};

export default i18n;
