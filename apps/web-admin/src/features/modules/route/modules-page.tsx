import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { useModules } from '@/features/modules/api/modules';
import { coursesApi } from '@/features/courses/api/courses';
import { Button } from '@workspace/ui/components/button';
import { ModulesTable } from '@/features/modules/components/modules-table';
import { ModulesPrimaryToolbar } from '@/features/modules/components/modules-primary-toolbar';
import { CreateModuleDialog } from '@/features/modules/components/create-module-dialog';
import { EditModuleDialog } from '@/features/modules/components/edit-module-dialog';
import { DeleteModuleDialog } from '@/features/modules/components/delete-module-dialog';
import { ViewModuleDialog } from '@/features/modules/components/view-module-dialog';
import type { ModuleQueryDTO, ModuleResponseDTO } from '@workspace/schemas';

export default function ModulesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const [courseIdFilter, setCourseIdFilter] = useState(() => new URLSearchParams(location.search).get('courseId') || '');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleResponseDTO | null>(null);
  const [deletingModule, setDeletingModule] = useState<ModuleResponseDTO | null>(null);
  const [viewingModule, setViewingModule] = useState<ModuleResponseDTO | null>(null);

  const queryParams: ModuleQueryDTO = {
    page,
    limit: 10,
    ...(search && { search }),
    ...(courseIdFilter && { courseId: courseIdFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data: modulesData, isLoading, error } = useModules(queryParams);

  const modules = modulesData?.data || [];
  const meta = modulesData ? {
    total: modulesData.total,
    totalPages: modulesData.totalPages,
    page: modulesData.page,
    limit: modulesData.limit
  } : null;

  // Get unique courseIds from modules and courseIdFilter
  const uniqueCourseIds = useMemo(() => {
    const ids = new Set<string>();
    modules.forEach((module) => {
      if (module.courseId) {
        ids.add(module.courseId);
      }
    });
    // Also include courseIdFilter if it exists
    if (courseIdFilter) {
      ids.add(courseIdFilter);
    }
    return Array.from(ids);
  }, [modules, courseIdFilter]);

  // Fetch courses for all unique courseIds
  const courseQueries = useQueries({
    queries: uniqueCourseIds.map((courseId) => ({
      queryKey: ['courses', courseId],
      queryFn: () => coursesApi.findOne(courseId),
      enabled: !!courseId,
      staleTime: 30000,
    })),
  });

  // Create a map of courseId -> courseTitle
  const courseTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    uniqueCourseIds.forEach((courseId, index) => {
      const courseQuery = courseQueries[index];
      if (courseQuery?.data?.title) {
        map.set(courseId, courseQuery.data.title);
      }
    });
    return map;
  }, [uniqueCourseIds, courseQueries]);

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
        courseTitleMap={courseTitleMap}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ModulesTable
        data={modules}
        onEdit={setEditingModule}
        onDelete={setDeletingModule}
        onView={setViewingModule}
        page={page}
        limit={queryParams.limit || 10}
        courseTitleMap={courseTitleMap}
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
        courseId={courseIdFilter}
        courseTitle={courseTitleMap.get(courseIdFilter)}
        existingModules={modules}
      />

      <EditModuleDialog
        open={!!editingModule}
        onOpenChange={(open) => !open && setEditingModule(null)}
        module={editingModule}
        existingModules={modules}
        courseTitle={editingModule ? courseTitleMap.get(editingModule.courseId) : ''}
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
