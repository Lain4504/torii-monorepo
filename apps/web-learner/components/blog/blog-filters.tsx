'use client'

import { Search, SlidersHorizontal, Tag as TagIcon } from 'lucide-react'
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
import { Field } from '@workspace/ui/components/field'

interface PostFiltersProps {
    onSearch: (value: string) => void
    onTagChange: (tag: string) => void
    onAuthorChange: (authorId: string) => void
    onSortChange: (sort: string) => void
}

export function PostFilters({ onSearch, onTagChange, onAuthorChange, onSortChange }: PostFiltersProps) {
    const [searchValue, setSearchValue] = useState('')

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(searchValue)
    }

    return (
        <div className="flex flex-col gap-8 mb-16">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 max-w-2xl group">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Tìm kiếm kiến thức tiếng Nhật..."
                        className="pl-11 pr-4 h-12 rounded-2xl bg-muted/30 border-border/40 focus:border-primary/40 focus:bg-background transition-all"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <Button type="submit" className="h-12 px-8 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                    Tìm kiếm
                </Button>
            </form>

            {/* Selectors */}
            <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                    <Field>
                        <Select onValueChange={onSortChange}>
                            <SelectTrigger className="w-[200px] h-11 rounded-xl bg-background border-border/40 shadow-sm focus:ring-primary/20">
                                <SlidersHorizontal className="size-4 mr-2.5 text-muted-foreground" />
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="newest" className="font-medium">Mới nhất</SelectItem>
                                <SelectItem value="popular" className="font-medium">Xem nhiều nhất</SelectItem>
                                <SelectItem value="likes" className="font-medium">Yêu thích nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <Select onValueChange={onTagChange}>
                            <SelectTrigger className="w-[220px] h-11 rounded-xl bg-background border-border/40 shadow-sm focus:ring-primary/20">
                                <TagIcon className="size-4 mr-2.5 text-muted-foreground" />
                                <SelectValue placeholder="Tất cả chủ đề" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-medium">Tất cả bài viết</SelectItem>
                                <SelectItem value="JLPT" className="font-medium">Học thi JLPT</SelectItem>
                                <SelectItem value="Vocabulary" className="font-medium">Từ vựng & Kanji</SelectItem>
                                <SelectItem value="Grammar" className="font-medium">Ngữ pháp Kaiwa</SelectItem>
                                <SelectItem value="Culture" className="font-medium">Văn hóa Nhật Bản</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </div>
        </div>
    )
}
