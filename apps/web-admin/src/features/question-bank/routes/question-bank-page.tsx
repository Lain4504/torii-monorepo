import { useState, useMemo } from 'react';
import { useQuestionBanks } from '@/features/question-bank/api/question-bank';
import type {
    QuestionBankQueryDto,
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
    QuestionBankDto,
} from '@workspace/dtos';
import type { QuestionBankFilters } from '@/features/question-bank/api/question-bank';
import { QuestionBankPrimaryToolbar } from '@/features/question-bank/components/question-bank-primary-toolbar';
import { QuestionBankTable } from '@/features/question-bank/components/question-bank-table';
import { CreateQuestionBankDialog } from '@/features/question-bank/components/create-question-bank-dialog';
import { EditQuestionBankDialog } from '@/features/question-bank/components/edit-question-bank-dialog';
import { ViewQuestionBankDialog } from '@/features/question-bank/components/view-question-bank-dialog';
import { DeleteQuestionBankDialog } from '@/features/question-bank/components/delete-question-bank-dialog';
import { Button } from '@workspace/ui/components/button';

export function QuestionBankPage() {
    // Filters state
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [filters, setFilters] = useState<QuestionBankFilters>({
        search: '',
        questionType: '',
        jlptLevel: '',
        difficulty: '',
        status: '',
        category: '',
    });

    // Build query params
    const queryParams: QuestionBankQueryDto = useMemo(
        () => ({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            ...(filters.search && filters.search.trim() && { search: filters.search.trim() }),
            ...(filters.questionType && { questionType: filters.questionType as QuestionType }),
            ...(filters.jlptLevel && { jlptLevel: filters.jlptLevel as QuestionJlptLevel }),
            ...(filters.difficulty && { difficulty: filters.difficulty as QuestionDifficultyLevel }),
            ...(filters.status && { status: filters.status as QuestionStatus }),
            ...(filters.category && filters.category.trim() && { category: filters.category.trim() }),
        }),
        [page, limit, filters]
    );

    // Filter functions
    const updateFilter = <K extends keyof QuestionBankFilters>(
        key: K,
        value: any // Simplify to any to bypass strict type check on calling side
    ) => {
        setFilters((prev: QuestionBankFilters) => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page when filter changes
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            questionType: '',
            jlptLevel: '',
            difficulty: '',
            status: '',
            category: '',
        });
        setPage(1);
    };

    const hasActiveFilters = useMemo(
        () =>
            Boolean(
                filters.search ||
                filters.questionType ||
                filters.jlptLevel ||
                filters.difficulty ||
                filters.status ||
                filters.category
            ),
        [filters]
    );

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionBankDto | null>(null);
    const [viewingQuestion, setViewingQuestion] = useState<QuestionBankDto | null>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<QuestionBankDto | null>(null);

    // Queries
    const { data, error } = useQuestionBanks(queryParams);

    const questions = (data?.data || []) as QuestionBankDto[];
    const meta = data?.meta;

    const handleCreate = () => {
        setIsCreateDialogOpen(true);
    };

    const handleEdit = (question: QuestionBankDto) => {
        setEditingQuestion(question);
    };

    const handleView = (question: QuestionBankDto) => {
        setViewingQuestion(question);
    };

    const handleDelete = (question: QuestionBankDto) => {
        setDeletingQuestion(question);
    };

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                    <p className="font-semibold">Error loading questions</p>
                    <p className="text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <QuestionBankPrimaryToolbar
                filters={filters}
                onFilterChange={updateFilter}
                onReset={resetFilters}
                hasActiveFilters={hasActiveFilters}
                onAddNew={handleCreate}
            />

            <div className="mt-6">
                <QuestionBankTable
                    data={questions}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    page={page}
                    limit={queryParams.limit || 10}
                />
            </div>

            {/* Pagination */}
            {meta && (
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        Total: {meta.total} questions | Page {meta.page} of {meta.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || !meta.hasPrev}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page === meta.totalPages || !meta.hasNext}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <CreateQuestionBankDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />

            <EditQuestionBankDialog
                open={!!editingQuestion}
                onOpenChange={(open) => !open && setEditingQuestion(null)}
                question={editingQuestion}
            />

            <ViewQuestionBankDialog
                open={!!viewingQuestion}
                onOpenChange={(open) => !open && setViewingQuestion(null)}
                question={viewingQuestion}
            />

            <DeleteQuestionBankDialog
                open={!!deletingQuestion}
                onOpenChange={(open) => !open && setDeletingQuestion(null)}
                question={deletingQuestion}
            />
        </div>
    );
}
