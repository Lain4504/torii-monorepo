import { Input } from '@workspace/ui/components/input';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { QuestionType, QuestionStatus, QuestionCategory, QuestionDifficultyLevel, QuestionJlptLevel } from '@workspace/schemas';
import { useQuestionPools } from '@/api/services/question-pools.ts';

interface QuestionsPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    questionTypeFilter: string;
    onQuestionTypeFilterChange: (value: string) => void;
    categoryFilter: string;
    onCategoryFilterChange: (value: string) => void;
    jlptLevelFilter: string;
    onJlptLevelFilterChange: (value: string) => void;
    difficultyFilter: string;
    onDifficultyFilterChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    poolIdFilter?: string;
    onPoolIdFilterChange?: (value: string) => void;
}

export function QuestionsPrimaryToolbar({
    search,
    onSearchChange,
    questionTypeFilter,
    onQuestionTypeFilterChange,
    categoryFilter,
    onCategoryFilterChange,
    jlptLevelFilter,
    onJlptLevelFilterChange,
    difficultyFilter,
    onDifficultyFilterChange,
    statusFilter,
    onStatusFilterChange,
    poolIdFilter,
    onPoolIdFilterChange,
}: QuestionsPrimaryToolbarProps) {
    const { data: poolsData } = useQuestionPools({ page: 1, limit: 100 });
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 peer-focus:text-foreground transition-colors" />
                    <Input
                        placeholder="Search questions..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 w-full bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-row gap-3 flex-wrap">
                    <Select
                        value={questionTypeFilter || 'all'}
                        onValueChange={(value) =>
                            onQuestionTypeFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="flex-1 sm:w-[140px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                            <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                            <SelectItem value={QuestionType.FILL_BLANK}>Fill Blank</SelectItem>
                            <SelectItem value={QuestionType.MATCHING}>Matching</SelectItem>
                            <SelectItem value={QuestionType.ESSAY}>Essay</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={categoryFilter || 'all'}
                        onValueChange={(value) =>
                            onCategoryFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="flex-1 sm:w-[140px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value={QuestionCategory.VOCAB}>Vocab</SelectItem>
                            <SelectItem value={QuestionCategory.GRAMMAR}>Grammar</SelectItem>
                            <SelectItem value={QuestionCategory.READING}>Reading</SelectItem>
                            <SelectItem value={QuestionCategory.LISTENING}>Listening</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={jlptLevelFilter || 'all'}
                        onValueChange={(value) =>
                            onJlptLevelFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="flex-1 sm:w-[120px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                            <SelectValue placeholder="JLPT" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N5}>N5</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N4}>N4</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N3}>N3</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N2}>N2</SelectItem>
                            <SelectItem value={QuestionJlptLevel.N1}>N1</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={difficultyFilter || 'all'}
                        onValueChange={(value) =>
                            onDifficultyFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="flex-1 sm:w-[130px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            <SelectItem value={QuestionDifficultyLevel.EASY}>Easy</SelectItem>
                            <SelectItem value={QuestionDifficultyLevel.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={QuestionDifficultyLevel.HARD}>Hard</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(value) =>
                            onStatusFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="flex-1 sm:w-[130px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value={QuestionStatus.ACTIVE}>Active</SelectItem>
                            <SelectItem value={QuestionStatus.INACTIVE}>Inactive</SelectItem>
                            <SelectItem value={QuestionStatus.REVIEW}>Review</SelectItem>
                            <SelectItem value={QuestionStatus.ARCHIVED}>Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    {onPoolIdFilterChange && (
                        <Select
                            value={poolIdFilter || 'all'}
                            onValueChange={(value) =>
                                onPoolIdFilterChange(value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger className="flex-1 sm:w-[160px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                                <SelectValue placeholder="Question Pool" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Pools</SelectItem>
                                {poolsData?.data.map((pool) => (
                                    <SelectItem key={pool.id} value={pool.id}>
                                        {pool.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>
        </div>
    );
}

