'use client'

import { Star, Quote, Heart, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Separator } from '@workspace/ui/components/separator'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { reviewApi } from '@/lib/api/services/review-api'

interface Testimonial {
    name: string
    role: string
    content: string
    rating: number
    avatar: string
    avatarUrl?: string
}

const mockTestimonials: Testimonial[] = [
    {
        name: 'Trần Minh Quân',
        role: 'Học viên lớp N3',
        content: 'AI Sensei là một cuộc cách mạng! Cảm giác như có một Sensei người Nhật bên cạnh 24/7 để giải đáp mọi thắc mắc về ngữ pháp một cách tức thì.',
        rating: 5,
        avatar: 'MQ',
    },
    {
        name: 'Lê Thị Mỹ Linh',
        role: 'Du học sinh tại Tokyo',
        content: 'Hệ thống Flashcard thông minh giúp mình nhớ Kanji nhanh hơn rất nhiều so với cách học truyền thống. Nhờ Torii mà mình đã đỗ N2 chỉ sau 6 tháng.',
        rating: 5,
        avatar: 'ML',
    },
    {
        name: 'Nguyễn Hoàng Nam',
        role: 'Kỹ sư phần mềm',
        content: 'Lớp học WebRTC rất ổn định. Khả năng tương tác trực tiếp với giáo viên qua bảng trắng giúp những giờ học online không còn nhàm chán.',
        rating: 5,
        avatar: 'HN',
    },
]

const stats = [
    { label: 'Tỉ lệ hài lòng', value: '98%', icon: Heart },
    { label: 'Học viên đã học', value: '50K+', icon: Users },
    { label: 'Điểm đánh giá', value: '4.9/5', icon: Star },
    { label: 'Hỗ trợ AI 24/7', value: 'Sẵn sàng', icon: Heart },
]

export function TestimonialsSection() {
    const { data: reviewsData } = useQuery({
        queryKey: ['home-reviews'],
        queryFn: () => reviewApi.getAllReviews(1, 3),
    })

    const reviews: Testimonial[] = reviewsData?.data?.length
        ? reviewsData.data.map(r => ({
            name: r.user.displayName,
            role: r.courseTitle || 'Học viên Torii',
            content: r.comment || '',
            rating: r.rating,
            avatar: r.user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            avatarUrl: r.user.avatarUrl,
        }))
        : mockTestimonials

    return (
        <section className="py-20 border-t bg-muted/30">
            <div className="container max-w-6xl mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                    <p className="text-sm font-semibold text-primary">Câu chuyện thành công</p>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Cảm Nhận Từ <span className="text-primary">Học Viên</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Hàng ngàn học viên đã thay đổi tương lai nhờ lộ trình học tập tối ưu tại Torii Nihongo.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-12">
                    {reviews.map((t, i) => (
                        <Card key={i} className="relative flex flex-col">
                            <CardContent className="p-6 flex flex-col h-full">
                                <Quote className="absolute top-4 right-4 w-6 h-6 text-border" />

                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                                    "{t.content}"
                                </p>

                                <Separator className="mb-4" />

                                <div className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9">
                                        <AvatarImage src={t.avatarUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                            {t.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Stats Row */}
                <Card className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center space-y-1">
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    ))}
                </Card>
            </div>
        </section>
    )
}
