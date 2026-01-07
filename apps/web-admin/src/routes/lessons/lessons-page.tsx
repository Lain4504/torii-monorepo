import { useState } from 'react';
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

export default function LessonsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('');
  const location = useLocation();
  // @ts-ignore
  const [moduleIdFilter, setModuleIdFilter] = useState(() => new URLSearchParams(location.search).get('moduleId') || '');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponseDTO | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonResponseDTO | null>(null);
  const [viewingLesson, setViewingLesson] = useState<LessonResponseDTO | null>(null);

  const queryParams: LessonQueryDTO = {
    page,
    limit: 10,
    ...(search && { search }),
    ...(contentTypeFilter && { contentType: contentTypeFilter as any }),
    ...(moduleIdFilter && { moduleId: moduleIdFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data: lessonsData, isLoading } = useLessons(queryParams);

  const lessons = lessonsData?.data || [];
  const meta = lessonsData ? {
    total: lessonsData.total,
    totalPages: lessonsData.totalPages,
    page: lessonsData.page,
    limit: lessonsData.limit
  } : null;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Lessons</h1>
          <p className="text-muted-foreground">Manage all lessons in the system.</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="rounded-full shadow-lg shadow-primary/20"
        >
          Create Lesson
        </Button>
      </div>

      <div className="zen-card rounded-2xl overflow-hidden">
        <div className="p-6">
          <LessonsPrimaryToolbar
            search={search}
            onSearchChange={setSearch}
            contentTypeFilter={contentTypeFilter}
            onContentTypeFilterChange={setContentTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <div className="mt-6 rounded-xl border border-border/40 overflow-hidden bg-transparent">
            <LessonsTable
              data={lessons}
              onEdit={setEditingLesson}
              onDelete={setDeletingLesson}
              onView={setViewingLesson}
              page={page}
              limit={queryParams.limit || 10}
              isLoading={isLoading}
            />
          </div>

          {/* Pagination */}
          {meta && (
            <div className="flex items-center justify-between p-6 border-t border-border/40 mt-6 -mx-6 -mb-6">
              <div className="flex-1 text-sm zen-text-muted">
                Showing {lessons.length} of {meta.total} lessons
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-full hover:bg-primary/5 h-9 px-4"
                >
                  Previous
                </Button>
                <div className="text-sm font-medium px-4">
                  Page {page} of {meta.totalPages}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-full hover:bg-primary/5 h-9 px-4"
                >
                  Next
                </Button>
              </div>
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
