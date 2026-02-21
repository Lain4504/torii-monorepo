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
import { useLocation } from 'react-router-dom';
import { Card } from "@workspace/ui/components/card";
import { PageHeader } from '@/components/common/page-header';

export default function PersonnelPage() {
    const location = useLocation();
    const isLecturers = location.pathname.includes('lecturers');
    const targetRole = isLecturers ? 'lecturer' : 'staff';

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

    // API Hooks - Filter by target role
    const { data, isLoading, error } = useUsers({
        page,
        limit,
        search: debouncedSearch,
        role: targetRole
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, targetRole]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-destructive/5 text-center rounded-xl border border-destructive/10">
                <div className="size-12 rounded-full flex items-center justify-center bg-destructive/10 mb-4 text-destructive">
                    <ShieldCheck className="size-6" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-foreground uppercase">Truy cập bị hạn chế</h3>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="mt-4"
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
        <div className="flex flex-col gap-8">
            <PageHeader
                title={isLecturers ? "Đội ngũ Giảng viên" : "Đội ngũ Nhân viên"}
                subtitle={isLecturers
                    ? 'Quản lý thông tin bằng cấp, chuyên môn và lịch dạy của giảng viên.'
                    : 'Điều hành đội ngũ nhân viên hỗ trợ, vận hành và quản trị trung tâm.'}
                stats={[
                    { label: `Tổng số ${isLecturers ? 'giáo viên' : 'nhân viên'}`, value: total.toLocaleString() }
                ]}
                actions={
                    <Button onClick={createDialog.setTrue} size="lg">
                        <UserPlus />
                        Thêm {isLecturers ? 'Giảng viên' : 'Nhân viên'}
                    </Button>
                }
            />


            <div className="flex flex-col gap-4">
                {/* Search & Filter */}
                <Card className="p-4">
                    <UsersPrimaryToolbar
                        search={search}
                        onSearchChange={setSearch}
                        filters={{ role: targetRole }}
                        onFilterChange={() => { }}
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
                <Card className="p-0 overflow-hidden">
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
                    itemName={isLecturers ? "giáo viên" : "nhân viên"}
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
