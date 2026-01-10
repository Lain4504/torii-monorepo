'use client';

import { CourseCard } from "./course-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination"
import { useCourses } from "./useCourses"
import { Inbox, Loader2 } from "lucide-react"
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
        <div className="space-y-20">
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] rounded-[2rem] bg-muted/20 animate-pulse flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-muted-foreground/20 animate-spin" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[2.5rem] bg-destructive/5 border border-destructive/10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                        <Inbox className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-destructive">Lỗi tải dữ liệu</h3>
                        <p className="text-xs font-bold text-muted-foreground max-w-xs">{error?.message || 'Không thể kết nối với máy chủ'}</p>
                    </div>
                </div>
            ) : isEmpty ? (
                <div className="flex justify-center py-24 px-6 rounded-[2.5rem] bg-muted/20 border border-border/40">
                    <Empty className="max-w-md">
                        <EmptyHeader>
                            <EmptyMedia variant="icon" className="bg-background shadow-xl"><Inbox className="text-primary w-8 h-8" /></EmptyMedia>
                            <EmptyTitle className="text-xl font-black tracking-tight uppercase">Không tìm thấy khóa học</EmptyTitle>
                            <EmptyDescription className="font-bold text-muted-foreground/60">
                                Dường như không có khóa học nào phù hợp với các tiêu chí tìm kiếm hiện tại của bạn.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-1000">
                    {courses.map((course) => (
                        <CourseCard key={course.id} {...course} />
                    ))}
                </div>
            )}

            {!isEmpty && !isLoading && totalPages > 1 && (
                <div className="pt-8 flex justify-center border-t border-border/40">
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
                                    className={currentPage === 1 ? "pointer-events-none opacity-30 h-12 w-12 rounded-xl" : "cursor-pointer h-12 w-12 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"}
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
                                            "h-12 w-12 rounded-xl font-black transition-all",
                                            currentPage === page
                                                ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
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
                                    className={currentPage === totalPages ? "pointer-events-none opacity-30 h-12 w-12 rounded-xl" : "cursor-pointer h-12 w-12 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
