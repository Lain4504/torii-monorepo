# @workspace/i18n

Shared internationalization (i18n) package for the Torii Nihongo monorepo.

## Features

- 🌍 Multi-language support (Vietnamese, English)
- 🔧 Framework-agnostic core with React bindings
- 📦 Compatible with both Vite and Next.js
- 🎯 Type-safe translation keys
- 🚀 Automatic language detection
- 💾 Language preference persistence

## Installation

This package is already configured in the monorepo workspace. No additional installation needed.

## Usage

### Initialize i18n

**In Vite apps (web-admin):**

```tsx
// src/main.tsx
import { initializeI18n } from '@workspace/i18n';

// Initialize before rendering
await initializeI18n();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
```

**In Next.js apps (web-learner):**

```tsx
// src/app/layout.tsx
'use client';

import { useEffect } from 'react';
import { initializeI18n } from '@workspace/i18n';

export default function RootLayout({ children }) {
  useEffect(() => {
    initializeI18n();
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Use translations

```tsx
import { useTranslation } from '@workspace/i18n';

function MyComponent() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
```

### Change language

```tsx
import { changeLanguage, SUPPORTED_LANGUAGES } from '@workspace/i18n';

function LanguageSwitcher() {
  const handleChange = (lang: string) => {
    changeLanguage(lang as SupportedLanguage);
  };

  return (
    <select onChange={(e) => handleChange(e.target.value)}>
      <option value={SUPPORTED_LANGUAGES.vi}>Tiếng Việt</option>
      <option value={SUPPORTED_LANGUAGES.en}>English</option>
    </select>
  );
}
```

## Translation Namespaces

- `common`: Common UI elements (buttons, navigation, forms, etc.)
- `translation`: Application-specific content

## Adding Translations

1. Add your translation keys to the appropriate JSON file:
   - `src/locales/en/common.json` - English common translations
   - `src/locales/vi/common.json` - Vietnamese common translations
   - `src/locales/en/translation.json` - English app translations
   - `src/locales/vi/translation.json` - Vietnamese app translations

2. Use the translation key in your component:
   ```tsx
   const { t } = useTranslation('common');
   const text = t('your.new.key');
   ```

## Supported Languages

- **Vietnamese (vi)** - Default language
- **English (en)** - Fallback language
