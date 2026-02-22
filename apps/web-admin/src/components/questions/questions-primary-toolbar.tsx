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
                    className="pl-10 w-[250px]"
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
                    <SelectTrigger className="min-w-[140px]">
                        <SelectValue placeholder="Loại câu hỏi" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Trắc nghiệm</SelectItem>
                        <SelectItem value={QuestionType.TRUE_FALSE}>Đúng/Sai</SelectItem>
                        <SelectItem value={QuestionType.FILL_BLANK}>Điền vào chỗ trống</SelectItem>
                        <SelectItem value={QuestionType.MATCHING}>Ghép cặp</SelectItem>
                        <SelectItem value={QuestionType.ESSAY}>Tự luận</SelectItem>
                    </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select
                    value={categoryFilter || 'all'}
                    onValueChange={(value) =>
                        onCategoryFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="min-w-[130px]">
                        <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        <SelectItem value={QuestionCategory.VOCAB}>Từ vựng</SelectItem>
                        <SelectItem value={QuestionCategory.GRAMMAR}>Ngữ pháp</SelectItem>
                        <SelectItem value={QuestionCategory.READING}>Đọc hiểu</SelectItem>
                        <SelectItem value={QuestionCategory.LISTENING}>Nghe hiểu</SelectItem>
                    </SelectContent>
                </Select>

                {/* JLPT Level Filter */}
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="min-w-[110px]">
                        <SelectValue placeholder="Cấp độ JLPT" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả cấp độ</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N5}>N5</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N4}>N4</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N3}>N3</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N2}>N2</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N1}>N1</SelectItem>
                    </SelectContent>
                </Select>

                {/* Difficulty Filter */}
                <Select
                    value={difficultyFilter || 'all'}
                    onValueChange={(value) =>
                        onDifficultyFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="min-w-[120px]">
                        <SelectValue placeholder="Độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả độ khó</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.EASY}>Dễ</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.MEDIUM}>Trung bình</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.HARD}>Khó</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) =>
                        onStatusFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="min-w-[130px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value={QuestionStatus.ACTIVE}>Đang hoạt động</SelectItem>
                        <SelectItem value={QuestionStatus.INACTIVE}>Không hoạt động</SelectItem>
                        <SelectItem value={QuestionStatus.REVIEW}>Chờ duyệt</SelectItem>
                        <SelectItem value={QuestionStatus.ARCHIVED}>Đã lưu trữ</SelectItem>
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
                        <SelectTrigger className="min-w-[150px]">
                            <SelectValue placeholder="Nhóm câu hỏi" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <SelectItem value="all">Tất cả nhóm</SelectItem>
                            {poolsData?.data?.map((pool) => (
                                <SelectItem key={pool.id} value={pool.id}>
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
