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
        <div className="flex flex-col gap-4 w-full">
            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Tìm kiếm bộ đề, kho lưu trữ..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-11 pl-10 rounded-xl border-border bg-background focus-visible:ring-primary/20 transition-all text-sm shadow-sm"
                />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
                    <Target className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lọc theo trình độ:</span>
                </div>

                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 w-[200px] rounded-xl border-border bg-background hover:border-primary/50 transition-all text-sm shadow-sm">
                        <SelectValue placeholder="Chọn cấp độ JLPT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl p-1 shadow-xl border-border">
                        <SelectItem value="all" className="rounded-lg text-sm cursor-pointer italic font-medium">Tất cả cấp độ</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N1} className="rounded-lg text-sm cursor-pointer font-medium">N1 - Thượng thừa</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N2} className="rounded-lg text-sm cursor-pointer font-medium">N2 - Cao cấp</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N3} className="rounded-lg text-sm cursor-pointer font-medium">N3 - Trung cấp</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N4} className="rounded-lg text-sm cursor-pointer font-medium">N4 - Sơ cấp 2</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N5} className="rounded-lg text-sm cursor-pointer font-medium">N5 - Sơ cấp 1</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
