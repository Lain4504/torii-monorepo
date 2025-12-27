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

interface UsersPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    filters: { role?: string; status?: string };
    onFilterChange: (filters: { role?: string; status?: string }) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (field: string, order: 'asc' | 'desc') => void;
    onAddNew: () => void;
}

export function UsersPrimaryToolbar({
    search,
    onSearchChange,
    filters,
    onFilterChange,
    onSortChange,
    onAddNew,
}: UsersPrimaryToolbarProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user accounts, roles, and permissions
                    </p>
                </div>
                <Button onClick={onAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add New User
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Role Filter */}
                <Select
                    value={filters.role || 'all'}
                    onValueChange={(value) => onFilterChange({ ...filters, role: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => onFilterChange({ ...filters, status: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                            <DropdownMenuItem onClick={() => onSortChange('createdAt', 'desc')}>
                                Newest First
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('createdAt', 'asc')}>
                                Oldest First
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('fullName', 'asc')}>
                                Name (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('email', 'asc')}>
                                Email (A-Z)
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
