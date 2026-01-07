import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { ModulesTable } from '@/components/modules/modules-table.tsx';
import { ModulesPrimaryToolbar } from '@/components/modules/modules-primary-toolbar.tsx';
import { CreateModuleDialog } from '@/components/modules/create-module-dialog.tsx';
import { EditModuleDialog } from '@/components/modules/edit-module-dialog.tsx';
import { DeleteModuleDialog } from '@/components/modules/delete-module-dialog.tsx';
import { ViewModuleDialog } from '@/components/modules/view-module-dialog.tsx';
import type { ModuleQueryDTO, ModuleResponseDTO } from '@workspace/schemas';
import { useModules } from "@/api/services/modules.ts";
import { coursesApi } from "@/api/services/courses.ts";

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
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">Manage learning modules and curriculum content.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>Create Module</Button>
      </div>

      <div className="rounded-xl border border-border/40 overflow-hidden bg-transparent">
        <div className="p-0">
          <div className="p-6 zen-card mb-6">
            <ModulesPrimaryToolbar
              search={search}
              onSearchChange={setSearch}
              courseIdFilter={courseIdFilter}
              onCourseIdFilterChange={setCourseIdFilter}
              courseTitleMap={courseTitleMap}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>

          <div className="zen-card overflow-hidden">
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
              <div className="flex items-center justify-between space-x-2 p-4 border-t border-border/40">
                <div className="flex-1 text-sm zen-text-muted">
                  Showing {modules.length} of {meta.total} modules
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-primary/5"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <div className="text-sm font-medium">
                    Page {page} of {meta.totalPages}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-primary/5"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
