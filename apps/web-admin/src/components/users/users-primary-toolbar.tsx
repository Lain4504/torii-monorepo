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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 dark:text-muted-foreground/80" />
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 border border-border/50 bg-muted/50 dark:bg-muted/70 hover:bg-muted/70 dark:hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/30 dark:focus-visible:ring-primary/40 rounded-xl transition-all text-sm sm:text-base"
                />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Role Filter */}
                <Select
                    value={filters.role || 'all'}
                    onValueChange={(value) => onFilterChange({ ...filters, role: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px] border border-border/50 bg-muted/50 dark:bg-muted/70 hover:bg-muted/70 dark:hover:bg-muted/80 rounded-xl transition-all focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40 text-sm sm:text-base">
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
                        <Button variant="ghost" className="bg-muted/50 dark:bg-muted/70 hover:bg-muted/70 dark:hover:bg-muted/80 border border-border/50 rounded-xl gap-2 font-normal text-sm sm:text-base px-3 sm:px-4">
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                            <span className="hidden sm:inline">Sort</span>
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

