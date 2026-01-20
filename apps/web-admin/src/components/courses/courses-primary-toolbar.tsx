import { Input } from '@workspace/ui/components/input';
import { Search, Layers, Layout } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

interface CoursesPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    jlptLevelFilter: string;
    onJlptLevelFilterChange: (value: string) => void;
}

export function CoursesPrimaryToolbar({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    jlptLevelFilter,
    onJlptLevelFilterChange,
}: CoursesPrimaryToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between w-full">
            {/* Search Input */}
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Tìm kiếm khóa học theo tên hoặc mã..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 pl-9 rounded-lg border-border bg-background focus-visible:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground/50"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Status Filter */}
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) =>
                        onStatusFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 w-full sm:w-[180px] rounded-lg border-border bg-background hover:bg-muted/50 transition-all text-sm">
                        <div className="flex items-center gap-2">
                            <Layers className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Trạng thái" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border rounded-lg shadow-lg bg-background">
                        <SelectItem value="all" className="text-sm">Tất cả trạng thái</SelectItem>
                        <SelectItem value="draft" className="text-sm">Bản nháp (Draft)</SelectItem>
                        <SelectItem value="pending_review" className="text-sm">Chờ duyệt (Review)</SelectItem>
                        <SelectItem value="published" className="text-sm">Đã xuất bản (Published)</SelectItem>
                        <SelectItem value="archived" className="text-sm">Đã lưu trữ (Archived)</SelectItem>
                    </SelectContent>
                </Select>

                {/* JLPT Level Filter */}
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 w-full sm:w-[180px] rounded-lg border-border bg-background hover:bg-muted/50 transition-all text-sm">
                        <div className="flex items-center gap-2">
                            <Layout className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Trình độ JLPT" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border rounded-lg shadow-lg bg-background">
                        <SelectItem value="all" className="text-sm">Tất cả trình độ</SelectItem>
                        <SelectItem value="N5" className="text-sm">N5 - Sơ cấp 1</SelectItem>
                        <SelectItem value="N4" className="text-sm">N4 - Sơ cấp 2</SelectItem>
                        <SelectItem value="N3" className="text-sm">N3 - Trung cấp</SelectItem>
                        <SelectItem value="N2" className="text-sm">N2 - Cao cấp</SelectItem>
                        <SelectItem value="N1" className="text-sm">N1 - Thượng thừa</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
