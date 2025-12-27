import { useState, useMemo } from 'react';
import {
    useQuestionBanks,
    useCreateQuestionBank,
    useUpdateQuestionBank,
    useDeleteQuestionBank,
} from '../api/question-bank';
import type {
    QuestionBankDto,
    CreateQuestionBankDto,
    UpdateQuestionBankDto,
    QuestionBankQueryDto,
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
} from '@workspace/dtos';
import type { QuestionBankFilters } from '../types/question-bank';
import { QuestionBankHeader } from './components/QuestionBankHeader';
import { QuestionBankFilters as FiltersComponent } from './components/QuestionBankFilters';
import { QuestionBankTable } from './components/QuestionBankTable';
import { QuestionBankCreateDialog } from './components/QuestionBankCreateDialog';
import { QuestionBankEditDialog } from './components/QuestionBankEditDialog';
import { QuestionBankViewDialog } from './components/QuestionBankViewDialog';
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
        value: QuestionBankFilters[K]
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionBankDto | null>(null);
    const [viewingQuestion, setViewingQuestion] = useState<QuestionBankDto | null>(null);

    // Queries
    const { data, isLoading, error } = useQuestionBanks(queryParams);

    // Mutations
    const createQuestionBank = useCreateQuestionBank();
    const updateQuestionBank = useUpdateQuestionBank();
    const deleteQuestionBank = useDeleteQuestionBank();

    const questions = (data?.data || []) as QuestionBankDto[];
    const meta = data?.meta;

    const handleCreate = () => {
        setIsCreateDialogOpen(true);
    };

    const handleCreateSubmit = (questionData: CreateQuestionBankDto) => {
        createQuestionBank.mutate(questionData, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                setPage(1);
            },
            onError: (error: any) => {
                console.error('Failed to create question:', error);
                // Keep dialog open on error so user can fix and retry
            },
        });
    };

    const handleEdit = (id: string) => {
        const question = questions.find((q) => q.id === id);
        if (question) {
            setEditingQuestion(question);
            setIsEditDialogOpen(true);
        }
    };

    const handleEditSubmit = (id: string, questionData: UpdateQuestionBankDto) => {
        updateQuestionBank.mutate(
            { id, question: questionData },
            {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setEditingQuestion(null);
                },
                onError: (error: any) => {
                    console.error('Failed to update question:', error);
                },
            }
        );
    };

    const handleView = (id: string) => {
        const question = questions.find((q) => q.id === id);
        if (question) {
            setViewingQuestion(question);
            setIsViewDialogOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this question?')) {
            deleteQuestionBank.mutate(id);
        }
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
            <QuestionBankHeader onAddNew={handleCreate} />

            <FiltersComponent
                filters={filters}
                onFilterChange={updateFilter}
                onReset={resetFilters}
                hasActiveFilters={hasActiveFilters}
            />

            <QuestionBankTable
                questions={questions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                isUpdating={updateQuestionBank.isPending}
                isDeleting={deleteQuestionBank.isPending}
            />

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
            <QuestionBankCreateDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreateSubmit}
                isSubmitting={createQuestionBank.isPending}
            />

            <QuestionBankEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                question={editingQuestion}
                onSubmit={handleEditSubmit}
                isSubmitting={updateQuestionBank.isPending}
            />

            <QuestionBankViewDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                question={viewingQuestion}
            />
        </div>
    );
}

