import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface UsersSearchBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onFilterClick: () => void;
    onSortClick: () => void;
    hasActiveFilters?: boolean;
}

export function UsersSearchBar({
    search,
    onSearchChange,
    onFilterClick,
    onSortClick,
    hasActiveFilters = false,
}: UsersSearchBarProps) {
    return (
        <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by user name, email or description..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>
            <Button
                variant="outline"
                size="default"
                onClick={onFilterClick}
                className={hasActiveFilters ? 'border-primary bg-primary/5' : ''}
            >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && (
                    <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                )}
            </Button>
            <Button variant="outline" size="default" onClick={onSortClick}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
            </Button>
        </div>
    );
}

