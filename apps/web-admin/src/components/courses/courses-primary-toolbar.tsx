import { Input } from '@workspace/ui/components/input';
import { Search } from 'lucide-react';
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
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input - Flexible width */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 peer-focus:text-foreground transition-colors" />
                    <Input
                        placeholder="Search courses by title..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 w-full bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80"
                    />
                </div>

                {/* Filters - Responsive layout */}
                <div className="flex flex-row gap-3">
                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(value) =>
                            onStatusFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="flex-1 sm:w-[150px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={jlptLevelFilter || 'all'}
                        onValueChange={(value) =>
                            onJlptLevelFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="flex-1 sm:w-[150px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                            <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="N5">N5</SelectItem>
                            <SelectItem value="N4">N4</SelectItem>
                            <SelectItem value="N3">N3</SelectItem>
                            <SelectItem value="N2">N2</SelectItem>
                            <SelectItem value="N1">N1</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
