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
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-500" />
                <Input
                    placeholder="ENTER COURSE TITLE OR ARCHIVE IDENTIFIER..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all text-[11px] font-black uppercase tracking-[0.15em] placeholder:text-muted-foreground/20"
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
                    <SelectTrigger className="h-12 w-full md:w-[180px] rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-[10px] font-black uppercase tracking-widest focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Layers className="size-3.5 opacity-30" />
                            <SelectValue placeholder="STATUS" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[1.5rem] p-2">
                        <SelectItem value="all" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL REPOSITORIES</SelectItem>
                        <SelectItem value="draft" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">DRAFT</SelectItem>
                        <SelectItem value="published" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">PUBLISHED</SelectItem>
                        <SelectItem value="archived" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">ARCHIVED</SelectItem>
                    </SelectContent>
                </Select>

                {/* JLPT Level Filter */}
                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-12 w-full md:w-[180px] rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-[10px] font-black uppercase tracking-widest focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Layout className="size-3.5 opacity-30" />
                            <SelectValue placeholder="LEVEL" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[1.5rem] p-2">
                        <SelectItem value="all" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL LEVELS</SelectItem>
                        <SelectItem value="N5" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N5 FOUNDATION</SelectItem>
                        <SelectItem value="N4" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N4 ELEMENTARY</SelectItem>
                        <SelectItem value="N3" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N3 INTERMEDIATE</SelectItem>
                        <SelectItem value="N2" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N2 ADVANCED</SelectItem>
                        <SelectItem value="N1" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N1 MASTERY</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
