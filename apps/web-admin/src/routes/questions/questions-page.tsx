import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import type { QuestionQueryDTO, QuestionResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useQuestions, useApproveQuestion, useDeactivateQuestion, useRejectQuestion, useSendForReviewQuestion } from "@/api/services/questions.ts";
import { QuestionsPrimaryToolbar } from "@/components/questions/questions-primary-toolbar.tsx";
import { QuestionsTable } from "@/components/questions/questions-table.tsx";
import { CreateQuestionDialog } from "@/components/questions/create-question-dialog.tsx";
import { ViewQuestionDialog } from "@/components/questions/view-question-dialog.tsx";
import { EditQuestionDialog } from "@/components/questions/edit-question-dialog.tsx";
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
import { Card } from "@workspace/ui/components/card";
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
            <div className="flex flex-col items-center justify-center p-20 space-y-4 rounded-3xl border border-dashed text-center animate-in fade-in duration-500">
                <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="size-8 text-destructive" />
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
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
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
                            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group"
                        >
                            Tạo Câu hỏi
                            <Plus className="ml-2 size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
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
            <Card className="rounded-xl border-border bg-card overflow-hidden shadow-sm p-0">
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
            </Card>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <div>Trang {page} / {meta.totalPages}</div>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <div>Tổng cộng: <span className="text-foreground font-semibold">{meta.total}</span> câu hỏi</div>
                    </div>

                    <Pagination>
                        <PaginationContent className="flex items-center gap-2">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (page > 1) setPage(p => p - 1);
                                    }}
                                    className={cn(
                                        "h-10 px-4 rounded-xl bg-card border border-border/20 text-xs font-medium transition-all",
                                        page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
                                    )}
                                />
                            </PaginationItem>

                            <div className="hidden md:flex items-center gap-1 mx-2">
                                {renderPaginationItems()}
                            </div>

                            <PaginationItem>
                                <PaginationNext
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (page < meta.totalPages) setPage(p => p + 1);
                                    }}
                                    className={cn(
                                        "h-10 px-4 rounded-xl bg-card border border-border/20 text-xs font-medium transition-all",
                                        page === meta.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

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

            <EditQuestionDialog
                open={!!editingQuestion}
                onOpenChange={(open) => !open && setEditingQuestion(null)}
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
