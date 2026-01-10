import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import type { QuestionQueryDTO, QuestionResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useQuestions, useApproveQuestion, useDeactivateQuestion, useRejectQuestion, useSendForReviewQuestion } from "@/api/services/questions.ts";
import { QuestionsPrimaryToolbar } from "@/components/questions/questions-primary-toolbar.tsx";
import { QuestionsTable } from "@/components/questions/questions-table.tsx";
import { CreateQuestionDialog } from "@/components/questions/create-question-dialog.tsx";
import { ViewQuestionDialog } from "@/components/questions/view-question-dialog.tsx";
import { DeleteQuestionDialog } from "@/components/questions/delete-question-dialog.tsx";
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
import { toast } from '@workspace/ui/components/sonner';
import { QuestionType, QuestionStatus, QuestionCategory, QuestionDifficultyLevel, QuestionJlptLevel } from '@workspace/schemas';
import { cn } from '@workspace/ui/lib/utils';

export default function QuestionsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [questionTypeFilter, setQuestionTypeFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [poolIdFilter, setPoolIdFilter] = useState<string>('');

    // Dialog States
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [viewingQuestion, setViewingQuestion] = useState<QuestionResponseDTO | null>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<QuestionResponseDTO | null>(null);

    const queryParams: QuestionQueryDTO = {
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(questionTypeFilter && { questionType: questionTypeFilter as QuestionType }),
        ...(categoryFilter && { category: categoryFilter as QuestionCategory }),
        ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as QuestionJlptLevel }),
        ...(difficultyFilter && { difficulty: difficultyFilter as QuestionDifficultyLevel }),
        ...(statusFilter && { status: statusFilter as QuestionStatus }),
        ...(poolIdFilter && { poolId: poolIdFilter }),
    };

    const { data: questionsData, isLoading, error } = useQuestions(queryParams);
    const approveMutation = useApproveQuestion();
    const deactivateMutation = useDeactivateQuestion();
    const rejectMutation = useRejectQuestion();
    const sendForReviewMutation = useSendForReviewQuestion();

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, questionTypeFilter, categoryFilter, jlptLevelFilter, difficultyFilter, statusFilter, poolIdFilter]);

    const questions = questionsData?.data || [];
    const meta = questionsData ? {
        total: questionsData.total,
        totalPages: questionsData.totalPages,
        page: questionsData.page,
        limit: questionsData.limit
    } : null;

    const handleApprove = async (question: QuestionResponseDTO) => {
        try {
            await approveMutation.mutateAsync(question.id);
            toast.success('Question approved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve question');
        }
    };

    const handleDeactivate = async (question: QuestionResponseDTO) => {
        try {
            await deactivateMutation.mutateAsync(question.id);
            toast.success('Question deactivated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to deactivate question');
        }
    };

    const handleReject = async (question: QuestionResponseDTO) => {
        try {
            await rejectMutation.mutateAsync(question.id);
            toast.success('Question rejected successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject question');
        }
    };

    const handleSendForReview = async (question: QuestionResponseDTO) => {
        try {
            await sendForReviewMutation.mutateAsync(question.id);
            toast.success('Question sent for review successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send question for review');
        }
    };

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
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(1);
                        }}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(i);
                        }}
                        className={cn(
                            "cursor-pointer transition-colors",
                            page === i ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
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
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(meta.totalPages);
                        }}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        {meta.totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl rounded-2xl">
            <div className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Can permission="question.create">
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="w-full sm:w-auto rounded-lg shadow-lg shadow-primary/20 bg-primary text-sm sm:text-base"
                            size="sm"
                        >
                            Create Question
                        </Button>
                    </Can>
                </div>

                <QuestionsPrimaryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    questionTypeFilter={questionTypeFilter}
                    onQuestionTypeFilterChange={setQuestionTypeFilter}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    jlptLevelFilter={jlptLevelFilter}
                    onJlptLevelFilterChange={setJlptLevelFilter}
                    difficultyFilter={difficultyFilter}
                    onDifficultyFilterChange={setDifficultyFilter}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    poolIdFilter={poolIdFilter}
                    onPoolIdFilterChange={setPoolIdFilter}
                />

                <div className="mt-4 sm:mt-6 rounded-xl border border-border/40 overflow-visible sm:overflow-hidden">
                    <div className="overflow-x-auto">
                        <QuestionsTable
                            data={questions}
                            onView={setViewingQuestion}
                            onEdit={() => {}}
                            onDelete={setDeletingQuestion}
                            onApprove={handleApprove}
                            onDeactivate={handleDeactivate}
                            onReject={handleReject}
                            onSendForReview={handleSendForReview}
                            page={page}
                            limit={queryParams.limit || 10}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                {/* Pagination */}
                {meta && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6 border-t border-border/40 mt-4 sm:mt-6 px-2">
                        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left w-full sm:w-auto">
                            <div>
                                Showing <span className="font-semibold text-foreground">{questions.length}</span> of <span className="font-semibold text-foreground">{meta.total}</span> questions
                            </div>
                            {meta.totalPages > 0 && (
                                <div className="mt-1 sm:mt-0 sm:inline sm:ml-2">
                                    (Page {page} of {meta.totalPages})
                                </div>
                            )}
                        </div>

                        {meta.totalPages > 1 ? (
                            <Pagination>
                                <PaginationContent className="flex-wrap justify-center">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.max(1, p - 1));
                                            }}
                                            className={cn(
                                                page === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
                                                "transition-colors"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="hidden sm:flex">
                                        {renderPaginationItems()}
                                    </div>
                                    <div className="sm:hidden text-sm font-medium px-2">
                                        {page} / {meta.totalPages}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p => Math.min(meta.totalPages, p + 1));
                                            }}
                                            className={cn(
                                                page === meta.totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
                                                "transition-colors"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        ) : meta.totalPages === 1 ? (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                                All results on one page
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <CreateQuestionDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <ViewQuestionDialog
                open={!!viewingQuestion}
                onOpenChange={(open) => !open && setViewingQuestion(null)}
                question={viewingQuestion}
            />

            <DeleteQuestionDialog
                open={!!deletingQuestion}
                onOpenChange={(open) => !open && setDeletingQuestion(null)}
                question={deletingQuestion}
            />
        </div>
    );
}

