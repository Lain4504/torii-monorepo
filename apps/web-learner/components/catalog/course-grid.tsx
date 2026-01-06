'use client'

import { CourseCard } from "./course-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination"
import { useCourses } from "./useCourses"

interface CourseGridProps {
    searchQuery?: string
    selectedLevel?: string
    priceFilter?: "all" | "free" | "paid"
    sortBy?: string
    currentPage?: number
    onPageChange?: (page: number) => void
}

export function CourseGrid({ 
    searchQuery = "", 
    selectedLevel = undefined, 
    priceFilter = "all",
    sortBy = "popular",
    currentPage = 1,
    onPageChange = () => {}
}: CourseGridProps) {
    const { data, isLoading, error } = useCourses({ 
        page: currentPage, 
        limit: 12,
        level: selectedLevel,
        q: searchQuery
    });

    console.log('CourseGrid - data:', data);
    console.log('CourseGrid - isLoading:', isLoading);
    console.log('CourseGrid - error:', error);
    console.log('CourseGrid - searchQuery:', searchQuery);
    console.log('CourseGrid - selectedLevel:', selectedLevel);
    console.log('CourseGrid - priceFilter:', priceFilter);

    const courses = data?.data || [];
    
    // Filter courses by price
    let filteredCourses = courses;
    if (priceFilter === "free") {
        filteredCourses = courses.filter(course => course.price === 0);
    } else if (priceFilter === "paid") {
        filteredCourses = courses.filter(course => course.price > 0);
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
                    {sortedCourses.map((course) => (
                        <CourseCard key={course.id} {...course} />
                    ))}
                </div>
            )}

            {!isEmpty && data && (
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
                        
                        {Array.from({ length: data.totalPages || 1 }, (_, i) => i + 1).map((page) => (
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
                                    if (currentPage < (data.totalPages || 1)) {
                                        onPageChange(currentPage + 1)
                                    }
                                }}
                                className={currentPage === (data.totalPages || 1) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}
