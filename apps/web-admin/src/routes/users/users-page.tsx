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
import { UserPlus, ShieldCheck, Users as UsersIcon, Sparkles } from 'lucide-react';
import { Card } from "@workspace/ui/components/card";

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
            <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-destructive/5 rounded-[3rem] border border-dashed border-destructive/20 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                    <ShieldCheck className="size-8 text-destructive opacity-40" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight italic">Access Denial</h3>
                    <p className="text-xs font-bold text-muted-foreground/60 italic uppercase tracking-widest">{error.message}</p>
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
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-20" />);
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
                            "rounded-xl h-10 w-10 text-[11px] font-black transition-all",
                            page === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground/60 hover:text-primary"
                        )}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-20" />);
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(totalPages);
                        }}
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative px-2">
                <div className="space-y-4 max-w-2xl text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <UsersIcon className="size-3" />
                        Identity Management
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground uppercase italic leading-[0.85]">
                        System <br />
                        <span className="text-primary not-italic">Users & Roles</span>
                    </h1>
                    <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] italic border-l-2 border-primary/20 pl-6 mt-6">
                        Quản trị hạ tầng định danh, phân quyền và kiểm soát truy cập hệ thống <span className="text-foreground">Torii Global</span>.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-background/40 border border-border/20 backdrop-blur-xl hidden sm:flex">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Entity Count</p>
                            <h3 className="text-2xl font-black italic text-center">{total}</h3>
                        </div>
                    </div>
                    <Button
                        onClick={createDialog.setTrue}
                        className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
                    >
                        Provision New User
                        <UserPlus className="ml-3 size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </div>
            </div>

            {/* Main Table Container */}
            <Card className="rounded-[2rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden group">
                <div className="p-3 lg:p-6 space-y-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-3 lg:p-4 rounded-3xl bg-muted/20 border border-border/20">
                        <div className="flex-1 w-full">
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
                    </div>

                    <div className="rounded-3xl border border-border/20 bg-background/40 overflow-hidden relative group/table">
                        <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
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

                    {/* Pagination */}
                    {(total > 0 || isLoading) && (
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 group-hover:text-primary transition-colors">
                                    <Sparkles className="size-3" />
                                    Metric: <span className="text-foreground">{total} Identifiers Found</span>
                                </div>
                                <div className="hidden lg:block w-1 h-1 rounded-full bg-border" />
                                <div className="italic">Matrix Point 0{page} of 0{totalPages}</div>
                            </div>

                            {totalPages > 1 && (
                                <Pagination>
                                    <PaginationContent className="flex items-center gap-2">
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPage(p => Math.max(1, p - 1));
                                                }}
                                                className={cn(
                                                    "h-11 px-5 rounded-xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all",
                                                    page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95"
                                                )}
                                            />
                                        </PaginationItem>

                                        <div className="hidden md:flex items-center gap-1 mx-2">
                                            {renderPaginationItems()}
                                        </div>

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPage(p => Math.min(totalPages, p + 1));
                                                }}
                                                className={cn(
                                                    "h-11 px-5 rounded-xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all",
                                                    page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95"
                                                )}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    )}
                </div>
            </Card>

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
