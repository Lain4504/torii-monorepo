import { Settings2 } from 'lucide-react';
import { SystemStasis } from '@/components/layout/system-stasis';

export default function SettingsPage() {
  return (
    <SystemStasis
      title="Settings"
      description="Manage global configurations and preferences for the Torii ecosystem."
      icon={Settings2}
      statusText="Admin Settings"
    />
  );
}
