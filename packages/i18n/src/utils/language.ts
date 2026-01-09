import i18n from '../config';
import { SUPPORTED_LANGUAGES, LANGUAGE_METADATA, type SupportedLanguage } from '../types';

/**
 * Get the current language
 */
export function getCurrentLanguage(): SupportedLanguage {
    return i18n.language as SupportedLanguage;
}

/**
 * Change the current language
 */
export async function changeLanguage(language: SupportedLanguage): Promise<void> {
    await i18n.changeLanguage(language);
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
    return Object.values(SUPPORTED_LANGUAGES);
}

/**
 * Get language metadata by code
 */
export function getLanguageMetadata(code: SupportedLanguage) {
    return LANGUAGE_METADATA[code];
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language: string): language is SupportedLanguage {
    return Object.values(SUPPORTED_LANGUAGES).includes(language as SupportedLanguage);
}

/**
 * Get the browser's preferred language if supported, otherwise return default
 */
export function getBrowserLanguage(): SupportedLanguage {
    const browserLang = navigator.language?.split('-')[0] ?? 'vi';
    return isLanguageSupported(browserLang)
        ? browserLang
        : SUPPORTED_LANGUAGES.vi;
}
