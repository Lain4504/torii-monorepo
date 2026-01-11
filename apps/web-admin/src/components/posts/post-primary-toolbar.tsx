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
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Status Filter */}
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => onStatusFilterChange(value === 'all' ? '' : value)}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Sort By
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onSortChange('publishedAt', 'desc')}>
                                Newest First
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('publishedAt', 'asc')}>
                                Oldest First
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('title', 'asc')}>
                                Title (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('viewCount', 'desc')}>
                                Most Views
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}


