'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, FileText, Filter, X } from 'lucide-react'
import type { AssignmentResponseDTO } from '@/lib/api/services/assignment-api'
import { useCourseAssignments } from '@/lib/api/services/assignment-api'
import { Button } from '@workspace/ui/components/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@workspace/ui/components/item'
import { Spinner } from '@workspace/ui/components/spinner'
import { cn } from '@workspace/ui/lib/utils'

import { useCourseEnrollment } from '@/hooks/use-course-enrollment'
import { formatDate } from '@/utils/format-utils'

import { AssignmentSubmission } from './assignment-submission'

interface CourseAssignmentsListProps {
  courseId: string
  courseSlug: string
  onAssignmentClick?: (assignmentId: string) => void
}

type FilterStatus = 'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'

export function CourseAssignmentsList({ courseId, courseSlug, onAssignmentClick }: CourseAssignmentsListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponseDTO | null>(null)
  const { isEnrolled, isLoadingEnrollment } = useCourseEnrollment(courseId, courseSlug)
  const { data, isLoading: isLoadingAssignments } = useCourseAssignments({ courseId, status: 'PUBLISHED' })

  // Hide for non-enrolled users
  if (!isLoadingEnrollment && !isEnrolled) {
    return null
  }

  const allAssignments = data?.data || []

  // Filter assignments based on selected filter
  const assignments = allAssignments.filter((assignment) => {
    if (filterStatus === 'ALL')
      return true

    if (filterStatus === 'PENDING') {
      // Show assignments that are not submitted or only have draft
      return !assignment.userSubmissionStatus || assignment.userSubmissionStatus === 'DRAFT'
    }

    if (filterStatus === 'SUBMITTED') {
      return assignment.userSubmissionStatus === 'SUBMITTED'
    }

    if (filterStatus === 'GRADED') {
      return assignment.userSubmissionStatus === 'GRADED'
    }

    return true
  })

  const getStatusBadge = (assignment: AssignmentResponseDTO) => {
    // Check user's submission status first
    if (assignment.userSubmissionStatus) {
      if (assignment.userSubmissionStatus === 'GRADED') {
        return {
          icon: CheckCircle2,
          label: 'Đã chấm',
          className: 'border-primary/20 bg-primary/10 text-primary',
        }
      }
      if (assignment.userSubmissionStatus === 'SUBMITTED') {
        return {
          icon: CheckCircle2,
          label: 'Đã nộp',
          className: 'border-border/50 bg-muted/50 text-foreground',
        }
      }
      if (assignment.userSubmissionStatus === 'DRAFT') {
        return {
          icon: Clock,
          label: 'Nháp',
          className: 'border-gray-500/20 bg-gray-500/10 text-gray-500',
        }
      }
    }

    // If no submission, check due date
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
    const isOverdue = dueDate && new Date() > dueDate

    if (isOverdue) {
      return {
        icon: AlertCircle,
        label: 'Quá hạn',
        className: 'border-destructive/20 bg-destructive/10 text-destructive',
      }
    }

    return {
      icon: Clock,
      label: 'Chưa nộp',
      className: 'border-border/50 bg-muted/30 text-muted-foreground',
    }
  }

  if (isLoadingEnrollment || isLoadingAssignments) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  if (allAssignments.length === 0) {
    return (
      <Empty className="py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="h-20 w-20 bg-muted/20">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Chưa có bài tập</EmptyTitle>
          <EmptyDescription>
            Khóa học này chưa có bài tập nào được công bố
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="h-6 w-1 bg-primary" />
            <h2 className="text-3xl font-black italic uppercase tracking-tight text-foreground">
              Bài tập khóa học
            </h2>
          </div>
          <p className="ml-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            Course assignments & progress
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border/20 bg-muted/5 px-6 py-3 shadow-sm">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
            {assignments.length} assignments
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="w-fit flex-wrap items-center gap-2 border border-border/30 bg-muted/20 p-1 flex rounded-lg">
        {[
          { id: 'ALL', label: 'Tất cả' },
          { id: 'PENDING', label: 'Chưa nộp' },
          { id: 'SUBMITTED', label: 'Đã nộp' },
          { id: 'GRADED', label: 'Đã chấm' },
        ].map(filter => (
          <Button
            key={filter.id}
            variant={filterStatus === filter.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterStatus(filter.id as FilterStatus)}
            className={cn(
              'px-5 py-2 text-[10px] font-bold uppercase tracking-widest',
              filterStatus === filter.id ? '' : 'text-muted-foreground',
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Empty state for filtered results */}
      {assignments.length === 0 && (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="h-16 w-16 bg-muted/20">
              <FileText className="h-8 w-8 text-muted-foreground" />
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
          const status = getStatusBadge(assignment)
          const StatusIcon = status.icon
          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
          const isOverdue = dueDate && new Date() > dueDate && (!assignment.userSubmissionStatus || assignment.userSubmissionStatus === 'DRAFT')

          return (
            <Item
              key={assignment.id}
              onClick={() => {
                if (onAssignmentClick) {
                  onAssignmentClick(assignment.id)
                }
                else {
                  setSelectedAssignment(assignment)
                }
              }}
              variant="outline"
              className="group cursor-pointer p-4 transition-all hover:border-primary/30 sm:p-6"
            >
              <ItemMedia className="shrink-0 rounded-xl bg-primary/5 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </ItemMedia>
              <ItemContent className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{assignment.type}</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Unit {assignment.order || 0}</span>
                </div>
                <ItemTitle className="line-clamp-1 text-lg transition-colors group-hover:text-primary">
                  {assignment.title}
                </ItemTitle>
                {assignment.description && (
                  <ItemDescription className="line-clamp-1">
                    {assignment.description.replace(/<[^>]*>/g, '')}
                  </ItemDescription>
                )}
              </ItemContent>

              <ItemActions className="shrink-0 flex-col items-end gap-3 sm:flex-row sm:items-center flex">
                <div className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs',
                  status.className,
                )}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {status.label}
                  </span>
                </div>

                <div className="hidden items-center gap-4 md:flex">
                  {dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Clock className={cn('h-3.5 w-3.5', isOverdue ? 'text-destructive' : 'text-muted-foreground/60')} />
                      <span className={cn('text-xs font-semibold', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                        {formatDate(dueDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {assignment.maxScore} PTS
                    </span>
                  </div>
                </div>
              </ItemActions>
            </Item>
          )
        })}
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border/50 bg-background shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/20 bg-background/50 px-10 py-8 backdrop-blur-md">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                  <h2 className="text-2xl font-black italic uppercase leading-none tracking-tight text-foreground">
                    Chi tiết bài tập
                  </h2>
                </div>
                <p className="ml-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                  {selectedAssignment.title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAssignment(null)}
                className="h-12 w-12 rounded-2xl transition-all duration-300 hover:bg-muted/10 hover:text-primary"
              >
                <X className="h-6 w-6" />
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
  )
}
