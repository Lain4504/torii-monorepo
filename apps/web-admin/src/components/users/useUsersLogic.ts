import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../api';
import type { UserResponseDto } from '@workspace/dtos';

export function useUsersLogic() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Queries
    const { data, isLoading, error, refetch } = useUsers({ page, limit: 10, search });

    // Mutations
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    const users = (data?.data || []) as UserResponseDto[];
    const meta = data?.meta;

    const handleCreate = async (userData: {
        email: string;
        fullName: string;
        password: string;
        phone?: string;
        role?: string;
        status?: string;
    }) => {
        await createUser.mutateAsync(userData);
        refetch();
    };

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

    return {
        // State
        page,
        search,
        editingUser,
        showCreateModal,
        users,
        meta,
        isLoading,
        error,

        // Actions
        setPage,
        setSearch,
        setShowCreateModal,
        handleCreate,
        handleUpdate,
        handleSaveUpdate,
        handleCancelEdit,
        handleUpdateEditingUser,
        handleDelete,

        // Mutation states
        isCreating: createUser.isPending,
        isUpdating: updateUser.isPending,
        isDeleting: deleteUser.isPending,
    };
}

