import { useState, useMemo } from 'react';
import {
    type QuestionBankQueryDTO,
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
    type QuestionBankResponseDTO,
} from '@workspace/schemas';
import { QuestionBankPrimaryToolbar } from '@/components/question-banks/question-bank-primary-toolbar.tsx';
import { QuestionBankTable } from '@/components/question-banks/question-bank-table.tsx';
import { CreateQuestionBankDialog } from '@/components/question-banks/create-question-bank-dialog.tsx';
import { EditQuestionBankDialog } from '@/components/question-banks/edit-question-bank-dialog.tsx';
import { ViewQuestionBankDialog } from '@/components/question-banks/view-question-bank-dialog.tsx';
import { DeleteQuestionBankDialog } from '@/components/question-banks/delete-question-bank-dialog.tsx';
import { Button } from '@workspace/ui/components/button';
import { type QuestionBankFilters, useQuestionBanks } from "@/api/services/question-bank.ts";

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
    const queryParams: QuestionBankQueryDTO = useMemo(
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
    const [editingQuestion, setEditingQuestion] = useState<QuestionBankResponseDTO | null>(null);
    const [viewingQuestion, setViewingQuestion] = useState<QuestionBankResponseDTO | null>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<QuestionBankResponseDTO | null>(null);

    // Queries
    const { data, error } = useQuestionBanks(queryParams);

    const questions = (data?.data || []) as QuestionBankResponseDTO[];
    const meta = data ? {
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
    } : null;

    const handleCreate = () => {
        setIsCreateDialogOpen(true);
    };

    const handleEdit = (question: QuestionBankResponseDTO) => {
        setEditingQuestion(question);
    };

    const handleView = (question: QuestionBankResponseDTO) => {
        setViewingQuestion(question);
    };

    const handleDelete = (question: QuestionBankResponseDTO) => {
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
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
                    <p className="text-muted-foreground">Manage repository of questions for exams and practice.</p>
                </div>
                <Button onClick={handleCreate}>
                    Add New Question
                </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <QuestionBankPrimaryToolbar
                        filters={filters}
                        onFilterChange={updateFilter}
                        onReset={resetFilters}
                        hasActiveFilters={hasActiveFilters}
                        onAddNew={handleCreate}
                    />

                    <div className="mt-6 rounded-md border">
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
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="flex-1 text-sm text-muted-foreground">
                                Total: {meta.total} questions | Page {meta.page} of {meta.totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page >= (meta.totalPages || 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
