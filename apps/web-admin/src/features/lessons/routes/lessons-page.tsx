import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLessons } from '@/features/lessons/api/lesson';
import { Button } from '@workspace/ui/components/button';
import { LessonsTable } from '@/features/lessons/components/lessons-table';
import { LessonsPrimaryToolbar } from '@/features/lessons/components/lessons-primary-toolbar';
import { CreateLessonDialog } from '@/features/lessons/components/create-lesson-dialog';
import { EditLessonDialog } from '@/features/lessons/components/edit-lesson-dialog';
import { DeleteLessonDialog } from '@/features/lessons/components/delete-lesson-dialog';
import { ViewLessonDialog } from '@/features/lessons/components/view-lesson-dialog';
import type { LessonQueryDto, LessonResponseDto } from '@workspace/dtos';

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
  const [editingLesson, setEditingLesson] = useState<LessonResponseDto | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonResponseDto | null>(null);
  const [viewingLesson, setViewingLesson] = useState<LessonResponseDto | null>(null);

  const queryParams: LessonQueryDto = {
    page,
    limit: 10,
    ...(search && { search }),
    ...(contentTypeFilter && { contentType: contentTypeFilter as any }),
    ...(moduleIdFilter && { moduleId: moduleIdFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data: lessonsData, isLoading, error } = useLessons(queryParams);

  const lessons = lessonsData?.data || [];
  const meta = lessonsData?.meta;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading lessons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500 py-8">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground">Manage all lessons in the system</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>Create Lesson</Button>
      </div>

      <LessonsPrimaryToolbar
        search={search}
        onSearchChange={setSearch}
        contentTypeFilter={contentTypeFilter}
        onContentTypeFilterChange={setContentTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <LessonsTable
        data={lessons}
        onEdit={setEditingLesson}
        onDelete={setDeletingLesson}
        onView={setViewingLesson}
        page={page}
        limit={queryParams.limit || 10}
      />

      {/* Pagination */}
      {meta && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {lessons.length} of {meta.total} lessons
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
