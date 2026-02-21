'use client'

import { useState } from "react"
import { SearchHeader } from "@/components/catalog/search-header"
import { FilterSidebar } from "@/components/catalog/filter-sidebar"
import { CourseGrid } from "@/components/catalog/course-grid"

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
                <SearchHeader
                    searchQuery={searchQuery}
                    onSearchChange={(q) => { setSearchQuery(q); resetPage() }}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />

                <div className="grid lg:grid-cols-4 gap-8">
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