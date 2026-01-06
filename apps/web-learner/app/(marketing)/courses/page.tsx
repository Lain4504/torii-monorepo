'use client'

import { useState } from "react"
import { SearchHeader } from "@/components/catalog/search-header"
import { FilterSidebar } from "@/components/catalog/filter-sidebar"
import { CourseGrid } from "@/components/catalog/course-grid"

export default function CourseCatalogPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined)
    const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all")
    const [sortBy, setSortBy] = useState("popular")
    const [currentPage, setCurrentPage] = useState(1)

    const handleFilterChange = () => {
        setCurrentPage(1)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SearchHeader 
                    searchQuery={searchQuery}
                    onSearchChange={(q) => {
                        setSearchQuery(q)
                        handleFilterChange()
                    }}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24">
                            <FilterSidebar 
                                selectedLevel={selectedLevel}
                                onLevelChange={(level) => {
                                    setSelectedLevel(level)
                                    handleFilterChange()
                                }}
                                priceFilter={priceFilter}
                                onPriceChange={(price) => {
                                    setPriceFilter(price)
                                    handleFilterChange()
                                }}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <CourseGrid 
                            searchQuery={searchQuery}
                            selectedLevel={selectedLevel}
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
