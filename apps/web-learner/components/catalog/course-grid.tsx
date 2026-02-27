'use client';

import { CourseCard } from "./course-card"
import { useCourses } from "@/lib/api/services/course-api"
import { Inbox, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

interface CourseGridProps {
    searchQuery?: string
    selectedLevels?: string[]
    selectedTopics?: string[]
    priceFilter?: "all" | "free" | "paid"
    sortBy?: string
    currentPage?: number
    onPageChange?: (page: number) => void
}

export function CourseGrid({
    searchQuery = "",
    selectedLevels = [],
    selectedTopics = [],
    priceFilter = "all",
    sortBy = "popular",
    currentPage = 1,
    onPageChange = () => { }
}: CourseGridProps) {
    const ITEMS_PER_PAGE = 9;

    const { data: response, isLoading, error } = useCourses({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        q: searchQuery,
        levels: selectedLevels,
        topics: selectedTopics,
        priceFilter: priceFilter,
        sortBy: sortBy
    });

    const courses = response?.data || [];
    const totalPages = response?.totalPages || 1;

    const isEmpty = !isLoading && courses.length === 0;

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }
        
        if (currentPage <= 3) {
            return [1, 2, 3, '...', totalPages]
        }
        
        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 2, totalPages - 1, totalPages]
        }
        
        return [1, '...', currentPage, '...', totalPages]
    }

    return (
        <div className="space-y-12">
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 rounded-lg bg-destructive/5 border border-destructive/10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/10">
                        <Inbox className="w-8 h-8 text-destructive/60" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-destructive">Không thể tải dữ liệu</h3>
                        <p className="text-sm font-medium text-muted-foreground max-w-xs">{error?.message || 'Kết nối đến máy chủ bị gián đoạn'}</p>
                    </div>
                </div>
            ) : isEmpty ? (
                <div className="flex justify-center py-20 px-6 rounded-lg bg-muted/10 border border-border/50">
                    <Empty className="max-w-md">
                        <EmptyHeader>
                            <EmptyMedia variant="icon" className="bg-background shadow-sm border border-border">
                                <Search className="text-muted-foreground w-6 h-6" />
                            </EmptyMedia>
                            <EmptyTitle className="text-xl font-bold text-foreground">Không tìm thấy khóa học</EmptyTitle>
                            <EmptyDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                Chúng tôi không tìm thấy khóa học nào phù hợp với bộ lọc hiện tại của bạn. Vui lòng thử lại với các tiêu chí khác.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} {...course} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center pt-12 pb-8">
                            <nav className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-10 rounded-lg"
                                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>

                                {getPageNumbers().map((pageNum, idx) => (
                                    pageNum === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                                    ) : (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "ghost"}
                                            size="icon"
                                            className={cn(
                                                "size-10 rounded-lg font-bold",
                                                currentPage === pageNum && "bg-primary text-primary-foreground"
                                            )}
                                            onClick={() => onPageChange(pageNum as number)}
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                ))}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-10 rounded-lg"
                                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
