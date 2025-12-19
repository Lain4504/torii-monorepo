import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../api';
import type { UserResponseDto } from '@workspace/dtos';

export function UsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    // Queries
    const { data, isLoading, error } = useUsers({ page, limit: 10, search });

    // Mutations
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    if (isLoading) return <div className="p-4">Loading users...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

    const users = (data?.data || []) as UserResponseDto[];
    const meta = data?.meta;

    const handleCreate = () => {
        createUser.mutate({
            email: 'newuser@example.com',
            fullName: 'New User',
            role: 'learner',
            status: 'active',
        });
    };

    const handleUpdate = (id: string) => {
        updateUser.mutate({
            id,
            user: { fullName: 'Updated Name' },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure?')) {
            deleteUser.mutate(id);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex gap-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 border rounded"
                />
                <button
                    onClick={handleCreate}
                    disabled={createUser.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {createUser.isPending ? 'Creating...' : 'Create User'}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <button
                                        onClick={() => handleUpdate(user.id)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {meta && (
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Total: {meta.total} users | Page {meta.page} of {meta.totalPages}
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === meta.totalPages}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
