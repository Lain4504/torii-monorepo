import { useState, useEffect } from 'react';
import { UsersPrimaryToolbar } from '@/components/users/users-primary-toolbar.tsx';
import { UsersTable } from '@/components/users/users-table.tsx';


import { ChangeUserStatusDialog } from '@/components/users/change-user-status-dialog.tsx';
import { ViewUserSheet } from '@/components/users/view-user-sheet.tsx';
import type { UserResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { useUsers } from "@/lib/api/services/users.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';


import { SmartPagination } from '@/components/common/smart-pagination';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";
import { formatNumber } from "@/lib/format-utils";

export default function LearnersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States


    const [statusChangingUser, setStatusChangingUser] = useState<UserResponseDTO | null>(null);
    const [viewingUser, setViewingUser] = useState<UserResponseDTO | null>(null);

    const limit = 10;

    // API Hooks - Filter by role 'user'
    const { data, isLoading, error } = useUsers({
        page,
        limit,
        search: debouncedSearch,
        role: 'learner',
        sortBy,
        sortOrder,
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [debouncedSearch]);

    if (error) {
        return (
            <div className="flex h-[450px] items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="size-12 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Truy cập bị hạn chế</h3>
                            <p className="text-sm text-muted-foreground">{error.message}</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Thử kết nối lại
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const users = (data?.data || []) as UserResponseDTO[];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 0;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Hồ sơ Học viên"
                subtitle="Danh sách học viên đăng ký trên hệ thống. Theo dõi lộ trình và kết quả học tập."
                stats={[
                    { label: "Tổng số học viên", value: formatNumber(total) }
                ]}

            />


            <div className="space-y-4">
                {/* Search & Filter */}
                <UsersPrimaryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    filters={{ role: 'learner' }}
                    onFilterChange={() => { }} // Disabled role filter as it's fixed
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(field, order) => {
                        setSortBy(field);
                        setSortOrder(order);
                    }}
                    hideRoleFilter={true}
                />

                {/* Table container */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">

                        <UsersTable
                            data={users}
                            onChangeStatus={setStatusChangingUser}
                            onView={setViewingUser}
                            page={page}
                            limit={limit}
                            isLoading={isLoading}
                        />

                    </CardContent>
                </Card>

                {/* Footer / Pagination */}
                <SmartPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={total}
                    onPageChange={setPage}
                    itemName="học viên"
                />
            </div>





            <ChangeUserStatusDialog
                open={!!statusChangingUser}
                onOpenChange={(open) => !open && setStatusChangingUser(null)}
                user={statusChangingUser}
            />

            <ViewUserSheet
                open={!!viewingUser}
                onOpenChange={(open) => !open && setViewingUser(null)}
                user={viewingUser}
            />
        </div>
    );
}
