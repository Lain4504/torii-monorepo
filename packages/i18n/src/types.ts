/**
 * Supported languages in the application
 */
export const SUPPORTED_LANGUAGES = {
    vi: 'vi',
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];

/**
 * Translation namespaces for organizing translations
 */
export const NAMESPACES = {
    COMMON: 'common',
    TRANSLATION: 'translation',
    ADMIN: 'admin',
    LEARNER: 'learner',
    MEET: 'meet',
} as const;

export type TranslationNamespace = (typeof NAMESPACES)[keyof typeof NAMESPACES];

/**
 * Language metadata for display purposes
 */
export interface LanguageMetadata {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    flag: string;
}

export const LANGUAGE_METADATA: Record<SupportedLanguage, LanguageMetadata> = {
    vi: {
        code: 'vi',
        name: 'Vietnamese',
        nativeName: 'Tiếng Việt',
        flag: '🇻🇳',
    },
};

/**
 * Default language configuration
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';
export const FALLBACK_LANGUAGE: SupportedLanguage = 'vi';
export const DEFAULT_NAMESPACE: TranslationNamespace = 'common';
