'use client';

import { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@workspace/ui/components/item';
import { Spinner } from '@workspace/ui/components/spinner';
import { cn } from '@workspace/ui/lib/utils';
import { useCourseAssignments, type AssignmentResponseDTO } from '@/lib/api/services/assignment-api';
import { AssignmentSubmission } from './assignment-submission';
import { useCourseEnrollment } from '@/hooks/use-course-enrollment';
import { formatDate } from '@/utils/format-utils';

interface CourseAssignmentsListProps {
  courseId: string;
  courseSlug: string;
  onAssignmentClick?: (assignmentId: string) => void;
}

type FilterStatus = 'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED';

export function CourseAssignmentsList({ courseId, courseSlug, onAssignmentClick }: CourseAssignmentsListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponseDTO | null>(null);
  const { isEnrolled, isLoadingEnrollment } = useCourseEnrollment(courseId, courseSlug);
  const { data, isLoading: isLoadingAssignments } = useCourseAssignments({ courseId, status: 'PUBLISHED' });

  // Hide for non-enrolled users
  if (!isLoadingEnrollment && !isEnrolled) {
    return null;
  }

  const allAssignments = data?.data || [];

  // Filter assignments based on selected filter
  const assignments = allAssignments.filter(assignment => {
    if (filterStatus === 'ALL') return true;

    if (filterStatus === 'PENDING') {
      // Show assignments that are not submitted or only have draft
      return !assignment.userSubmissionStatus || assignment.userSubmissionStatus === 'DRAFT';
    }

    if (filterStatus === 'SUBMITTED') {
      return assignment.userSubmissionStatus === 'SUBMITTED';
    }

    if (filterStatus === 'GRADED') {
      return assignment.userSubmissionStatus === 'GRADED';
    }

    return true;
  });

  const getStatusBadge = (assignment: AssignmentResponseDTO) => {
    // Check user's submission status first
    if (assignment.userSubmissionStatus) {
      if (assignment.userSubmissionStatus === 'GRADED') {
        return {
          icon: CheckCircle2,
          label: 'Đã chấm',
          className: 'bg-green-500/10 border-green-500/20 text-green-500',
        };
      }
      if (assignment.userSubmissionStatus === 'SUBMITTED') {
        return {
          icon: CheckCircle2,
          label: 'Đã nộp',
          className: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
        };
      }
      if (assignment.userSubmissionStatus === 'DRAFT') {
        return {
          icon: Clock,
          label: 'Nháp',
          className: 'bg-gray-500/10 border-gray-500/20 text-gray-500',
        };
      }
    }

    // If no submission, check due date
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const isOverdue = dueDate && new Date() > dueDate;

    if (isOverdue) {
      return {
        icon: AlertCircle,
        label: 'Quá hạn',
        className: 'bg-red-500/10 border-red-500/20 text-red-500',
      };
    }

    return {
      icon: Clock,
      label: 'Chưa nộp',
      className: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    };
  };

  if (isLoadingEnrollment || isLoadingAssignments) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (allAssignments.length === 0) {
    return (
      <Empty className="py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="w-20 h-20 bg-muted/20">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Chưa có bài tập</EmptyTitle>
          <EmptyDescription>
            Khóa học này chưa có bài tập nào được công bố
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tight">
              Bài tập khóa học
            </h2>
          </div>
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-6">
            Course assignments & progress
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-muted/5 border border-border/20 shadow-sm">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
            {assignments.length} assignments
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/5 border border-border/10 rounded-3xl w-fit">
        {[
          { id: 'ALL', label: 'Tất cả' },
          { id: 'PENDING', label: 'Chưa nộp' },
          { id: 'SUBMITTED', label: 'Đã nộp' },
          { id: 'GRADED', label: 'Đã chấm' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setFilterStatus(filter.id as FilterStatus)}
            className={cn(
              'px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300',
              filterStatus === filter.id
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                : 'text-muted-foreground hover:text-primary hover:bg-background'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Empty state for filtered results */}
      {assignments.length === 0 && (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="w-16 h-16 bg-muted/20">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Không có bài tập</EmptyTitle>
            <EmptyDescription>
              {filterStatus === 'PENDING' && 'Bạn đã nộp tất cả bài tập'}
              {filterStatus === 'SUBMITTED' && 'Chưa có bài tập nào đã nộp'}
              {filterStatus === 'GRADED' && 'Chưa có bài tập nào được chấm điểm'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Assignments Grid */}
      <div className="grid gap-6">
        {assignments.map((assignment) => {
          const status = getStatusBadge(assignment);
          const StatusIcon = status.icon;
          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
          const isOverdue = dueDate && new Date() > dueDate && (!assignment.userSubmissionStatus || assignment.userSubmissionStatus === 'DRAFT');

          return (
            <Item
              key={assignment.id}
              onClick={() => {
                if (onAssignmentClick) {
                  onAssignmentClick(assignment.id);
                } else {
                  setSelectedAssignment(assignment);
                }
              }}
              variant="outline"
              className="cursor-pointer group hover:border-primary/30 transition-all p-4 sm:p-6"
            >
              <ItemMedia className="bg-primary/5 text-primary rounded-xl p-3 shrink-0">
                <FileText className="w-6 h-6" />
              </ItemMedia>
              <ItemContent className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.1em] px-2 py-0.5 rounded-md bg-primary/10">{assignment.type}</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Unit {assignment.order || 0}</span>
                </div>
                <ItemTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {assignment.title}
                </ItemTitle>
                {assignment.description && (
                  <ItemDescription className="line-clamp-1">
                    {assignment.description.replace(/<[^>]*>/g, '')}
                  </ItemDescription>
                )}
              </ItemContent>

              <ItemActions className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                <div className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm shrink-0',
                  status.className
                )}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 hidden md:flex">
                  {dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Clock className={cn("w-3.5 h-3.5", isOverdue ? "text-rose-500" : "text-muted-foreground/60")} />
                      <span className={cn("text-xs font-semibold", isOverdue ? "text-rose-600" : "text-muted-foreground")}>
                        {formatDate(dueDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {assignment.maxScore} PTS
                    </span>
                  </div>
                </div>
              </ItemActions>
            </Item>
          );
        })}
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-background/95 rounded-[3rem] border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-8 bg-background/50 backdrop-blur-md border-b border-border/20">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                  <h2 className="text-2xl font-black italic text-foreground uppercase tracking-tight leading-none">
                    Chi tiết bài tập
                  </h2>
                </div>
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-5">
                  {selectedAssignment.title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAssignment(null)}
                className="h-12 w-12 rounded-2xl hover:bg-muted/10 hover:text-primary transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              <AssignmentSubmission assignmentId={selectedAssignment.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
