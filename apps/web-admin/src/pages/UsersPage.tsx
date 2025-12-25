import { useNavigate } from 'react-router-dom';
import {
    UsersTable,
    UsersSearchBar,
    UsersPagination,
    UsersPageHeader,
    FilterDialog,
    SortDialog,
    useUsersLogic,
} from '../components/users';

export function UsersPage() {
    const navigate = useNavigate();
    const {
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
        isUpdating,
    } = useUsersLogic();

    const hasActiveFilters = !!(filters.role || filters.status);

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
        <div className="p-6 space-y-6 max-w-full">
            <UsersPageHeader onCreateClick={() => navigate('/users/new')} />

            <UsersSearchBar
                search={search}
                onSearchChange={setSearch}
                onFilterClick={() => setShowFilterDialog(true)}
                onSortClick={() => setShowSortDialog(true)}
                hasActiveFilters={hasActiveFilters}
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
                    limit={meta.limit}
                    onPageChange={setPage}
                />
            )}

            <FilterDialog
                open={showFilterDialog}
                onOpenChange={setShowFilterDialog}
                filters={filters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            <SortDialog
                open={showSortDialog}
                onOpenChange={setShowSortDialog}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onApply={handleApplySort}
            />
        </div>
    );
}
