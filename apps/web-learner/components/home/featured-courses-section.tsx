import { ArrowRight, Star } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

const courses = [
    {
        level: 'JLPT N5',
        title: 'Tiếng Nhật Cơ Bản N5',
        description: 'Tiếng Nhật nền tảng cho người mới bắt đầu. Tập trung vào Hiragana, Katakana và ngữ pháp cơ bản.',
        rating: 4.9,
        reviews: '1.2k',
        price: '120,000đ',
        levelColor: 'bg-muted',
    },
    {
        level: 'JLPT N3',
        title: 'Tiếng Nhật Trung Cấp N3',
        description: 'Cầu nối tới giao tiếp thành thạo. Học các sắc thái hội thoại hàng ngày và kanji trung cấp.',
        rating: 4.8,
        reviews: '850',
        price: '140,000đ',
        levelColor: 'bg-muted',
    },
    {
        level: 'KINH DOANH',
        title: 'Tiếng Nhật Kinh Doanh',
        description: 'Thành thạo Keigo (kính ngữ) và nghi thức công ty Nhật Bản để phát triển sự nghiệp.',
        rating: 5.0,
        reviews: '320',
        price: '180,000đ',
        levelColor: 'bg-accent/20 text-accent-foreground',
        featured: true,
    },
]

export function FeaturedCoursesSection() {
    return (
        <section className="py-24">
            <div className="container max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Khóa học phổ biến</h2>
                        <p className="text-muted-foreground">
                            Từ sơ cấp đến trình độ kinh doanh, chọn lộ trình phù hợp với bạn.
                        </p>
                    </div>
                    <Button variant="ghost" asChild className="group shrink-0">
                        <Link href="/courses" className="flex items-center gap-1">
                            Xem tất cả khóa học
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>

                {/* Course Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, i) => (
                        <div
                            key={i}
                            className="group bg-background border rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <Badge className={`${course.levelColor} border-none font-medium`}>
                                    {course.level}
                                </Badge>
                                <div className="flex items-center text-yellow-500 text-xs font-bold">
                                    <Star className="size-3 fill-yellow-500 mr-1" />
                                    {course.rating}{' '}
                                    <span className="text-muted-foreground font-normal ml-1">
                                        ({course.reviews})
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                            <p className="text-sm text-muted-foreground mb-6 flex-1">
                                {course.description}
                            </p>

                            {/* Footer */}
                            <div className="mt-auto pt-4 border-t flex items-center justify-between">
                                <span className="font-bold">
                                    {course.price}{' '}
                                    <span className="text-xs text-muted-foreground font-normal">/ tháng</span>
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:text-primary/80 font-semibold"
                                    asChild
                                >
                                    <Link href={`/courses/${i + 1}`}>Xem chi tiết</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
