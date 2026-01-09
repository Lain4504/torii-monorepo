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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 dark:text-muted-foreground/80" />
                <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 border border-border/50 bg-muted/50 dark:bg-muted/70 hover:bg-muted/70 dark:hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/30 dark:focus-visible:ring-primary/40 rounded-xl transition-all text-sm sm:text-base"
                />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Status Filter */}
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) =>
                        onStatusFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px] border border-border/50 bg-muted/50 dark:bg-muted/70 hover:bg-muted/70 dark:hover:bg-muted/80 rounded-xl transition-all focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40 text-sm sm:text-base">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="border-none shadow-xl bg-background/90 backdrop-blur-xl rounded-xl">
                        <SelectItem value="all" className="rounded-lg cursor-pointer">All Status</SelectItem>
                        <SelectItem value="draft" className="rounded-lg cursor-pointer">Draft</SelectItem>
                        <SelectItem value="published" className="rounded-lg cursor-pointer">Published</SelectItem>
                        <SelectItem value="archived" className="rounded-lg cursor-pointer">Archived</SelectItem>
                    </SelectContent>
                </Select>

                {/* JLPT Level Filter */}
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px] border border-border/50 bg-muted/50 dark:bg-muted/70 hover:bg-muted/70 dark:hover:bg-muted/80 rounded-xl transition-all focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40 text-sm sm:text-base">
                        <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent className="border-none shadow-xl bg-background/90 backdrop-blur-xl rounded-xl">
                        <SelectItem value="all" className="rounded-lg cursor-pointer">All Levels</SelectItem>
                        <SelectItem value="N5" className="rounded-lg cursor-pointer">N5</SelectItem>
                        <SelectItem value="N4" className="rounded-lg cursor-pointer">N4</SelectItem>
                        <SelectItem value="N3" className="rounded-lg cursor-pointer">N3</SelectItem>
                        <SelectItem value="N2" className="rounded-lg cursor-pointer">N2</SelectItem>
                        <SelectItem value="N1" className="rounded-lg cursor-pointer">N1</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
