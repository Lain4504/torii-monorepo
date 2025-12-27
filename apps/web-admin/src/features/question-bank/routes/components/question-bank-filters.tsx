import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Button } from '@workspace/ui/components/button';
import { Search, X } from 'lucide-react';
import type {
    QuestionType,
    QuestionJlptLevel,
} from '@workspace/dtos';
import type { QuestionBankFilters as Filters } from '@/features/question-bank/types/question-bank';

interface QuestionBankFiltersProps {
    filters: Filters;
    onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
}

export function QuestionBankFilters({
    filters,
    onFilterChange,
    onReset,
    hasActiveFilters,
}: QuestionBankFiltersProps) {
    return (
        <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search questions..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="jlpt-level">JLPT Level</Label>
                    <Select
                        value={filters.jlptLevel || undefined}
                        onValueChange={(value) => onFilterChange('jlptLevel', (value || '') as QuestionJlptLevel | '')}
                    >
                        <SelectTrigger id="jlpt-level">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="N5">N5</SelectItem>
                            <SelectItem value="N4">N4</SelectItem>
                            <SelectItem value="N3">N3</SelectItem>
                            <SelectItem value="N2">N2</SelectItem>
                            <SelectItem value="N1">N1</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Select
                        value={filters.category || undefined}
                        onValueChange={(value) => onFilterChange('category', value || '')}
                    >
                        <SelectTrigger id="topic">
                            <SelectValue placeholder="All Topics" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Add more topics as needed */}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="question-type">Question Type</Label>
                    <Select
                        value={filters.questionType || undefined}
                        onValueChange={(value) => onFilterChange('questionType', (value || '') as QuestionType | '')}
                    >
                        <SelectTrigger id="question-type">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="fill_blank">Fill Blank</SelectItem>
                            <SelectItem value="matching">Matching</SelectItem>
                            <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="w-fit"
                >
                    <X className="h-4 w-4 mr-2" />
                    Reset Filters
                </Button>
            )}
        </div>
    );
}


