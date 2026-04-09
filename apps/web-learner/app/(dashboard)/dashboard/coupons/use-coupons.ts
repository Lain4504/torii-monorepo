'use client';

import { useMyCoupons } from '@/lib/api/services/coupon-api';
import { useGamificationHistory } from '@/lib/api/services/gamification-api';
import { toast } from 'sonner';
import * as React from 'react';

export function useCoupons() {
    const { data: coupons, isLoading: couponsLoading } = useMyCoupons();
    const [historyPage, setHistoryPage] = React.useState(1);
    const historyLimit = 10;
    const { data: historyData, isLoading: historyLoading } = useGamificationHistory({
        page: historyPage,
        limit: historyLimit,
    });

    const historyItems = (historyData as any)?.items ?? (historyData as any)?.data ?? [];

    // Server already paginates/sorts; keep stable order as received.
    const gamificationHistory = (historyItems || []) as any[];
    const historyMeta = {
        page: (historyData as any)?.page ?? historyPage,
        limit: (historyData as any)?.limit ?? historyLimit,
        total: (historyData as any)?.total ?? 0,
        totalPages: (historyData as any)?.totalPages ?? 0,
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Đã sao chép mã: ${code}`);
    };

    return {
        coupons,
        couponsLoading,
        gamificationHistory,
        historyLoading,
        historyMeta,
        historyPage,
        setHistoryPage,
        handleCopyCode
    };
}
