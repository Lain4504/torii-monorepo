import { useState, useEffect } from 'react';
import { UsersPrimaryToolbar } from '@/components/users/users-primary-toolbar.tsx';
import { UsersTable } from '@/components/users/users-table.tsx';
import { CreateUserSheet } from '@/components/users/create-user-sheet.tsx';
import { EditUserSheet } from '@/components/users/edit-user-sheet.tsx';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog.tsx';
import { ViewUserSheet } from '@/components/users/view-user-sheet.tsx';
import type { UserResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { useUsers } from "@/api/services/users.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { useBoolean } from "@workspace/ui/hooks/use-boolean";

import { SmartPagination } from '@/components/common/smart-pagination';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { Card } from "@workspace/ui/components/card";
import { PageHeader } from '@/components/common/page-header';

export default function LearnersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States
    const createDialog = useBoolean();
    const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserResponseDTO | null>(null);
    const [viewingUser, setViewingUser] = useState<UserResponseDTO | null>(null);

    const limit = 10;

    // API Hooks - Filter by role 'user'
    const { data, isLoading, error } = useUsers({
        page,
        limit,
        search: debouncedSearch,
        role: 'learner'
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 border-2 border-dashed border-destructive/20 bg-destructive/5 text-center animate-in fade-in duration-500">
                <div className="w-12 h-12 flex items-center justify-center bg-destructive/10 mb-4 text-destructive">
                    <ShieldCheck className="size-6" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">Truy cập bị hạn chế</h3>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded-xl border-destructive/20 hover:bg-destructive/5"
                    >
                        Thử kết nối lại
                    </Button>
                </div>
            </div>
        );
    }

    const users = (data?.data || []) as UserResponseDTO[];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 0;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
            <PageHeader
                title="Hồ sơ Học viên"
                subtitle="Danh sách học viên đăng ký trên hệ thống. Theo dõi lộ trình và kết quả học tập."
                stats={[
                    { label: "Tổng số học viên", value: total.toLocaleString() }
                ]}
                actions={
                    <Button
                        onClick={createDialog.setTrue}
                        className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
                    >
                        Tạo tài khoản học viên
                        <UserPlus className="ml-2 size-4" />
                    </Button>
                }
            />


            <div className="space-y-4">
                {/* Search & Filter */}
                <Card className="p-4 rounded-2xl border-border bg-card shadow-sm">
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
                </Card>

                {/* Table container */}
                <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-sm">
                    <UsersTable
                        data={users}
                        onEdit={setEditingUser}
                        onDelete={setDeletingUser}
                        onView={setViewingUser}
                        page={page}
                        limit={limit}
                        isLoading={isLoading}
                    />
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

            {/* Sheets & Dialogs */}
            <CreateUserSheet
                open={createDialog.value}
                onOpenChange={createDialog.setValue}
            />

            <EditUserSheet
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                user={editingUser}
            />

            <DeleteUserDialog
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
                user={deletingUser}
            />

            <ViewUserSheet
                open={!!viewingUser}
                onOpenChange={(open) => !open && setViewingUser(null)}
                user={viewingUser}
            />
        </div>
    );
}
