import { useState, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { 
    Plus, 
    Search,
    Ticket,
    Filter
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card } from '@workspace/ui/components/card';
import {

    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Can } from '@/lib/guard/can';


import { useCoupons } from '@/api/services/coupons';
import { CouponsTable } from '@/components/coupons/coupons-table';
import type { CouponResponseDTO } from '@workspace/schemas';
import { CouponStatus } from '@workspace/schemas';

import { CreateCouponSheet } from '@/components/coupons/create-coupon-sheet';
import { EditCouponSheet } from '@/components/coupons/edit-coupon-sheet';
import { DeleteCouponDialog } from '@/components/coupons/delete-coupon-dialog';

export default function CouponsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // State
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;

    // Dialog State
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<CouponResponseDTO | null>(null);

    // Data Fetching
    const { data, isLoading } = useCoupons({
        page,
        limit,
        search: debouncedSearch,
        status: status as CouponStatus
    });

    const coupons = data?.data || [];
    const totalPages = data?.totalPages || 0;

    // Handlers
    const handleSearch = (value: string) => {
        setSearch(value);
        setSearchParams(prev => {
            prev.set('search', value);
            prev.set('page', '1'); // Reset to page 1
            if (!value) prev.delete('search');
            return prev;
        });
    };

    const handleStatusFilter = (value: string) => {
        setSearchParams(prev => {
            if (value && value !== 'all') {
                prev.set('status', value);
            } else {
                prev.delete('status');
            }
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    const handleCreate = () => {
        setCreateOpen(true);
    };

    const handleEdit = (coupon: CouponResponseDTO) => {
        setSelectedCoupon(coupon);
        setEditOpen(true);
    };

    const handleDelete = (coupon: CouponResponseDTO) => {
        setSelectedCoupon(coupon);
        setDeleteOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Ticket className="size-6" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold italic tracking-tight text-foreground uppercase">
                            Mã Giảm Giá
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground/80 max-w-2xl leading-relaxed">
                        Quản lý các chương trình khuyến mãi và mã giảm giá cho khóa học.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Can permission="coupon.manage">
                        <Button 
                            onClick={handleCreate}
                            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wide hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="mr-2 size-4" />
                            Tạo Coupon Mới
                        </Button>
                    </Can>
                </div>
            </div>

            {/* Filters & Search */}
            <Card className="rounded-xl border border-border shadow-sm p-1.5 flex flex-col md:flex-row gap-2 bg-background/50 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <Input 
                        placeholder="Tìm kiếm theo mã, tên..." 
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-10 pl-10 bg-transparent border-transparent hover:bg-muted/30 focus-visible:bg-muted/30 rounded-lg transition-all"
                    />
                </div>
                <div className="w-px h-6 bg-border/40 my-auto hidden md:block" />
                <Select value={status || 'all'} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px] h-10 border-0 bg-transparent hover:bg-muted/30 focus:ring-0 rounded-lg gap-2 text-muted-foreground">
                        <Filter className="size-3.5 opacity-50" />
                        <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl border-border/60 shadow-xl">
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                        <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                    </SelectContent>
                </Select>
            </Card>

            {/* Table */}
            <Card className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                <CouponsTable 
                    data={coupons}
                    isLoading={isLoading}
                    page={page}
                    limit={limit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/5">
                        <p className="text-xs text-muted-foreground font-medium">
                            Trang {page} / {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="h-8 rounded-lg text-xs font-semibold hover:bg-white hover:text-black transition-colors"
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="h-8 rounded-lg text-xs font-semibold hover:bg-white hover:text-black transition-colors"
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Dialogs */}
            <Suspense fallback={null}>
                {createOpen && (
                    <CreateCouponSheet 
                        open={createOpen} 
                        onOpenChange={setCreateOpen} 
                    />
                )}
                
                {selectedCoupon && (
                    <>
                        <EditCouponSheet 
                            open={editOpen} 
                            onOpenChange={setEditOpen} 
                            coupon={selectedCoupon} 
                        />
                        <DeleteCouponDialog 
                            open={deleteOpen} 
                            onOpenChange={setDeleteOpen} 
                            coupon={selectedCoupon} 
                        />
                    </>
                )}
            </Suspense>
        </div>
    );
}
