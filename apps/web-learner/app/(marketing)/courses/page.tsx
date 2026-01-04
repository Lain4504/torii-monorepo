import { SearchHeader } from "@/components/catalog/search-header"
import { FilterSidebar } from "@/components/catalog/filter-sidebar"
import { CourseGrid } from "@/components/catalog/course-grid"

export default function CourseCatalogPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SearchHeader />

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <CourseGrid />
                    </main>
                </div>
            </div>
        </div>
    )
}
