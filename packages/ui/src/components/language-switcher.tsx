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
import { cn } from '@workspace/ui/lib/utils';

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
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl h-9 w-9 transition-all group"
                >
                    <Languages className="size-4 sm:size-5 group-hover:rotate-12 transition-transform duration-500" />
                    <span className="sr-only">Toggle locale</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl p-3 rounded-[2rem] animate-in slide-in-from-top-2 duration-500"
            >
                <div className="px-4 py-3 mb-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/30 italic">System Locale</p>
                </div>
                <div className="space-y-1">
                    {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                        <DropdownMenuItem
                            key={lang as string}
                            onClick={() => handleLanguageChange(lang)}
                            className={cn(
                                "rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center justify-between group/lang",
                                currentLang === lang ? 'bg-primary/10 text-primary' : 'focus:bg-primary/5 focus:text-primary'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm grayscale group-hover/lang:grayscale-0 transition-all duration-500">{LANGUAGE_METADATA[lang].flag}</span>
                                <span>{LANGUAGE_METADATA[lang].nativeName}</span>
                            </div>
                            {currentLang === lang && (
                                <div className="size-1 rounded-full bg-primary animate-pulse" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
