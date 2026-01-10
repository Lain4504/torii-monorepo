'use client';
import { Languages } from 'lucide-react';
import {
    useTranslation,
    changeLanguage,
    getCurrentLanguage,
    LANGUAGE_METADATA,
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from '@workspace/i18n';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';

/**
 * Language Switcher Component
 * Allows users to switch between Vietnamese and English
 */
export function LanguageSwitcher() {
    useTranslation();
    const currentLang = getCurrentLanguage();

    const handleLanguageChange = async (lang: SupportedLanguage) => {
        await changeLanguage(lang);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline">
                        {LANGUAGE_METADATA[currentLang].nativeName}
                    </span>
                    <span className="sm:hidden">{LANGUAGE_METADATA[currentLang].flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                    <DropdownMenuItem
                        key={lang as string}
                        onClick={() => handleLanguageChange(lang)}
                        className={currentLang === lang ? 'bg-accent' : ''}
                    >
                        <span className="mr-2">{LANGUAGE_METADATA[lang].flag}</span>
                        <span>{LANGUAGE_METADATA[lang].nativeName}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
