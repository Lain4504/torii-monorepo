'use client'

import ModernUserSettings from '@/components/settings/modern-user-settings'

export default function SettingsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
            {/* Header section can be handled by the layout or within the modern component */}
            <ModernUserSettings />
        </div>
    )
}
