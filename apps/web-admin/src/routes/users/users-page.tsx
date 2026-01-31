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
import { UserPlus, ShieldCheck, Users } from 'lucide-react';


export function UsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [filters, setFilters] = useState<{ role?: string }>({});
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States
    const createDialog = useBoolean();
    const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserResponseDTO | null>(null);
    const [viewingUser, setViewingUser] = useState<UserResponseDTO | null>(null);

    const limit = 10;

    // API Hooks
    const { data, isLoading, error } = useUsers({
        page,
        limit,
        search: debouncedSearch,
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filters]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 border-2 border-dashed border-destructive/20 bg-destructive/5 text-center animate-in fade-in duration-500">
                <div className="w-12 h-12 flex items-center justify-center bg-destructive/10 mb-4">
                    <ShieldCheck className="size-6 text-destructive" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-sans font-bold italic uppercase tracking-tight text-foreground">Truy cập bị hạn chế</h3>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded-none border-destructive/20 hover:bg-destructive/5"
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
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Danh sách Người dùng</h1>
                    <p className="text-sm text-muted-foreground">
                        Quản trị hệ thống tài khoản Torii Academy
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end px-4 border-r border-border/40">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">Tổng số tài khoản</span>
                        <span className="text-2xl font-bold text-foreground tabular-nums">{total.toLocaleString()}</span>
                    </div>
                    <Button
                        onClick={createDialog.setTrue}
                        className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                    >
                        Thêm người dùng mới
                        <UserPlus className="ml-2 size-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Toolbar area */}
                <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
                    <UsersPrimaryToolbar
                        search={search}
                        onSearchChange={setSearch}
                        filters={filters}
                        onFilterChange={setFilters}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={(field, order) => {
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                    />
                </div>

                {/* Table container */}
                <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
                    <UsersTable
                        data={users}
                        onEdit={setEditingUser}
                        onDelete={setDeletingUser}
                        onView={setViewingUser}
                        page={page}
                        limit={limit}
                        isLoading={isLoading}
                    />
                </div>

                {/* Footer / Pagination */}
                <SmartPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={total}
                    onPageChange={setPage}
                    itemName="người dùng"
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

