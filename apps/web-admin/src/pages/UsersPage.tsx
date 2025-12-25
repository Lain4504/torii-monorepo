import {
    UsersTable,
    CreateUserDialog,
    UsersSearchBar,
    UsersPagination,
    useUsersLogic,
} from '../components/users';

export function UsersPage() {
    const {
        page,
        search,
        editingUser,
        showCreateModal,
        users,
        meta,
        isLoading,
        error,
        setPage,
        setSearch,
        setShowCreateModal,
        handleCreate,
        handleUpdate,
        handleSaveUpdate,
        handleCancelEdit,
        handleUpdateEditingUser,
        handleDelete,
        isCreating,
        isUpdating,
    } = useUsersLogic();

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">Loading users...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center text-destructive py-8">
                    Error: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground mt-1">
                    Manage user accounts and permissions
                </p>
            </div>

            <UsersSearchBar
                search={search}
                onSearchChange={setSearch}
                onCreateClick={() => setShowCreateModal(true)}
            />

            <UsersTable
                users={users}
                editingUser={editingUser}
                onEdit={handleUpdate}
                onDelete={handleDelete}
                onSaveEdit={handleSaveUpdate}
                onCancelEdit={handleCancelEdit}
                onUpdateEditingUser={handleUpdateEditingUser}
                isUpdating={isUpdating}
            />

            {meta && (
                <UsersPagination
                    page={page}
                    totalPages={meta.totalPages}
                    total={meta.total}
                    onPageChange={setPage}
                />
            )}

            <CreateUserDialog
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                onCreate={handleCreate}
                isCreating={isCreating}
            />
        </div>
    );
}
