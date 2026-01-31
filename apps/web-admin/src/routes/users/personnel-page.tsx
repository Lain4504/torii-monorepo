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
import { UserPlus, ShieldCheck, Briefcase } from 'lucide-react';
import { useLocation } from 'react-router-dom';


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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Briefcase className="size-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Quản lý Nhân sự</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">
                        Đội ngũ <span className="text-primary italic">{isLecturers ? 'Giảng viên' : 'Nhân viên'}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-md">
                        {isLecturers
                            ? 'Quản lý thông tin bằng cấp, chuyên môn và lịch dạy của giảng viên.'
                            : 'Điều hành đội ngũ nhân viên hỗ trợ, vận hành và quản trị trung tâm.'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end px-6 border-r border-border/40">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 font-mono">Tổng số {isLecturers ? 'giáo viên' : 'nhân viên'}</span>
                        <span className="text-3xl font-black text-foreground tabular-nums">{total.toLocaleString()}</span>
                    </div>
                    <Button
                        onClick={createDialog.setTrue}
                        className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                    >
                        Thêm {isLecturers ? 'Giảng viên' : 'Nhân viên'}
                        <UserPlus className="ml-3 size-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Search & Filter */}
                <div className="bg-background/50 backdrop-blur-sm p-4 rounded-2xl border border-border/40 shadow-sm">
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
                </div>

                {/* Table container */}
                <div className="bg-background rounded-2xl border border-border/40 overflow-hidden shadow-sm">
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
