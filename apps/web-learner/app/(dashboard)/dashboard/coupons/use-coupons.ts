'use client';

import { useMyCoupons } from '@/lib/api/services/coupon-api';
import { useGamificationHistory } from '@/lib/api/services/gamification-api';
import { toast } from 'sonner';

export function useCoupons() {
    const { data: coupons, isLoading: couponsLoading } = useMyCoupons();
    const { data: historyData, isLoading: historyLoading } = useGamificationHistory({ limit: 50 });

    const historyItems = Array.isArray(historyData) 
        ? historyData 
        : (historyData as any)?.data || [];

    const gamificationHistory = (historyItems || []).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Đã sao chép mã: ${code}`);
    };

    return {
        coupons,
        couponsLoading,
        gamificationHistory,
        historyLoading,
        handleCopyCode
    };
}
