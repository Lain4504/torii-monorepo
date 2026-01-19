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
            <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-destructive/5 rounded-[2rem] border border-dashed border-destructive/20 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-white/50 shadow-sm flex items-center justify-center">
                    <ShieldCheck className="size-8 text-destructive/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-medium text-foreground">Access Notice</h3>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
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
                        className="rounded-xl h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all"
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
                            "rounded-xl h-10 w-10 text-xs font-medium transition-all",
                            page === i ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
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
                        className="rounded-xl h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all"
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
            <div className="flex flex-col sm:flex-row items-start justify-between gap-8 relative px-0 md:px-2">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <UsersIcon className="size-3.5" />
                        Management
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                        Community <span className="text-primary">& Roles</span>
                    </h1>
                    <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-lg border-l-2 border-primary/20 pl-4">
                        Manage members, roles, and access permissions for the <span className="text-foreground font-semibold">Torii Global</span> ecosystem.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/60 border border-border/20 backdrop-blur-xl hidden sm:flex shadow-sm">
                        <div className="space-y-0.5">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center">Total Accounts</p>
                            <h3 className="text-2xl font-bold text-center text-primary">{total}</h3>
                        </div>
                    </div>
                    <Button
                        onClick={createDialog.setTrue}
                        className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group"
                    >
                        Add New User
                        <UserPlus className="ml-2 size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </div>
            </div>

            <div className="space-y-6 px-0 md:px-2">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
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

                <div className="rounded-3xl border border-white/20 bg-background/50 backdrop-blur-3xl overflow-hidden relative group/table shadow-sm">
                    <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
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
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-2">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-xs text-muted-foreground font-medium text-center lg:text-left pl-2">
                            <div className="inline-flex items-center gap-2">
                                <Sparkles className="size-3.5 text-primary/70" />
                                <span>Total: <span className="text-foreground">{total} Registered Users</span></span>
                            </div>
                            <div className="hidden lg:block w-1 h-1 rounded-full bg-border" />
                            <div>Page {page} of {totalPages}</div>
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
                                                "h-10 px-4 rounded-xl bg-background/50 border border-border/20 text-xs font-medium transition-all",
                                                page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
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
                                                "h-10 px-4 rounded-xl bg-background/50 border border-border/20 text-xs font-medium transition-all",
                                                page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
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
