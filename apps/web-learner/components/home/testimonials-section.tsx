'use client'

import { useState } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { useQuery } from '@tanstack/react-query'
import { reviewApi } from '@/lib/api/services/review-api'

interface Review {
    name: string
    role: string
    content: string
    rating: number
    avatar: string
    avatarUrl?: string
    result?: string
}

const mockReviews: Review[] = [
    {
        name: 'Trần Minh Quân',
        role: 'Học viên',
        result: 'Đỗ JLPT N3 sau 5 tháng',
        content: 'AI Sensei thật tuyệt vời. Mình hỏi một câu về ngữ pháp lúc 2 giờ sáng và được giải thích chi tiết ngay lập tức — điều này không thể có ở bất kỳ trung tâm nào.',
        rating: 5,
        avatar: 'MQ',
    },
    {
        name: 'Lê Thị Mỹ Linh',
        role: 'Du học sinh tại Tokyo',
        result: 'Đỗ JLPT N2 chỉ sau 6 tháng',
        content: 'Hệ thống Flashcard SRS của Torii giúp mình ghi nhớ Kanji nhanh đến mức kinh ngạc. 6 tháng mà đỗ N2 — bạn bè không tin nhưng đây là sự thật.',
        rating: 5,
        avatar: 'ML',
    },
    {
        name: 'Nguyễn Hoàng Nam',
        role: 'Kỹ sư phần mềm',
        result: 'Làm việc tại Nhật sau N2',
        content: 'Lớp học trực tuyến chất lượng cao, không bị giật lag. Tương tác với giáo viên qua bảng trắng ảo rất trực quan — cảm giác gần như ngồi học trực tiếp.',
        rating: 5,
        avatar: 'HN',
    },
    {
        name: 'Phạm Thu Hà',
        role: 'Sinh viên năm 3',
        result: 'Đỗ JLPT N4 lần đầu tiên',
        content: 'Lộ trình cá nhân hóa rất quan trọng với mình vì lịch học không đều. AI biết lúc nào mình đang yếu chỗ nào và tự điều chỉnh bài học — không cần mình tự lo.',
        rating: 5,
        avatar: 'TH',
    },
]

export function TestimonialsSection() {
    const [current, setCurrent] = useState(0)

    const { data: reviewsData } = useQuery({
        queryKey: ['home-reviews'],
        queryFn: () => reviewApi.getAllReviews(1, 6),
    })

    const reviews: Review[] = reviewsData?.data?.length
        ? reviewsData.data.map(r => ({
            name: r.user.displayName,
            role: r.courseTitle || 'Học viên Torii',
            content: r.comment || '',
            rating: r.rating,
            avatar: r.user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
            avatarUrl: r.user.avatarUrl,
        }))
        : mockReviews

    const prev = () => setCurrent((c) => (c - 1 + reviews.length) % reviews.length)
    const next = () => setCurrent((c) => (c + 1) % reviews.length)
    const r = reviews[current]

    return (
        <section className="py-24 lg:py-32 bg-background">
            <div className="container max-w-6xl mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Left: headline */}
                    <div className="space-y-5">
                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
                            Câu chuyện thành công
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
                            Học Viên Nói Gì Về{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                                Torii?
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Kết quả thật sự từ các học viên đã học tại Torii.
                        </p>

                        {/* Navigation */}
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={prev}
                                className="rounded-full size-10 cursor-pointer"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={next}
                                className="rounded-full size-10 cursor-pointer"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground ml-2">
                                {current + 1} / {reviews.length}
                            </span>
                        </div>

                        {/* Dots */}
                        <div className="flex gap-1.5">
                            {reviews.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${i === current ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: review card */}
                    <div className="relative">
                        <div className="rounded-2xl border bg-card p-8 space-y-6 shadow-sm">
                            <Quote className="size-10 text-primary/15" />

                            {/* Stars */}
                            <div className="flex gap-1">
                                {[...Array(r?.rating ?? 0)].map((_, j) => (
                                    <Star key={j} className="size-5 fill-primary text-primary" />
                                ))}
                            </div>

                            {/* Result badge */}
                            {r?.result && (
                                <Badge className="rounded-full text-xs font-semibold">
                                    🎯 {r.result}
                                </Badge>
                            )}

                            {/* Content */}
                            <p className="text-foreground leading-relaxed text-base">
                                &ldquo;{r?.content}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-2 border-t">
                                <Avatar className="size-10 border">
                                    <AvatarImage src={r?.avatarUrl} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                        {r?.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{r?.name}</p>
                                    <p className="text-xs text-muted-foreground">{r?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
