import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Plus, Search, X } from 'lucide-react';
import type { QuestionType, QuestionJlptLevel } from '@workspace/dtos';
import type { QuestionBankFilters } from '@/features/question-bank/api/question-bank';

interface QuestionBankPrimaryToolbarProps {
    filters: QuestionBankFilters;
    onFilterChange: <K extends keyof QuestionBankFilters>(key: K, value: QuestionBankFilters[K]) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
    onAddNew: () => void;
}

export function QuestionBankPrimaryToolbar({
    filters,
    onFilterChange,
    onReset,
    hasActiveFilters,
    onAddNew,
}: QuestionBankPrimaryToolbarProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Question Bank Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage questions for quizzes and assessments
                    </p>
                </div>
                <Button onClick={onAddNew} size="default">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Question
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search questions..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select
                    value={filters.jlptLevel || 'all'}
                    onValueChange={(value) => onFilterChange('jlptLevel', (value === 'all' ? '' : value) as QuestionJlptLevel | '')}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="N5">N5</SelectItem>
                        <SelectItem value="N4">N4</SelectItem>
                        <SelectItem value="N3">N3</SelectItem>
                        <SelectItem value="N2">N2</SelectItem>
                        <SelectItem value="N1">N1</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) => onFilterChange('category', value === 'all' ? '' : value)}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Topics</SelectItem>
                        {/* Dynamic topics can be injected here or handled via props if needed */}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.questionType || 'all'}
                    onValueChange={(value) => onFilterChange('questionType', (value === 'all' ? '' : value) as QuestionType | '')}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="fill_blank">Fill Blank</SelectItem>
                        <SelectItem value="matching">Matching</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onReset}
                        title="Reset Filters"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
