'use client';

import { useState } from 'react';
import type { RefundResponseDTO, RefundQueryDTO } from '@workspace/schemas';
import { RefundStatus } from '@workspace/schemas';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { PageHeader } from '@/components/common/page-header';
import { RefundsPrimaryToolbar } from '@/components/refunds/refunds-primary-toolbar';
import { RefundsTable } from '@/components/refunds/refunds-table';
import { RefundDetailDialog } from '@/components/refunds/refund-detail-dialog';
import { ChangeRefundStatusDialog } from '@/components/refunds/change-refund-status-dialog';
import { useRefunds } from '@/lib/api/services/refunds';
import { SmartPagination } from "@/components/common/smart-pagination";

export default function RefundsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [statusFilter, setStatusFilter] = useState<RefundStatus | ''>('');

    const [viewingRefund, setViewingRefund] = useState<RefundResponseDTO | null>(null);
    const [changingStatusRefund, setChangingStatusRefund] = useState<RefundResponseDTO | null>(null);

    const queryParams: RefundQueryDTO = {
        page,
        limit: 10,
        // search: debouncedSearch, // Note: backend search needs to be implemented in findAll if needed
        status: statusFilter as RefundStatus || undefined,
    };

    const { data, isLoading } = useRefunds(queryParams);

    const refunds = data?.data || [];
    const meta = data ? {
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit,
    } : null;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Quản lý Hoàn tiền"
                subtitle="Theo dõi và xử lý các yêu cầu hoàn tiền khóa học"
                stats={[
                    { label: 'Cần xử lý', value: refunds.filter(r => r.status === RefundStatus.PENDING).length },
                    { label: 'Tổng số', value: meta?.total || 0 },
                ]}
            />
            <div className="space-y-4">
                <RefundsPrimaryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    status={statusFilter}
                    onStatusChange={(v) => setStatusFilter(v === 'all' ? '' : v as RefundStatus)}
                />
                <div className="rounded-md bg-background border overflow-hidden">
                    <RefundsTable
                        data={refunds}
                        isLoading={isLoading}
                        onView={setViewingRefund}
                        onChangeStatus={setChangingStatusRefund}
                        page={page}
                        limit={queryParams.limit || 10}
                    />
                </div>
                <SmartPagination
                    page={page}
                    totalPages={meta?.totalPages || 0}
                    totalItems={meta?.total || 0}
                    onPageChange={setPage}
                    itemName="yêu cầu"
                />
            </div>

            <RefundDetailDialog
                open={!!viewingRefund}
                onOpenChange={(open) => !open && setViewingRefund(null)}
                refund={viewingRefund}
            />

            <ChangeRefundStatusDialog
                open={!!changingStatusRefund}
                onOpenChange={(open) => !open && setChangingStatusRefund(null)}
                refund={changingStatusRefund}
            />
        </div>
    );
}
