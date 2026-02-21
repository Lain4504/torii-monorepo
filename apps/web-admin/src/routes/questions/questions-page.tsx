import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import type { QuestionQueryDTO, QuestionResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useQuestions, useApproveQuestion, useDeactivateQuestion, useRejectQuestion, useSendForReviewQuestion } from "@/api/services/questions.ts";
import { QuestionsPrimaryToolbar } from "@/components/questions/questions-primary-toolbar.tsx";
import { QuestionsTable } from "@/components/questions/questions-table.tsx";
import { QuestionFormSheet } from "@/components/questions/question-form-sheet";
import { QuestionDetailSheet } from "@/components/questions/question-detail-sheet";
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
import { Plus, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';

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
    const [editingQuestion, setEditingQuestion] = useState<QuestionResponseDTO | null>(null);
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
            toast.success('Duyệt câu hỏi thành công');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Duyệt câu hỏi thất bại');
        }
    };

    const handleDeactivate = async (question: QuestionResponseDTO) => {
        try {
            await deactivateMutation.mutateAsync(question.id);
            toast.success('Đã ngưng kích hoạt câu hỏi');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ngưng kích hoạt câu hỏi thất bại');
        }
    };

    const handleReject = async (question: QuestionResponseDTO) => {
        try {
            await rejectMutation.mutateAsync(question.id);
            toast.success('Đã từ chối câu hỏi thành công');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Từ chối câu hỏi thất bại');
        }
    };

    const handleSendForReview = async (question: QuestionResponseDTO) => {
        try {
            await sendForReviewMutation.mutateAsync(question.id);
            toast.success('Đã gửi yêu cầu xét duyệt thành công');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gửi yêu cầu xét duyệt thất bại');
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4 rounded-xl border border-dashed text-center">
                <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <ShieldAlert className="size-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Lỗi tải Danh sách Câu hỏi</h3>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
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
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all cursor-pointer"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-20" />);
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
                            "rounded-xl h-10 w-10 text-[11px] font-black transition-all cursor-pointer",
                            page === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground/60 hover:text-primary"
                        )}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < meta.totalPages) {
            if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-20" />);
            items.push(
                <PaginationItem key={meta.totalPages}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(meta.totalPages);
                        }}
                        className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all cursor-pointer"
                    >
                        {meta.totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Page Header */}
            <PageHeader
                title="Ngân hàng Câu hỏi"
                subtitle="Quản lý và tổ chức câu hỏi thi"
                stats={[
                    {
                        label: 'Tổng số',
                        value: meta?.total || 0,
                    },
                ]}
                actions={
                    <Can permission="question.create">
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                        >
                            <Plus className="mr-2 size-4" />
                            Tạo Câu hỏi
                        </Button>
                    </Can>
                }
            />

            {/* Filters */}
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

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <QuestionsTable
                    data={questions}
                    onView={setViewingQuestion}
                    onEdit={setEditingQuestion}
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

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="text-muted-foreground">Trang {page} / {meta.totalPages}</div>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <div className="text-muted-foreground">Tổng cộng: <span className="text-foreground font-semibold">{meta.total}</span> câu hỏi</div>
                    </div>

                    <Pagination>
                        <PaginationContent className="gap-2">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (page > 1) setPage(p => p - 1);
                                    }}
                                    className={cn(
                                        page === 1 && "opacity-30 pointer-events-none"
                                    )}
                                />
                            </PaginationItem>

                            <div className="hidden md:flex items-center gap-1">
                                {renderPaginationItems()}
                            </div>

                            <PaginationItem>
                                <PaginationNext
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (page < meta.totalPages) setPage(p => p + 1);
                                    }}
                                    className={cn(
                                        page === meta.totalPages && "opacity-30 pointer-events-none"
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Sheets & Dialogs */}
            <QuestionFormSheet
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <QuestionDetailSheet
                open={!!viewingQuestion}
                onOpenChange={(open: boolean) => !open && setViewingQuestion(null)}
                question={viewingQuestion}
            />

            <QuestionFormSheet
                open={!!editingQuestion}
                onOpenChange={(open: boolean) => !open && setEditingQuestion(null)}
                question={editingQuestion}
            />

            <DeleteQuestionDialog
                open={!!deletingQuestion}
                onOpenChange={(open) => !open && setDeletingQuestion(null)}
                question={deletingQuestion}
            />
        </div>
    );
}
