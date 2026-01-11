import { BellRing } from 'lucide-react';
import { SystemStasis } from '@/components/layout/system-stasis';

export default function NotificationsPage() {
  return (
    <SystemStasis
      title="Signal Center"
      description="EVENT PROPAGATION AND NOTIFICATION BROADCAST SYSTEM. BROADCAST CHANNELS ARE BEING REALIGNED TO THE NEW ZEN PROTOCOLS. SYSTEM SIGNALS ARE SILENCED FOR MAINTENANCE."
      icon={BellRing}
      statusText="Silence Active"
    />
  );
}
