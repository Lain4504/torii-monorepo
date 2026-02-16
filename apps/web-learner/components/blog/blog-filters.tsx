'use client'

import { Search, SlidersHorizontal, Tag as TagIcon, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

interface PostFiltersProps {
    onSearch: (value: string) => void
    onTagChange: (tag: string) => void
    onAuthorChange: (authorId: string) => void
    onSortChange: (sort: string) => void
}

export function PostFilters({ onSearch, onTagChange, onSortChange }: PostFiltersProps) {
    const [searchValue, setSearchValue] = useState('')

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(searchValue)
    }

    return (
        <div className="flex flex-col gap-8 mb-12">
            {/* Immersive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative group max-w-4xl">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-[24px] blur opacity-0 group-hover:opacity-100 transition duration-700" />
                <div className="relative flex items-center bg-card border border-border rounded-[24px] shadow-sm group-focus-within:shadow-xl group-focus-within:shadow-primary/5 transition-all duration-500 overflow-hidden">
                    <div className="pl-6 pr-4">
                        <Search className="w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        placeholder="Tìm kiếm kiến thức tiếng Nhật..."
                        className="flex-1 h-16 bg-transparent border-none text-xl placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 font-medium"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <div className="pr-4 pl-2">
                        <Button
                            type="submit"
                            className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Tìm kiếm
                        </Button>
                    </div>
                </div>
            </form>

            {/* Premium Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Sort */}
                    <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Sắp xếp theo</span>
                        <Select onValueChange={onSortChange}>
                            <SelectTrigger className="w-[200px] h-14 bg-card rounded-2xl border-border shadow-sm hover:shadow-md transition-all font-bold">
                                <SlidersHorizontal className="w-4 h-4 mr-3 text-primary" />
                                <SelectValue placeholder="Mới nhất" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border shadow-2xl p-2">
                                <SelectItem value="newest" className="rounded-xl font-bold py-3">Mới nhất</SelectItem>
                                <SelectItem value="popular" className="rounded-xl font-bold py-3">Xem nhiều nhất</SelectItem>
                                <SelectItem value="likes" className="rounded-xl font-bold py-3">Yêu thích nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tag Filter */}
                    <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Chủ đề bài viết</span>
                        <Select onValueChange={onTagChange}>
                            <SelectTrigger className="w-[220px] h-14 bg-card rounded-2xl border-border shadow-sm hover:shadow-md transition-all font-bold">
                                <TagIcon className="w-4 h-4 mr-3 text-primary" />
                                <SelectValue placeholder="Tất cả chủ đề" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border shadow-2xl p-2">
                                <SelectItem value="all" className="rounded-xl font-bold py-3">Tất cả bài viết</SelectItem>
                                <SelectItem value="JLPT" className="rounded-xl font-bold py-3">Học thi JLPT</SelectItem>
                                <SelectItem value="Vocabulary" className="rounded-xl font-bold py-3">Từ vựng & Kanji</SelectItem>
                                <SelectItem value="Grammar" className="rounded-xl font-bold py-3">Ngữ pháp Kaiwa</SelectItem>
                                <SelectItem value="Culture" className="rounded-xl font-bold py-3">Văn hóa Nhật Bản</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* View Switcher */}

            </div>
        </div>
    )
}
