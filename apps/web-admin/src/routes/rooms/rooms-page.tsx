import { Box } from 'lucide-react';
import { SystemStasis } from '@/components/layout/system-stasis';

export default function RoomsPage() {
  return (
    <SystemStasis
      title="Room Management"
      description="Manage room allocation and scheduling for courses and events."
      icon={Box}
      statusText="Coming Soon"
    />
  );
}
