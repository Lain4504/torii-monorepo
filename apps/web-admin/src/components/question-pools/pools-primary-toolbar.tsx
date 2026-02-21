import { Input } from '@workspace/ui/components/input';
import { Search, Target } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { QuestionJlptLevel } from '@workspace/schemas';

interface PoolsPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    jlptLevelFilter: string;
    onJlptLevelFilterChange: (value: string) => void;
}

export function PoolsPrimaryToolbar({
    search,
    onSearchChange,
    jlptLevelFilter,
    onJlptLevelFilterChange,
}: PoolsPrimaryToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between w-full">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm bộ đề..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <div className="flex items-center gap-2">
                            <Target className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Chuyên mục" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả cấp độ</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N1}>N1 - Thượng thừa</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N2}>N2 - Cao cấp</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N3}>N3 - Trung cấp</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N4}>N4 - Sơ cấp 2</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N5}>N5 - Sơ cấp 1</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
