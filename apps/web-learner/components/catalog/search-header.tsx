'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

interface SearchHeaderProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    sortBy: string
    onSortChange: (sort: string) => void
}

export function SearchHeader({ searchQuery, onSearchChange, sortBy, onSortChange }: SearchHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm khóa học..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>
            <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Sắp xếp" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="popular">Phổ biến nhất</SelectItem>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price-asc">Giá thấp → cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao → thấp</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
