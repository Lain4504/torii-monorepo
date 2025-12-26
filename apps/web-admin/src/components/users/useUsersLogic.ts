import { useState } from 'react';
import { useUsers, useUpdateUser, useDeleteUser } from '../../api';
import type { UserResponseDto } from '@workspace/dtos';

export function useUsersLogic() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<{ role?: string; status?: string }>({});
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [showSortDialog, setShowSortDialog] = useState(false);

    // Queries
    const { data, isLoading, error, refetch } = useUsers({ page, limit: 10, search });

    // Mutations
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    // Apply filters and sort client-side (since backend may not support these params yet)
    let users = (data?.data || []) as UserResponseDto[];

    // Apply filters
    if (filters.role) {
        users = users.filter((user) => user.role === filters.role);
    }
    if (filters.status) {
        users = users.filter((user) => user.status === filters.status);
    }

    // Apply sorting
    users = [...users].sort((a, b) => {
        let aValue: any = a[sortBy as keyof UserResponseDto];
        let bValue: any = b[sortBy as keyof UserResponseDto];

        // Handle date strings
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        }

        // Handle string comparison
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

    const meta = data?.meta;

    const handleUpdate = (user: UserResponseDto) => {
        setEditingUser(user);
    };

    const handleSaveUpdate = async () => {
        if (!editingUser) return;

        await updateUser.mutateAsync({
            id: editingUser.id,
            user: {
                email: editingUser.email,
                fullName: editingUser.fullName,
                phone: editingUser.phone,
                role: editingUser.role,
                status: editingUser.status,
            },
        });
        setEditingUser(null);
        refetch();
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleUpdateEditingUser = (updatedUser: UserResponseDto) => {
        setEditingUser(updatedUser);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa vĩnh viễn user này?')) {
            return;
        }

        try {
            await deleteUser.mutateAsync({ id, hardDelete: true });
            refetch();
        } catch (error: any) {
            alert(`Lỗi: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleApplyFilters = (newFilters: { role?: string; status?: string }) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filtering
    };

    const handleResetFilters = () => {
        setFilters({});
        setPage(1);
    };

    const handleApplySort = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setPage(1); // Reset to first page when sorting
    };

    return {
        // State
        page,
        search,
        filters,
        sortBy,
        sortOrder,
        editingUser,
        users,
        meta,
        isLoading,
        error,
        showFilterDialog,
        showSortDialog,

        // Actions
        setPage,
        setSearch,
        setShowFilterDialog,
        setShowSortDialog,
        handleApplyFilters,
        handleResetFilters,
        handleApplySort,
        handleUpdate,
        handleSaveUpdate,
        handleCancelEdit,
        handleUpdateEditingUser,
        handleDelete,

        // Mutation states
        isUpdating: updateUser.isPending,
        isDeleting: deleteUser.isPending,
    };
}

