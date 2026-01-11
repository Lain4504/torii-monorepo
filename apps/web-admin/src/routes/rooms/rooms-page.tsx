import { Box } from 'lucide-react';
import { SystemStasis } from '@/components/layout/system-stasis';

export default function RoomsPage() {
  return (
    <SystemStasis
      title="Space Protocols"
      description="ROOM ALLOCATION AND TEMPORAL SCHEDULING UNIT. ENFORCING PHYSICAL LOGIC CONSTRAINTS. CURRENTLY DEFRAGMENTING SPATIAL SLOTS FOR NEXT SEMESTER ALIGNMENT."
      icon={Box}
      statusText="Spatial Re-Indexing"
    />
  );
}
