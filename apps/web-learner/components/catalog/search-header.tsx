'use client'

import { Search } from "lucide-react"
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
        <div className="space-y-6 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Thư viện khóa học</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Khám phá hơn 200+ khóa học tiếng Nhật từ N5 đến N1
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm khóa học theo tên, kỹ năng..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-11 bg-white dark:bg-slate-900 text-black dark:text-white placeholder:text-slate-500"
                    />
                </div>
                <div className="w-full md:w-[200px]">
                    <Select value={sortBy} onValueChange={onSortChange}>
                        <SelectTrigger className="h-11 bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Phổ biến nhất</SelectItem>
                            <SelectItem value="newest">Mới nhất</SelectItem>
                            <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                            <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
