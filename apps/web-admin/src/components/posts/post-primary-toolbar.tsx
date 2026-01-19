import { Input } from '@workspace/ui/components/input';
import { Search, Layers, ArrowUpDown } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';

interface PostPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onSortChange: (field: string, order: 'asc' | 'desc') => void;
}

export function PostPrimaryToolbar({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onSortChange,
}: PostPrimaryToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between w-full">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Tìm kiếm theo tiêu đề..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 pl-9 rounded-xl bg-background border-border/50 hover:bg-accent/5 focus-visible:ring-primary/20 transition-all text-sm"
                />
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Status Filter */}
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) =>
                        onStatusFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-10 w-full md:w-[150px] rounded-xl border-border/50 bg-background hover:bg-accent/5 transition-all text-sm font-medium focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Layers className="size-4 opacity-50" />
                            <SelectValue placeholder="Trạng thái" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/50 shadow-lg bg-background/95 backdrop-blur-xl rounded-xl p-1">
                        <SelectItem value="all" className="rounded-lg cursor-pointer">Tất cả</SelectItem>
                        <SelectItem value="draft" className="rounded-lg cursor-pointer">Bản nháp</SelectItem>
                        <SelectItem value="published" className="rounded-lg cursor-pointer">Đã xuất bản</SelectItem>
                        <SelectItem value="archived" className="rounded-lg cursor-pointer">Đã lưu trữ</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 w-full md:w-[150px] justify-start rounded-xl border-border/50 bg-background hover:bg-accent/5 transition-all text-sm font-medium focus:ring-primary/20">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="size-4 opacity-50" />
                                <span className="hidden sm:inline">Sắp xếp</span>
                                <span className="sm:hidden">Sắp xếp</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 border-border/50 shadow-lg bg-background/95 backdrop-blur-xl rounded-xl p-1">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onSortChange('publishedAt', 'desc')} className="rounded-lg cursor-pointer">
                                Mới nhất
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('publishedAt', 'asc')} className="rounded-lg cursor-pointer">
                                Cũ nhất
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('title', 'asc')} className="rounded-lg cursor-pointer">
                                Tiêu đề (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('viewCount', 'desc')} className="rounded-lg cursor-pointer">
                                Lượt xem nhiều nhất
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}


