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
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Tìm kiếm bộ câu hỏi..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 pl-9 rounded-lg border-border bg-background focus-visible:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground/50"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* JLPT Level Filter */}
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 w-full sm:w-[200px] rounded-lg border-border bg-background hover:bg-muted/50 transition-all text-sm">
                        <div className="flex items-center gap-2">
                            <Target className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Trình độ JLPT" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border rounded-lg shadow-lg bg-background">
                        <SelectItem value="all" className="text-sm cursor-pointer italic">Tất cả cấp độ</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N5} className="text-sm cursor-pointer">N5 - Sơ cấp 1</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N4} className="text-sm cursor-pointer">N4 - Sơ cấp 2</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N3} className="text-sm cursor-pointer">N3 - Trung cấp</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N2} className="text-sm cursor-pointer">N2 - Cao cấp</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N1} className="text-sm cursor-pointer">N1 - Thượng thừa</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
