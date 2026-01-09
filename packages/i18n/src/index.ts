// Core exports
export { default as i18n, initializeI18n, i18nConfig } from './config';

// Types
export type {
    SupportedLanguage,
    TranslationNamespace,
    LanguageMetadata,
} from './types';

export {
    SUPPORTED_LANGUAGES,
    LANGUAGE_METADATA,
    DEFAULT_LANGUAGE,
    FALLBACK_LANGUAGE,
    DEFAULT_NAMESPACE,
    NAMESPACES,
} from './types';

// Hooks
export { useTranslation } from './hooks/use-translation';

// Utilities
export {
    getCurrentLanguage,
    changeLanguage,
    getSupportedLanguages,
    getLanguageMetadata,
    isLanguageSupported,
    getBrowserLanguage,
} from './utils/language';
