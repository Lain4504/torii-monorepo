'use client';

import { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useCourseAssignments, type AssignmentResponseDTO } from '@/apis/services/assignment-api';
import { AssignmentSubmission } from './assignment-submission';

interface CourseAssignmentsListProps {
  courseId: string;
  onAssignmentClick?: (assignmentId: string) => void;
}

type FilterStatus = 'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED';

export function CourseAssignmentsList({ courseId, onAssignmentClick }: CourseAssignmentsListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponseDTO | null>(null);
  const { data, isLoading } = useCourseAssignments({ courseId, status: 'PUBLISHED' });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (allAssignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">Chưa có bài tập</h3>
          <p className="text-sm text-muted-foreground">
            Khóa học này chưa có bài tập nào được công bố
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary/40 rounded-full" />
          <h2 className="text-2xl font-sans font-bold italic text-foreground uppercase tracking-tight">
            Bài tập khóa học
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            {assignments.length} bài tập
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/20 rounded-full w-fit">
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
              'px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all',
              filterStatus === filter.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground/60 hover:text-primary hover:bg-background/40'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Empty state for filtered results */}
      {assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Không có bài tập</h3>
            <p className="text-sm text-muted-foreground">
              {filterStatus === 'PENDING' && 'Bạn đã nộp tất cả bài tập'}
              {filterStatus === 'SUBMITTED' && 'Chưa có bài tập nào đã nộp'}
              {filterStatus === 'GRADED' && 'Chưa có bài tập nào được chấm điểm'}
            </p>
          </div>
        </div>
      )}

      {/* Assignments Grid */}
      <div className="grid gap-4">
        {assignments.map((assignment) => {
          const status = getStatusBadge(assignment);
          const StatusIcon = status.icon;
          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

          return (
            <div
              key={assignment.id}
              onClick={() => {
                if (onAssignmentClick) {
                  onAssignmentClick(assignment.id);
                } else {
                  setSelectedAssignment(assignment);
                }
              }}
              className="group p-6 rounded-2xl border border-border/20 bg-muted/5 hover:bg-background hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-sans font-bold italic text-foreground tracking-tight uppercase line-clamp-2 group-hover:text-primary transition-colors">
                        {assignment.title}
                      </h3>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {assignment.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0',
                    status.className
                  )}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  {dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-bold uppercase tracking-wide">
                        Hạn: {dueDate.toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="font-bold uppercase tracking-wide">
                      Điểm tối đa: {assignment.maxScore}
                    </span>
                  </div>
                  {assignment.passingScore && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase tracking-wide">
                        Điểm đạt: {assignment.passingScore}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-background rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-background/95 backdrop-blur-sm border-b border-border">
              <div>
                <h2 className="text-2xl font-sans font-bold italic text-foreground uppercase tracking-tight">
                  Chi tiết bài tập
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedAssignment.title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAssignment(null)}
                className="h-10 w-10 rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
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
