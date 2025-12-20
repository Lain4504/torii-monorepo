'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import DashboardLayout from '../src/components/layout/DashboardLayout';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </QueryClientProvider>
  );
}
