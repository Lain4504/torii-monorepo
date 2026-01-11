import { Settings2 } from 'lucide-react';
import { SystemStasis } from '@/components/layout/system-stasis';

export default function SettingsPage() {
  return (
    <SystemStasis
      title="System Prime"
      description="GLOBAL CONFIGURATION ARRAY AND IDENTITY OVERRIDES. ACCESS TO ROOT PREFERENCES IS TEMPORARILY MIGRATED TO THE NEW SECURITY CORE ARCHITECTURE."
      icon={Settings2}
      statusText="Admin Override Mode"
    />
  );
}
