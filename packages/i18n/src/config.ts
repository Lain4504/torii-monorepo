import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
    DEFAULT_LANGUAGE,
    FALLBACK_LANGUAGE,
    DEFAULT_NAMESPACE,
    NAMESPACES,
} from './types';

// Import translation files
import enCommon from './locales/en/common.json';
import enTranslation from './locales/en/translation.json';
import viCommon from './locales/vi/common.json';
import viTranslation from './locales/vi/translation.json';

/**
 * i18next configuration
 * This is the core configuration that will be used by both Vite and Next.js apps
 */
export const i18nConfig = {
    resources: {
        en: {
            [NAMESPACES.COMMON]: enCommon,
            [NAMESPACES.TRANSLATION]: enTranslation,
        },
        vi: {
            [NAMESPACES.COMMON]: viCommon,
            [NAMESPACES.TRANSLATION]: viTranslation,
        },
    },

    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: [NAMESPACES.TRANSLATION, NAMESPACES.COMMON],

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
export const initializeI18n = async () => {
    if (!i18n.isInitialized) {
        await i18n
            .use(LanguageDetector)
            .use(initReactI18next)
            .init(i18nConfig);
    }
    return i18n;
};

export default i18n;
