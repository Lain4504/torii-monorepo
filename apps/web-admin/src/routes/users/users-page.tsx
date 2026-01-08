import { useState, useEffect } from 'react';
import { UsersPrimaryToolbar } from '@/components/users/users-primary-toolbar.tsx';
import { UsersTable } from '@/components/users/users-table.tsx';
import { CreateUserDialog } from '@/components/users/create-user-dialog.tsx';
import { EditUserDialog } from '@/components/users/edit-user-dialog.tsx';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog.tsx';
import { ViewUserDialog } from '@/components/users/view-user-dialog.tsx';
import type { UserResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { useUsers } from "@/api/services/users.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
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

export function UsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [filters, setFilters] = useState<{ role?: string }>({});
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserResponseDTO | null>(null);
    const [viewingUser, setViewingUser] = useState<UserResponseDTO | null>(null);

    const limit = 10;

    // API Hooks - Proper server-side pagination
    const { data, isLoading, error } = useUsers({
        page,
        limit,
        search: debouncedSearch,
        // Backend might need these as well if supported by findAll
        // sortBy,
        // sortOrder 
    });

    // Reset page when search or filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filters]);

    if (error) {
        return <div className="p-6 text-center text-destructive py-8">Error: {error.message}</div>;
    }

    const users = (data?.data || []) as UserResponseDTO[];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 0;

    // Helper to render pagination items
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
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" />);
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
                            "cursor-pointer transition-colors",
                            page === i ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" />);
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(totalPages);
                        }}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Users</h1>
                    <p className="text-muted-foreground">Manage system users, roles, and permissions.</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="rounded-full shadow-lg shadow-primary/20 bg-primary">
                    Add New User
                </Button>
            </div>

            <div className="zen-card rounded-2xl">
                <div className="p-6">
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

                    <div className="mt-6 rounded-xl border border-border/40 overflow-hidden">
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border/40 mt-6 px-2">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{users.length}</span> of <span className="font-semibold text-foreground">{total}</span> users
                                {totalPages > 0 && (
                                    <span className="ml-2">(Page {page} of {totalPages})</span>
                                )}
                            </div>

                            {totalPages > 1 ? (
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPage(p => Math.max(1, p - 1));
                                                }}
                                                className={cn(
                                                    page === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
                                                    "transition-colors"
                                                )}
                                            />
                                        </PaginationItem>

                                        {renderPaginationItems()}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPage(p => Math.min(totalPages, p + 1));
                                                }}
                                                className={cn(
                                                    page === totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
                                                    "transition-colors"
                                                )}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            ) : totalPages === 1 ? (
                                <div className="text-sm text-muted-foreground">
                                    All results on one page
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <CreateUserDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <EditUserDialog
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                user={editingUser}
            />

            <DeleteUserDialog
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
                user={deletingUser}
            />

            <ViewUserDialog
                open={!!viewingUser}
                onOpenChange={(open) => !open && setViewingUser(null)}
                user={viewingUser}
            />
        </div>
    );
}
