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
        <div className="space-y-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
                    <Search className="w-3.5 h-3.5" />
                    <span>Danh mục khóa học</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-sans font-extrabold tracking-tight text-foreground leading-tight">
                    Khám Phá <span className="text-primary">Khóa Học</span>
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                    Lộ trình học tập tối ưu được thiết kế để bạn chinh phục kỳ thi JLPT và thành thạo tiếng Nhật.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Tìm kiếm bài học, tên khóa học..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-12 h-12 bg-background border-border hover:border-primary/50 focus:border-primary focus:ring-primary/20 rounded-xl transition-all text-sm font-medium shadow-sm"
                    />
                </div>
                <div className="w-full md:w-[240px]">
                    <Select value={sortBy} onValueChange={onSortChange}>
                        <SelectTrigger className="h-12 bg-background border-border hover:border-primary/50 rounded-xl px-4 text-sm font-medium focus:ring-primary/20 transition-all shadow-sm">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                                <SelectValue placeholder="Sắp xếp" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border p-1 shadow-lg">
                            <SelectItem value="popular" className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer">Phổ biến nhất</SelectItem>
                            <SelectItem value="newest" className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer">Mới nhất</SelectItem>
                            <SelectItem value="price-asc" className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer">Giá thấp đến cao</SelectItem>
                            <SelectItem value="price-desc" className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer">Giá cao đến thấp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="h-[1px] w-full bg-border/50" />
        </div>
    )
}
