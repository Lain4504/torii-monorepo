import { Input } from '@workspace/ui/components/input';
import { Search, Layers, GraduationCap } from 'lucide-react';
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
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm khóa học theo tên hoặc mã..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
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
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <div className="flex items-center gap-2">
                            <Layers className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Trạng thái" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="draft">Bản nháp</SelectItem>
                        <SelectItem value="pending_review">Chờ duyệt</SelectItem>
                        <SelectItem value="published">Đã xuất bản</SelectItem>
                        <SelectItem value="archived">Đã lưu trữ</SelectItem>
                    </SelectContent>
                </Select>

                {/* JLPT Level Filter */}
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Trình độ JLPT" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trình độ</SelectItem>
                        <SelectItem value="N5">N5 - Sơ cấp 1</SelectItem>
                        <SelectItem value="N4">N4 - Sơ cấp 2</SelectItem>
                        <SelectItem value="N3">N3 - Trung cấp</SelectItem>
                        <SelectItem value="N2">N2 - Cao cấp</SelectItem>
                        <SelectItem value="N1">N1 - Thượng thừa</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
