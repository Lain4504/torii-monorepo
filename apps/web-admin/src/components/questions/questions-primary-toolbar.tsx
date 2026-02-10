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
        <div className="flex flex-col gap-4 w-full">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm câu hỏi..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-11 pl-10 rounded-xl border-border bg-background"
                />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Question Type Filter */}
                <Select
                    value={questionTypeFilter || 'all'}
                    onValueChange={(value) =>
                        onQuestionTypeFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 min-w-[140px] rounded-xl border-border bg-background">
                        <SelectValue placeholder="Loại câu hỏi" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="cursor-pointer">Tất cả loại</SelectItem>
                        <SelectItem value={QuestionType.MULTIPLE_CHOICE} className="cursor-pointer">Trắc nghiệm</SelectItem>
                        <SelectItem value={QuestionType.TRUE_FALSE} className="cursor-pointer">Đúng/Sai</SelectItem>
                        <SelectItem value={QuestionType.FILL_BLANK} className="cursor-pointer">Điền vào chỗ trống</SelectItem>
                        <SelectItem value={QuestionType.MATCHING} className="cursor-pointer">Ghép cặp</SelectItem>
                        <SelectItem value={QuestionType.ESSAY} className="cursor-pointer">Tự luận</SelectItem>
                    </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select
                    value={categoryFilter || 'all'}
                    onValueChange={(value) =>
                        onCategoryFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 min-w-[130px] rounded-xl border-border bg-background">
                        <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="cursor-pointer">Tất cả danh mục</SelectItem>
                        <SelectItem value={QuestionCategory.VOCAB} className="cursor-pointer">Từ vựng</SelectItem>
                        <SelectItem value={QuestionCategory.GRAMMAR} className="cursor-pointer">Ngữ pháp</SelectItem>
                        <SelectItem value={QuestionCategory.READING} className="cursor-pointer">Đọc hiểu</SelectItem>
                        <SelectItem value={QuestionCategory.LISTENING} className="cursor-pointer">Nghe hiểu</SelectItem>
                    </SelectContent>
                </Select>

                {/* JLPT Level Filter */}
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 min-w-[110px] rounded-xl border-border bg-background">
                        <SelectValue placeholder="Cấp độ JLPT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="cursor-pointer">Tất cả cấp độ</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N5} className="cursor-pointer">N5</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N4} className="cursor-pointer">N4</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N3} className="cursor-pointer">N3</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N2} className="cursor-pointer">N2</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N1} className="cursor-pointer">N1</SelectItem>
                    </SelectContent>
                </Select>

                {/* Difficulty Filter */}
                <Select
                    value={difficultyFilter || 'all'}
                    onValueChange={(value) =>
                        onDifficultyFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 min-w-[120px] rounded-xl border-border bg-background">
                        <SelectValue placeholder="Độ khó" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="cursor-pointer">Tất cả độ khó</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.EASY} className="cursor-pointer">Dễ</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.MEDIUM} className="cursor-pointer">Trung bình</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.HARD} className="cursor-pointer">Khó</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) =>
                        onStatusFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 min-w-[130px] rounded-xl border-border bg-background">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="cursor-pointer">Tất cả trạng thái</SelectItem>
                        <SelectItem value={QuestionStatus.ACTIVE} className="cursor-pointer">Đang hoạt động</SelectItem>
                        <SelectItem value={QuestionStatus.INACTIVE} className="cursor-pointer">Không hoạt động</SelectItem>
                        <SelectItem value={QuestionStatus.REVIEW} className="cursor-pointer">Chờ duyệt</SelectItem>
                        <SelectItem value={QuestionStatus.ARCHIVED} className="cursor-pointer">Đã lưu trữ</SelectItem>
                    </SelectContent>
                </Select>

                {/* Pool Filter */}
                {onPoolIdFilterChange && (
                    <Select
                        value={poolIdFilter || 'all'}
                        onValueChange={(value) =>
                            onPoolIdFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="h-10 min-w-[150px] rounded-xl border-border bg-background">
                            <SelectValue placeholder="Nhóm câu hỏi" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl max-h-[300px]">
                            <SelectItem value="all" className="cursor-pointer">Tất cả nhóm</SelectItem>
                            {poolsData?.data?.map((pool) => (
                                <SelectItem key={pool.id} value={pool.id} className="cursor-pointer">
                                    {pool.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}
