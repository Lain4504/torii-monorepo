'use client'

import { CourseCard } from "./course-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination"
import { useCourses } from "./useCourses"

interface CourseGridProps {
    searchQuery?: string
    selectedLevels?: string[]
    priceFilter?: "all" | "free" | "paid"
    sortBy?: string
    currentPage?: number
    onPageChange?: (page: number) => void
}

export function CourseGrid({ 
    searchQuery = "", 
    selectedLevels = [], 
    priceFilter = "all",
    sortBy = "popular",
    currentPage = 1,
    onPageChange = () => {}
}: CourseGridProps) {
    const ITEMS_PER_PAGE = 12;
    
    const { data, isLoading, error } = useCourses({ 
        page: 1,
        limit: 1000, // Fetch all data to filter client-side
        q: searchQuery
    });

    const courses = data?.data || [];
    
    // Filter courses by level (OR logic - show courses matching ANY selected level)
    let filteredCourses = courses;
    if (selectedLevels.length > 0) {
        filteredCourses = courses.filter(course => 
            selectedLevels.includes(course.level)
        );
    }
    
    // Filter courses by price
    if (priceFilter === "free") {
        filteredCourses = filteredCourses.filter(course => course.price === 0);
    } else if (priceFilter === "paid") {
        filteredCourses = filteredCourses.filter(course => course.price > 0);
    }
    
    // Sort courses based on sortBy parameter
    let sortedCourses = [...filteredCourses];
    if (sortBy === 'newest') {
        sortedCourses.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
    } else if (sortBy === 'price-asc') {
        sortedCourses.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        sortedCourses.sort((a, b) => b.price - a.price);
    }
    // 'popular' is default, no sorting needed

    // Calculate pagination based on filtered data
    const totalPages = Math.ceil(sortedCourses.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCourses = sortedCourses.slice(startIndex, endIndex);

    const isEmpty = !isLoading && sortedCourses.length === 0;

    return (
        <div className="space-y-12">
            {isLoading ? (
                <div className="text-center py-12">Đang tải khoá học...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">
                    Lỗi tải khoá học: {error?.message || 'Unknown error'}
                </div>
            ) : isEmpty ? (
                <div className="text-center py-12 text-gray-500">Không có khoá học nào phù hợp với tìm kiếm</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedCourses.map((course) => (
                        <CourseCard key={course.id} {...course} />
                    ))}
                </div>
            )}

            {!isEmpty && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage > 1) {
                                        onPageChange(currentPage - 1)
                                    }
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink 
                                    href="#"
                                    isActive={currentPage === page}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onPageChange(page)
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                            <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage < totalPages) {
                                        onPageChange(currentPage + 1)
                                    }
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}
