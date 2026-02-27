'use client'

import { useState } from "react"
import { SearchHeader } from "@/components/catalog/search-header"
import { FilterSidebar } from "@/components/catalog/filter-sidebar"
import { CourseGrid } from "@/components/catalog/course-grid"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"

const JLPT_LEVELS = [
    { label: 'Tất cả cấp độ', value: 'all' },
    { label: 'N5 — Sơ cấp', value: 'N5' },
    { label: 'N4 — Sơ trung', value: 'N4' },
    { label: 'N3 — Trung cấp', value: 'N3' },
    { label: 'N2 — Cao cấp', value: 'N2' },
    { label: 'N1 — Thượng cấp', value: 'N1' },
]

const PRICE_OPTIONS = [
    { label: 'Tất cả mức giá', value: 'all' },
    { label: 'Miễn phí', value: 'free' },
    { label: 'Trả phí', value: 'paid' },
]

export default function CourseCatalogPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedLevels, setSelectedLevels] = useState<string[]>([])
    const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all")
    const [sortBy, setSortBy] = useState("popular")
    const [currentPage, setCurrentPage] = useState(1)

    const resetPage = () => setCurrentPage(1)

    return (
        <div className="min-h-screen bg-background">
            {/* Page Header */}
            <div className="border-b bg-muted/30">
                <div className="container max-w-7xl mx-auto px-4 py-12">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-primary">Khóa học</p>
                        <h1 className="text-3xl font-bold tracking-tight">Danh mục khóa học</h1>
                        <p className="text-muted-foreground">Tìm kiếm khóa học phù hợp với lộ trình học tiếng Nhật của bạn.</p>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
                <div className="space-y-4">
                    <SearchHeader
                        searchQuery={searchQuery}
                        onSearchChange={(q) => { setSearchQuery(q); resetPage() }}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />

                    {/* Mobile Filters */}
                    <div className="grid grid-cols-2 gap-3 lg:hidden">
                        <Select
                            value={selectedLevels.length === 1 ? selectedLevels[0] : "all"}
                            onValueChange={(val) => {
                                setSelectedLevels(val === "all" ? [] : [val])
                                resetPage()
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Cấp độ" />
                            </SelectTrigger>
                            <SelectContent>
                                {JLPT_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={priceFilter}
                            onValueChange={(val: "all" | "free" | "paid") => {
                                setPriceFilter(val)
                                resetPage()
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Giá" />
                            </SelectTrigger>
                            <SelectContent>
                                {PRICE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-20">
                            <FilterSidebar
                                selectedLevels={selectedLevels}
                                onLevelChange={(levels) => { setSelectedLevels(levels); resetPage() }}
                                priceFilter={priceFilter}
                                onPriceChange={(price) => { setPriceFilter(price); resetPage() }}
                            />
                        </div>
                    </aside>

                    <main className="lg:col-span-3">
                        <CourseGrid
                            searchQuery={searchQuery}
                            selectedLevels={selectedLevels}
                            priceFilter={priceFilter}
                            sortBy={sortBy}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </main>
                </div>
            </div>
        </div>
    )
}
