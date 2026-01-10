import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Can } from "@/lib/guard/can";

interface BlogPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onSortChange: (field: string, order: 'asc' | 'desc') => void;
    onAddNew: () => void;
}

export function BlogPrimaryToolbar({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onSortChange,
    onAddNew,
}: BlogPrimaryToolbarProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage blog posts and content
                    </p>
                </div>
                <Can permission="blog.write">
                    <Button onClick={onAddNew}>
                        <Plus className="mr-2 h-4 w-4" /> New Post
                    </Button>
                </Can>
            </div>

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


