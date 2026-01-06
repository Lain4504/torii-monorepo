'use client'

import { CourseCard } from "./course-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination"
import { useCourses } from "./useCourses"

export function CourseGrid() {
    // Example: lấy filter từ URL hoặc props, ở đây hardcode cho demo
    const { data, isLoading, error } = useCourses({ page: 1, limit: 12 });

    return (
        <div className="space-y-12">
            {isLoading ? (
                <div className="text-center py-12">Đang tải khoá học...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">Lỗi tải khoá học</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.data.map((course) => (
                        <CourseCard key={course.id} {...course} />
                    ))}
                </div>
            )}

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
