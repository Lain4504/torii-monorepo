import { Input } from '@workspace/ui/components/input';
import { Search, Layers, ArrowUpDown } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';

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
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between w-full">
            {/* Zen Search Input */}
            <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-500" />
                <Input
                    placeholder="ENTER POST TITLE OR ARTICLE IDENTIFIER..."
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
                    <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2">
                        <SelectItem value="all" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL ARTICLES</SelectItem>
                        <SelectItem value="draft" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">DRAFT</SelectItem>
                        <SelectItem value="published" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">PUBLISHED</SelectItem>
                        <SelectItem value="archived" className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">ARCHIVED</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-12 w-full md:w-[180px] justify-start rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-[10px] font-black uppercase tracking-widest focus:ring-primary/20">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="size-3.5 opacity-30" />
                                <span className="hidden sm:inline">SORT BY</span>
                                <span className="sm:hidden">SORT</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2">
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onSortChange('publishedAt', 'desc')} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                NEWEST FIRST
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('publishedAt', 'asc')} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                OLDEST FIRST
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('title', 'asc')} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                TITLE (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange('viewCount', 'desc')} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                MOST VIEWS
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}


