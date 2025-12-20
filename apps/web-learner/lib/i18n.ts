import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
    // Load translations using http backend
    .use(HttpBackend)
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        backend: {
            // Path to translation files
            loadPath: '/plugnmeet/locales/{{lng}}/translation.json',
        },

        detection: {
            // Order of language detection
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
            // Cache user language
            caches: ['localStorage', 'cookie'],
        },

        // Supported languages
        supportedLngs: [
            'ar-SA', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en', 'es-ES',
            'et-EE', 'fa-IR', 'fi-FI', 'fr-FR', 'he-IL', 'hr-HR', 'hu-HU', 'id-ID',
            'it-IT', 'ja-JP', 'ko-KR', 'lv-LV', 'nl-NL', 'no-NO', 'pl-PL', 'pt-PT',
            'ro-RO', 'ru-RU', 'sv-SE', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'
        ],

        react: {
            useSuspense: true,
        },
    });

export default i18n;
