import { useTranslation } from '@workspace/i18n';
import { LanguageSwitcher } from '@workspace/ui/components/language-switcher';

export function ExampleUsage() {
    // Use the translation hook
    const { t } = useTranslation('common');

    return (
        <div>
            {/* Language Switcher - Add this to your header/navbar */}
            <LanguageSwitcher />

            {/* Example translations */}
            <h1>{t('app.name')}</h1>
            <p>{t('app.description')}</p>

            {/* Button example */}
            <button>{t('actions.save')}</button>
            <button>{t('actions.cancel')}</button>

            {/* Navigation example */}
            <nav>
                <a href="/">{t('navigation.home')}</a>
                <a href="/courses">{t('navigation.courses')}</a>
                <a href="/profile">{t('navigation.profile')}</a>
            </nav>
        </div>
    );
}
