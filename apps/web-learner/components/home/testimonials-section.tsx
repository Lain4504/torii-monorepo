'use client'

import { Star, Quote, Heart, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Separator } from '@workspace/ui/components/separator'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { reviewApi } from '@/lib/api/services/review-api'
import { Badge } from '@workspace/ui/components/badge'

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
        <section className="py-20 bg-muted/30">
            <div className="container max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
                    <div>
                        <Badge variant="secondary" className="px-3 py-1 font-bold text-[10px]">
                            Câu chuyện thành công
                        </Badge>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                        Cảm Nhận Từ Học Viên
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-balance">
                        Hàng ngàn học viên đã thay đổi tương lai nhờ lộ trình học tập tối ưu tại Torii Nihongo.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {reviews.map((t, i) => (
                        <Card key={i} className="group border shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-8 flex flex-col h-full gap-6">
                                <Quote className="absolute top-6 right-8 size-8 text-primary/10 group-hover:text-primary transition-colors" />

                                <div className="flex gap-0.5">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                                    "{t.content}"
                                </p>

                                <div className="pt-6 border-t flex items-center gap-4">
                                    <Avatar className="size-10 border">
                                        <AvatarImage src={t.avatarUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {t.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold tracking-tight">{t.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground/60">{t.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Stats Row */}
                <Card className="border bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
                            {stats.map((s, i) => (
                                <div key={i} className="p-8 text-center flex flex-col gap-2 group hover:bg-primary/5 transition-colors">
                                    <p className="text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">{s.value}</p>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground/60">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
