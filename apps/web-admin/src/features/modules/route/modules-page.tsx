import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useModules } from '@/features/modules/api/modules';
import { Button } from '@workspace/ui/components/button';
import { ModulesTable } from '@/features/modules/components/modules-table';
import { ModulesPrimaryToolbar } from '@/features/modules/components/modules-primary-toolbar';
import { CreateModuleDialog } from '@/features/modules/components/create-module-dialog';
import { EditModuleDialog } from '@/features/modules/components/edit-module-dialog';
import { DeleteModuleDialog } from '@/features/modules/components/delete-module-dialog';
import { ViewModuleDialog } from '@/features/modules/components/view-module-dialog';
import type { ModuleQueryDto, ModuleResponseDto } from '@workspace/dtos';

export default function ModulesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const [courseIdFilter, setCourseIdFilter] = useState(() => new URLSearchParams(location.search).get('courseId') || '');

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleResponseDto | null>(null);
  const [deletingModule, setDeletingModule] = useState<ModuleResponseDto | null>(null);
  const [viewingModule, setViewingModule] = useState<ModuleResponseDto | null>(null);

  const queryParams: ModuleQueryDto = {
    page,
    limit: 10,
    ...(search && { search }),
    ...(courseIdFilter && { courseId: courseIdFilter }),
  };

  const { data: modulesData, isLoading, error } = useModules(queryParams);

  const modules = modulesData?.data || [];
  const meta = modulesData?.meta;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading modules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500 py-8">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">Manage all modules in the system</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>Create Module</Button>
      </div>

      <ModulesPrimaryToolbar
        search={search}
        onSearchChange={setSearch}
        courseIdFilter={courseIdFilter}
        onCourseIdFilterChange={setCourseIdFilter}
      />

      <ModulesTable
        data={modules}
        onEdit={setEditingModule}
        onDelete={setDeletingModule}
        onView={setViewingModule}
        page={page}
        limit={queryParams.limit || 10}
      />

      {/* Pagination */}
      {meta && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {modules.length} of {meta.total} modules
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
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateModuleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <EditModuleDialog
        open={!!editingModule}
        onOpenChange={(open) => !open && setEditingModule(null)}
        module={editingModule}
      />

      <DeleteModuleDialog
        open={!!deletingModule}
        onOpenChange={(open) => !open && setDeletingModule(null)}
        module={deletingModule}
      />

      <ViewModuleDialog
        open={!!viewingModule}
        onOpenChange={(open) => !open && setViewingModule(null)}
        module={viewingModule}
      />
    </div>
  );
}
