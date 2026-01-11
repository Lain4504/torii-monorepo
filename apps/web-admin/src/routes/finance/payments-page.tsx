import { CreditCard } from 'lucide-react';
import { SystemStasis } from '@/components/layout/system-stasis';

export default function PaymentsPage() {
  return (
    <SystemStasis
      title="Fiscal Matrix"
      description="FINANCIAL CLEARING HOUSE AND GATEWAY CONTROLLER. THE PAYMENT SUB-SYSTEM IS UNDERGOING QUANTUM PROTOCOL UPGRADES. REVENUE STREAMS ARE CURRENTLY ON HOLD."
      icon={CreditCard}
      statusText="Liquidity Stasis"
    />
  );
}
