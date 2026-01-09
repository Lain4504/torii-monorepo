// Core exports
export { default as i18n, initializeI18n, i18nConfig } from './config.js';

// Types
export type {
    SupportedLanguage,
    TranslationNamespace,
    LanguageMetadata,
} from './types.js';

export {
    SUPPORTED_LANGUAGES,
    LANGUAGE_METADATA,
    DEFAULT_LANGUAGE,
    FALLBACK_LANGUAGE,
    DEFAULT_NAMESPACE,
    NAMESPACES,
} from './types.js';

// Hooks
export { useTranslation } from './hooks/use-translation.js';

// Utilities
export {
    getCurrentLanguage,
    changeLanguage,
    getSupportedLanguages,
    getLanguageMetadata,
    isLanguageSupported,
    getBrowserLanguage,
} from './utils/language.js';
