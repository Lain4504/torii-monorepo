import { useState, useMemo, useEffect } from 'react';
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
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";

export default function ModulesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);
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
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(courseIdFilter && { courseId: courseIdFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data: modulesData, isLoading, error } = useModules(queryParams);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, courseIdFilter, statusFilter]);

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

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-rose-500 py-8">
          Error: {error.message}
        </div>
      </div>
    );
  }

  const renderPaginationItems = () => {
    if (!meta) return null;
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(meta.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={page === i}
            onClick={() => setPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < meta.totalPages) {
      if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" />);
      items.push(
        <PaginationItem key={meta.totalPages}>
          <PaginationLink onClick={() => setPage(meta.totalPages)}>{meta.totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Modules</h1>
          <p className="text-muted-foreground">Manage learning modules and curriculum content.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="rounded-full shadow-lg shadow-primary/20 bg-primary">Create Module</Button>
      </div>

      <div className="zen-card rounded-2xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
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

        <div className="mt-6">
          <ModulesTable
            data={modules}
            onEdit={setEditingModule}
            onDelete={setDeletingModule}
            onView={setViewingModule}
            page={page}
            limit={queryParams.limit || 10}
            courseTitleMap={courseTitleMap}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {meta && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border/40 px-6">
              <div className="text-sm zen-text-muted">
                Showing <span className="font-semibold text-foreground">{modules.length}</span> of <span className="font-semibold text-foreground">{meta.total}</span> modules
              </div>

              {meta.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        className={page === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
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
