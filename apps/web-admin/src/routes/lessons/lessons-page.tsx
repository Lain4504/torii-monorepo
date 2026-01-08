import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { LessonsTable } from '@/components/lessons/lessons-table.tsx';
import { LessonsPrimaryToolbar } from '@/components/lessons/lessons-primary-toolbar.tsx';
import { CreateLessonDialog } from '@/components/lessons/create-lesson-dialog.tsx';
import { EditLessonDialog } from '@/components/lessons/edit-lesson-dialog.tsx';
import { DeleteLessonDialog } from '@/components/lessons/delete-lesson-dialog.tsx';
import { ViewLessonDialog } from '@/components/lessons/view-lesson-dialog.tsx';
import type { LessonQueryDTO, LessonResponseDTO } from '@workspace/schemas';
import { useLessons } from "@/api/services/lesson.ts";
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

export default function LessonsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('');
  const location = useLocation();
  const [moduleIdFilter] = useState(() => new URLSearchParams(location.search).get('moduleId') || '');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponseDTO | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonResponseDTO | null>(null);
  const [viewingLesson, setViewingLesson] = useState<LessonResponseDTO | null>(null);

  const queryParams: LessonQueryDTO = {
    page,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(contentTypeFilter && { contentType: contentTypeFilter as any }),
    ...(moduleIdFilter && { moduleId: moduleIdFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data: lessonsData, isLoading } = useLessons(queryParams);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, contentTypeFilter, moduleIdFilter, statusFilter]);

  const lessons = lessonsData?.data || [];
  const meta = lessonsData ? {
    total: lessonsData.total,
    totalPages: lessonsData.totalPages,
    page: lessonsData.page,
    limit: lessonsData.limit
  } : null;

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
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Lessons</h1>
          <p className="text-muted-foreground">Manage all lessons in the system.</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="rounded-full shadow-lg shadow-primary/20 bg-primary"
        >
          Create Lesson
        </Button>
      </div>

      <div className="zen-card rounded-2xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <LessonsPrimaryToolbar
            search={search}
            onSearchChange={setSearch}
            contentTypeFilter={contentTypeFilter}
            onContentTypeFilterChange={setContentTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        <div className="mt-6">
          <LessonsTable
            data={lessons}
            onEdit={setEditingLesson}
            onDelete={setDeletingLesson}
            onView={setViewingLesson}
            page={page}
            limit={queryParams.limit || 10}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {meta && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border/40 px-6">
              <div className="text-sm zen-text-muted">
                Showing <span className="font-semibold text-foreground">{lessons.length}</span> of <span className="font-semibold text-foreground">{meta.total}</span> lessons
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
      <CreateLessonDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} moduleId={moduleIdFilter} />

      <EditLessonDialog
        open={!!editingLesson}
        onOpenChange={(open) => !open && setEditingLesson(null)}
        lesson={editingLesson}
      />

      <DeleteLessonDialog
        open={!!deletingLesson}
        onOpenChange={(open) => !open && setDeletingLesson(null)}
        lesson={deletingLesson}
      />

      <ViewLessonDialog
        open={!!viewingLesson}
        onOpenChange={(open) => !open && setViewingLesson(null)}
        lesson={viewingLesson}
      />
    </div>
  );
}
