import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Search, ArrowUpDown } from 'lucide-react';
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
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 border-none bg-muted/40 hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Role Filter */}
                <Select
                    value={filters.role || 'all'}
                    onValueChange={(value) => onFilterChange({ ...filters, role: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="w-full md:w-[180px] border-none bg-muted/40 hover:bg-muted/60 rounded-xl transition-all focus:ring-1 focus:ring-primary/20">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent className="border-none shadow-xl bg-background/90 backdrop-blur-xl rounded-xl">
                        <SelectItem value="all" className="rounded-lg cursor-pointer">All Roles</SelectItem>
                        <SelectItem value="admin" className="rounded-lg cursor-pointer">Admin</SelectItem>
                        <SelectItem value="learner" className="rounded-lg cursor-pointer">Learner</SelectItem>
                        <SelectItem value="lecturer" className="rounded-lg cursor-pointer">Lecturer</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="bg-muted/40 hover:bg-muted/60 border-none rounded-xl gap-2 font-normal">
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                            Sort
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 border-none shadow-xl bg-background/90 backdrop-blur-xl rounded-xl p-1">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onSortChange('createdAt', 'desc')} className="rounded-lg cursor-pointer">
                                Newest first
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('createdAt', 'asc')} className="rounded-lg cursor-pointer">
                                Oldest first
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('displayName', 'asc')} className="rounded-lg cursor-pointer">
                                Name (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('email', 'asc')} className="rounded-lg cursor-pointer">
                                Email (A-Z)
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
