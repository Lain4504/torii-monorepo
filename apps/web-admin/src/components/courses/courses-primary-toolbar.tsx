import { Input } from '@workspace/ui/components/input';
import { Search, Layers, Layout } from 'lucide-react';
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
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between w-full">
            {/* Zen Search Input */}
            <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors duration-500" />
                <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all text-sm font-medium placeholder:text-muted-foreground/40"
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
                    <SelectTrigger className="h-12 w-full md:w-[180px] rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-sm font-medium focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Layers className="size-4 opacity-50" />
                            <SelectValue placeholder="Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/20 shadow-xl bg-background/90 backdrop-blur-3xl rounded-[1.2rem] p-1.5">
                        <SelectItem value="all" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">All Courses</SelectItem>
                        <SelectItem value="draft" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">Draft</SelectItem>
                        <SelectItem value="published" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">Published</SelectItem>
                        <SelectItem value="archived" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">Archived</SelectItem>
                    </SelectContent>
                </Select>

                {/* JLPT Level Filter */}
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-12 w-full md:w-[180px] rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-sm font-medium focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Layout className="size-4 opacity-50" />
                            <SelectValue placeholder="Level" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/20 shadow-xl bg-background/90 backdrop-blur-3xl rounded-[1.2rem] p-1.5">
                        <SelectItem value="all" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">All Levels</SelectItem>
                        <SelectItem value="N5" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">N5 Foundation</SelectItem>
                        <SelectItem value="N4" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">N4 Elementary</SelectItem>
                        <SelectItem value="N3" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">N3 Intermediate</SelectItem>
                        <SelectItem value="N2" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">N2 Advanced</SelectItem>
                        <SelectItem value="N1" className="rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer">N1 Mastery</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
