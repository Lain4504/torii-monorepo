import { useState, useEffect } from 'react';
import { UsersPrimaryToolbar } from '@/components/users/users-primary-toolbar.tsx';
import { UsersTable } from '@/components/users/users-table.tsx';
import { CreateUserSheet } from '@/components/users/create-user-sheet.tsx';
import { EditUserSheet } from '@/components/users/edit-user-sheet.tsx';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog.tsx';
import { ViewUserSheet } from '@/components/users/view-user-sheet.tsx';
import type { UserResponseDTO } from '@workspace/schemas';
import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { useUsers } from "@/lib/api/services/users.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { useBoolean } from "@workspace/ui/hooks/use-boolean";

import { SmartPagination } from '@/components/common/smart-pagination';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { formatNumber } from "@/lib/format-utils";

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [debouncedSearch, targetRole]);

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
                title={isLecturers ? "Đội ngũ Giảng viên" : "Đội ngũ Nhân viên"}
                subtitle={isLecturers
                    ? 'Quản lý thông tin bằng cấp, chuyên môn và lịch dạy của giảng viên.'
                    : 'Điều hành đội ngũ nhân viên hỗ trợ, vận hành và quản trị trung tâm.'}
                stats={[
                    { label: `Tổng số ${isLecturers ? 'giáo viên' : 'nhân viên'}`, value: formatNumber(total) }
                ]}
                actions={
                    <Button onClick={createDialog.setTrue} size="lg">
                        <UserPlus />
                        Thêm {isLecturers ? 'Giảng viên' : 'Nhân viên'}
                    </Button>
                }
            />


            <div className="space-y-4">
                {/* Search & Filter */}
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

                {/* Table container */}
                <Card>
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
