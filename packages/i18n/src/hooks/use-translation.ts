import { useTranslation as useI18nextTranslation } from 'react-i18next';
import type { TranslationNamespace } from '../types';

/**
 * Type-safe translation hook
 * Wrapper around react-i18next's useTranslation with our namespace types
 * 
 * @example
 * const { t } = useTranslation('common');
 * const greeting = t('app.name'); // "Torii Nihongo"
 */
export function useTranslation(ns?: TranslationNamespace) {
    return useI18nextTranslation(ns);
}
