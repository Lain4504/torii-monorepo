'use client'

import { CourseCard } from "./course-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination"

const MOCK_COURSES = [
    {
        id: '1',
        title: 'Tiếng Nhật Sơ Cấp N5: Khởi đầu vững chắc',
        slug: 'n5-basic',
        thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=2992&auto=format&fit=crop',
        level: 'N5',
        instructor: { name: 'Yamada Yuki', avatar: 'https://i.pravatar.cc/150?u=yamada' },
        rating: 4.9,
        reviewCount: 2543,
        students: 15234,
        price: 1299000,
        originalPrice: 2500000,
        totalLessons: 150,
        totalHours: 45,
        isLive: false
    },
    {
        id: '2',
        title: 'Lớp Live N4: Giao tiếp & Kaiwa thực chiến',
        slug: 'n4-live-kaiwa',
        thumbnail: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2940&auto=format&fit=crop',
        level: 'N4',
        instructor: { name: 'Tanaka Ken', avatar: 'https://i.pravatar.cc/150?u=tanaka' },
        rating: 4.8,
        reviewCount: 890,
        students: 3400,
        price: 3500000,
        originalPrice: 5000000,
        totalLessons: 24,
        totalHours: 36,
        isLive: true
    },
    {
        id: '3',
        title: 'Luyện thi JLPT N3: Chiến thuật Dokkai & Choukai',
        slug: 'n3-jlpt-prep',
        thumbnail: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?q=80&w=2940&auto=format&fit=crop',
        level: 'N3',
        instructor: { name: 'Nguyễn Minh', avatar: 'https://i.pravatar.cc/150?u=minh' },
        rating: 4.7,
        reviewCount: 1200,
        students: 8500,
        price: 1890000,
        originalPrice: 2800000,
        totalLessons: 120,
        totalHours: 40,
        isLive: false
    },
    {
        id: '4',
        title: 'Kanji Master N2: 1000 Hán tự trong 30 ngày',
        slug: 'n2-kanji-master',
        thumbnail: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2940&auto=format&fit=crop',
        level: 'N2',
        instructor: { name: 'Sato Haruto', avatar: 'https://i.pravatar.cc/150?u=sato' },
        rating: 4.9,
        reviewCount: 560,
        students: 4200,
        price: 990000,
        originalPrice: 1500000,
        totalLessons: 30,
        totalHours: 15,
        isLive: false
    },
    {
        id: '5',
        title: 'Chinh phục N1: Đọc hiểu chuyên sâu',
        slug: 'n1-dokkai',
        thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2940&auto=format&fit=crop',
        level: 'N1',
        instructor: { name: 'Dr. Fujimoto', avatar: 'https://i.pravatar.cc/150?u=fujimoto' },
        rating: 4.9,
        reviewCount: 230,
        students: 1500,
        price: 2100000,
        originalPrice: 3000000,
        totalLessons: 50,
        totalHours: 25,
        isLive: false
    },
    {
        id: '6',
        title: 'Bộ đề thi thử JLPT N5 Full Test (2025)',
        slug: 'n5-mock-test-2025',
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2873&auto=format&fit=crop',
        level: 'N5',
        instructor: { name: 'Torii Team', avatar: 'https://i.pravatar.cc/150?u=torii' },
        rating: 4.6,
        reviewCount: 340,
        students: 12000,
        price: 199000,
        totalLessons: 10,
        totalHours: 5,
        isLive: false
    }
]

export function CourseGrid() {
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_COURSES.map((course) => (
                    <CourseCard key={course.id} {...course} />
                ))}
            </div>

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
