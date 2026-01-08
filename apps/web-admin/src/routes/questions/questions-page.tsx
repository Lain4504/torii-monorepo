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

export default function QuestionsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [questionTypeFilter, setQuestionTypeFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

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
    };

    const { data: questionsData, isLoading, error } = useQuestions(queryParams);
    const approveMutation = useApproveQuestion();
    const deactivateMutation = useDeactivateQuestion();
    const rejectMutation = useRejectQuestion();
    const sendForReviewMutation = useSendForReviewQuestion();

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, questionTypeFilter, categoryFilter, jlptLevelFilter, difficultyFilter, statusFilter]);

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
        <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="space-y-1 sm:space-y-1.5 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        Questions
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Manage questions for quizzes and assessments.
                    </p>
                </div>
                <Can permission="question.create">
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="w-full sm:w-auto rounded-full shadow-sm hover:shadow-md transition-all bg-primary min-h-[44px] px-6"
                    >
                        Create Question
                    </Button>
                </Can>
            </div>

            <div className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow duration-300 rounded-xl p-0 overflow-hidden">
                <div className="p-6 pb-0">
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
                    />
                </div>

                <div className="mt-6">
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

                    {/* Pagination */}
                    {meta && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6 border-t border-border/30 px-4 sm:px-6">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{questions.length}</span> of <span className="font-semibold text-foreground">{meta.total}</span> questions
                            </div>

                            {meta.totalPages > 1 && (
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted/50 transition-colors"}
                                            />
                                        </PaginationItem>

                                        {renderPaginationItems()}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                                className={page === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted/50 transition-colors"}
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

