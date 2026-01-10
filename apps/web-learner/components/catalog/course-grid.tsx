'use client';

import { CourseCard } from "./course-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination"
import { useCourses } from "./useCourses"
import { Inbox } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';

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
    onPageChange = () => { }
}: CourseGridProps) {
    const ITEMS_PER_PAGE = 12;



    const { data: response, isLoading, error } = useCourses({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        q: searchQuery,
        levels: selectedLevels,
        priceFilter: priceFilter,
        sortBy: sortBy
    });

    const courses = response?.data || [];
    const totalPages = response?.totalPages || 1;

    const isEmpty = !isLoading && courses.length === 0;

    return (
        <div className="space-y-12">
            {isLoading ? (
                <div className="text-center py-12">Đang tải khoá học...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">
                    Lỗi tải khoá học: {error?.message || 'Unknown error'}
                </div>
            ) : isEmpty ? (
                <div className="flex justify-center py-12">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
                            <EmptyTitle>Không có khoá học nào</EmptyTitle>
                            <EmptyDescription>
                                Không tìm thấy khoá học nào phù hợp với tìm kiếm của bạn.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
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
    );
}
