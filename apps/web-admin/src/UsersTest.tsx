import { useQuery } from '@tanstack/react-query';
import { getUsers } from './api/users';
import { type User } from '@workspace/protocol';

export function UsersList() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(1, 100), // Get first 100 users
    });

    if (isLoading) return <div className="p-4">Loading Users...</div>;
    if (error) return <div className="p-4 text-red-500">Error loading users: {error.message}</div>;

    const users = data?.data || [];
    const meta = data?.meta;

    return (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 shadow-sm mt-8">
            <h2 className="text-xl font-bold text-purple-900 mb-4">Users List (Protocol + REST)</h2>
            <div className="bg-white rounded-lg shadowoverflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: User) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt}</td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {meta && (
                <div className="mt-4 text-sm text-gray-500">
                    Total: {meta.total} | Page: {meta.page} / {meta.totalPages}
                </div>
            )}
        </div>
    );
}
