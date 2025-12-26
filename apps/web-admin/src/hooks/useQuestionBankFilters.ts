import { useState, useMemo } from 'react';
import type {
    QuestionBankQueryDto,
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
} from '@workspace/dtos';
import type { QuestionBankFilters } from '../types/question-bank';

export function useQuestionBankFilters() {
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

    const updateFilter = <K extends keyof QuestionBankFilters>(
        key: K,
        value: QuestionBankFilters[K]
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
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

    return {
        page,
        limit,
        filters,
        queryParams,
        setPage,
        updateFilter,
        resetFilters,
        hasActiveFilters,
    };
}



