'use client';

import { CourseCard } from "./course-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination"
import { useCourses } from "./useCourses"
import { Inbox, Loader2, Search } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { cn } from "@workspace/ui/lib/utils";

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
    const ITEMS_PER_PAGE = 9;

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
        <div className="space-y-16">
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] rounded-2xl bg-muted/20 animate-pulse flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-muted-foreground/20 animate-spin" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl bg-destructive/5 border border-destructive/10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/10">
                        <Inbox className="w-8 h-8 text-destructive/60" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-destructive">Không thể tải dữ liệu</h3>
                        <p className="text-sm font-medium text-muted-foreground max-w-xs">{error?.message || 'Kết nối đến máy chủ bị gián đoạn'}</p>
                    </div>
                </div>
            ) : isEmpty ? (
                <div className="flex justify-center py-20 px-6 rounded-3xl bg-muted/10 border border-border/50">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                    {courses.map((course) => (
                        <CourseCard key={course.id} {...course} />
                    ))}
                </div>
            )}

            {!isEmpty && !isLoading && totalPages > 1 && (
                <div className="pt-8 flex justify-center border-t border-border/50">
                    <Pagination>
                        <PaginationContent className="gap-2">
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage > 1) {
                                            onPageChange(currentPage - 1)
                                        }
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/5 hover:text-primary transition-all"}
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
                                        className={cn(
                                            "transition-all font-bold",
                                            currentPage === page
                                                ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                                                : "hover:bg-primary/5 hover:text-primary text-muted-foreground"
                                        )}
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
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/5 hover:text-primary transition-all"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
