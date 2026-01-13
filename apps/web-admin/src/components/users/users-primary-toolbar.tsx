import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
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
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between w-full">
            {/* Zen Search Input */}
            <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-500" />
                <Input
                    placeholder="ENTER IDENTITY SIGNATURE OR EMAIL..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-border/40 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all text-[11px] font-black uppercase tracking-[0.15em] placeholder:text-muted-foreground/20"
                />
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <Select
                    value={filters.role || 'all'}
                    onValueChange={(value) => onFilterChange({ ...filters, role: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="h-12 w-full md:w-[200px] rounded-xl border-border/40 bg-background/50 hover:bg-background/80 transition-all text-[10px] font-black uppercase tracking-widest focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Filter className="size-3.5 opacity-30" />
                            <SelectValue placeholder="ENTITY CLASSIFICATION" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/40 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[1.5rem] p-2">
                        <SelectItem value="all" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL ENTITIES</SelectItem>
                        <SelectItem value="admin" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">ADMIN</SelectItem>
                        <SelectItem value="learner" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">LEARNER</SelectItem>
                        <SelectItem value="lecturer" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">LECTURER</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Controls */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 w-full md:w-auto rounded-xl border border-border/40 bg-background/50 hover:bg-background/80 px-4 gap-3 text-[10px] font-black uppercase tracking-widest transition-all group">
                            <SlidersHorizontal className="h-4 w-4 opacity-30 group-hover:text-primary transition-colors" />
                            <span className="hidden sm:inline">Sequence Protocol</span>
                            <span className="sm:hidden">Sort</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 border-border/40 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[1.5rem] p-2">
                        <DropdownMenuGroup className="space-y-1">
                            <DropdownMenuItem onClick={() => onSortChange('createdAt', 'desc')} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex justify-between">
                                LEAST HISTORICAL FIRST <Sparkles className="size-3 opacity-20" />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('createdAt', 'asc')} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                HISTORICAL ARCHIVE FIRST
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('displayName', 'asc')} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                IDENTITY ALPHABET (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('email', 'asc')} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                CORE SIGNATURE (EMAIL)
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
