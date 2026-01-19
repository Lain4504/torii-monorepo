import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

interface UsersPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    filters: { role?: string };
    onFilterChange: (filters: { role?: string }) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (field: string, order: 'asc' | 'desc') => void;
}

export function UsersPrimaryToolbar({
    search,
    onSearchChange,
    filters,
    onFilterChange,
    onSortChange,
}: UsersPrimaryToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between w-full">
            {/* Search Input */}
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 pl-9 rounded-lg border-border bg-background focus-visible:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground/50"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Select
                    value={filters.role || 'all'}
                    onValueChange={(value) => onFilterChange({ ...filters, role: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="h-10 w-full sm:w-[180px] rounded-lg border-border bg-background hover:bg-muted/50 transition-all text-sm">
                        <div className="flex items-center gap-2">
                            <Filter className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Vai trò" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border rounded-lg shadow-lg bg-background">
                        <SelectItem value="all" className="text-sm">Tất cả vai trò</SelectItem>
                        <SelectItem value="admin" className="text-sm">Quản trị viên</SelectItem>
                        <SelectItem value="learner" className="text-sm">Học viên</SelectItem>
                        <SelectItem value="lecturer" className="text-sm">Giảng viên</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Controls */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 w-full sm:w-auto rounded-lg border-border bg-background hover:bg-muted/50 px-4 gap-2 text-sm font-medium transition-all">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Sắp xếp</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 border-border rounded-xl shadow-xl bg-background p-1">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onSortChange('createdAt', 'desc')} className="rounded-lg px-3 py-2 text-sm cursor-pointer flex justify-between">
                                Mới nhất <Sparkles className="size-3 text-amber-500" />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('createdAt', 'asc')} className="rounded-lg px-3 py-2 text-sm cursor-pointer">
                                Cũ nhất
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('displayName', 'asc')} className="rounded-lg px-3 py-2 text-sm cursor-pointer">
                                Tên (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('email', 'asc')} className="rounded-lg px-3 py-2 text-sm cursor-pointer">
                                Email (A-Z)
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
