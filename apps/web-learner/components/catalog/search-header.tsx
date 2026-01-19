'use client'

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

interface SearchHeaderProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    sortBy: string
    onSortChange: (sort: string) => void
}

export function SearchHeader({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange
}: SearchHeaderProps) {
    return (
        <div className="space-y-10 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                    <Search className="w-3 h-3" />
                    <span>Danh mục khóa học</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter text-foreground uppercase italic leading-[0.8]">
                    Khám phá <br /> <span className="text-primary not-italic">Khóa học</span>
                </h1>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic border-l-2 border-primary/20 pl-8 py-2">
                    Lộ trình học tập tối ưu được thiết kế để chinh phục JLPT tuyệt đối.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Tìm kiếm bài học, tên khóa học..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-14 h-14 bg-muted/20 border-border/40 hover:bg-muted/30 focus:bg-background rounded-2xl transition-all text-sm font-bold placeholder:text-muted-foreground/40 shadow-none ring-0 focus-visible:ring-0"
                    />
                </div>
                <div className="w-full md:w-[240px]">
                    <Select value={sortBy} onValueChange={onSortChange}>
                        <SelectTrigger className="h-14 bg-muted/20 border-border/40 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest focus:ring-0 transition-all hover:bg-muted/30">
                            <div className="flex items-center gap-3">
                                <SlidersHorizontal className="w-3.5 h-3.5 opacity-40" />
                                <SelectValue placeholder="Sắp xếp" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/40 p-2 shadow-2xl">
                            <SelectItem value="popular" className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer">Phổ biến nhất</SelectItem>
                            <SelectItem value="newest" className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer">Mới nhất</SelectItem>
                            <SelectItem value="price-asc" className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer">Giá thấp đến cao</SelectItem>
                            <SelectItem value="price-desc" className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer">Giá cao đến thấp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/40 to-transparent pt-12" />
        </div>
    )
}
