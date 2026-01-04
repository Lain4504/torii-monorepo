import { useState, useMemo } from 'react';
import { UsersPrimaryToolbar } from '@/components/users/users-primary-toolbar.tsx';
import { UsersTable } from '@/components/users/users-table.tsx';
import { CreateUserDialog } from '@/components/users/create-user-dialog.tsx';
import { EditUserDialog } from '@/components/users/edit-user-dialog.tsx';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog.tsx';
import { ViewUserDialog } from '@/components/users/view-user-dialog.tsx';
import type { UserResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import {useUsers} from "@/api/services/users.ts";

export function UsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<{ role?: string; status?: string }>({});
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog States
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserResponseDTO | null>(null);
    const [viewingUser, setViewingUser] = useState<UserResponseDTO | null>(null);

    // API Hooks
    // Fetch all for client-side filtering support as per legacy logic
    // Note: Ideally sorting/filtering should be server-side, but keeping parity for now.
    const { data, isLoading, error } = useUsers({ page: 1, limit: 1000, search });

    // Derived Data (Client-side filtering/sorting)
    const processedUsers = useMemo(() => {
        let result = (data?.data || []) as UserResponseDTO[];

        // Filter by role
        if (filters.role) {
            result = result.filter((user) => user.role === filters.role);
        }
        // Filter by status
        if (filters.status) {
            result = result.filter((user) => user.status === filters.status);
        }

        // Sort
        return result.sort((a, b) => {
            let aValue: any = a[sortBy as keyof UserResponseDTO];
            let bValue: any = b[sortBy as keyof UserResponseDTO];

            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    }, [data?.data, filters, sortBy, sortOrder]);

    const paginatedUsers = useMemo(() => {
        const limit = 10;
        const start = (page - 1) * limit;
        return processedUsers.slice(start, start + limit);
    }, [processedUsers, page]);

    if (isLoading) {
        return <div className="p-6 text-center py-8">Loading users...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-destructive py-8">Error: {error.message}</div>;
    }

    // Pagination Metadata (Client-side)
    const limit = 10;
    const total = processedUsers.length;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6 space-y-6 max-w-full">
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
                onAddNew={() => setShowCreateDialog(true)}
            />

            <UsersTable
                data={paginatedUsers}
                onEdit={setEditingUser}
                onDelete={setDeletingUser}
                onView={setViewingUser}
                page={page}
                limit={limit}
            />

            {/* Pagination */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    Showing {paginatedUsers.length} of {total} users
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="px-4 py-2 text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>

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
