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
import { cn } from '@workspace/ui/lib/utils';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination";
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

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(1);
                        }}
                        className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-50" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(i);
                        }}
                        className={cn(
                            "rounded-md border h-9 w-9 text-xs font-semibold transition-all",
                            page === i
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-50" />);
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(totalPages);
                        }}
                        className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500">
            {/* Header Section - Minimal Zen Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-sans font-bold italic tracking-wide uppercase mb-1">
                        <Users className="size-3.5" />
                        Quản lý Tài khoản
                    </div>
                    <h1 className="text-3xl md:text-4xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Danh sách <span className="text-primary not-italic">Người dùng</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
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
                {(total > 0 || isLoading) && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span>Hiển thị trang <span className="text-foreground">{page}</span> / {totalPages}</span>
                            <span className="mx-1 text-border">|</span>
                            <span>Tổng cộng <span className="text-foreground">{total}</span> người dùng</span>
                        </div>

                        {totalPages > 1 && (
                            <Pagination className="w-auto mx-0">
                                <PaginationContent className="flex items-center gap-1">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.max(1, p - 1));
                                            }}
                                            className={cn(
                                                "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="hidden md:flex items-center gap-1">
                                        {renderPaginationItems()}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.min(totalPages, p + 1));
                                            }}
                                            className={cn(
                                                "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                                                page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
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

