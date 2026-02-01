'use client'

import { Star, Quote, Heart, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { useQuery } from '@tanstack/react-query'
import { reviewApi } from '@/apis/services/review-api'

interface Testimonial {
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
    avatarUrl?: string;
}

const mockTestimonials: Testimonial[] = [
    {
        name: 'Trần Minh Quân',
        role: 'Học viên lớp N3 - Torii',
        content: 'AI Sensei là một cuộc cách mạng! Cảm giác như có một Sensei người Nhật bên cạnh 24/7 để giải đáp mọi thắc mắc về ngữ pháp một cách tức thì.',
        rating: 5,
        avatar: 'MQ',
        avatarUrl: undefined,
    },
    {
        name: 'Lê Thị Mỹ Linh',
        role: 'Du học sinh tại Tokyo',
        content: 'Hệ thống Flashcard thông minh giúp mình nhớ Kanji nhanh hơn rất nhiều so với cách học truyền thống. Nhờ Torii mà mình đã đỗ N2 chỉ sau 6 tháng.',
        rating: 5,
        avatar: 'ML',
        avatarUrl: undefined,
    },
    {
        name: 'Nguyễn Hoàng Nam',
        role: 'Kỹ sư phần mềm',
        content: 'Lớp học WebRTC rất ổn định, âm thanh rõ nét. Khả năng tương tác trực tiếp với giáo viên qua bảng trắng giúp những giờ học online không còn nhàm chán.',
        rating: 5,
        avatar: 'HN',
        avatarUrl: undefined,
    },
]

export function TestimonialsSection() {
    const { data: reviewsData } = useQuery({
        queryKey: ['home-reviews'],
        queryFn: () => reviewApi.getAllReviews(1, 3),
    })

    const reviews: Testimonial[] = reviewsData?.data && reviewsData.data.length > 0
        ? reviewsData.data.map(r => ({
            name: r.user.displayName,
            role: r.courseTitle || 'Học viên Torii',
            content: r.comment || '',
            rating: r.rating,
            avatar: r.user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            avatarUrl: r.user.avatarUrl
        }))
        : mockTestimonials

    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>Câu chuyện thành công</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-sans font-bold text-foreground tracking-tight">
                        Cảm Nhận Từ <span className="text-primary">Học Viên</span>
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium">
                        Hàng ngàn học viên đã thay đổi tương lai nhờ lộ trình học tập tối ưu tại Torii Nihongo.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {reviews.map((testimonial, index) => (
                        <div
                            key={index}
                            className="relative group bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-100 group-hover:text-primary transition-all">
                                <Quote className="w-8 h-8" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-base text-foreground/80 leading-relaxed mb-8 flex-1">
                                "{testimonial.content}"
                            </p>

                            {/* Author Banner */}
                            <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                                <Avatar className="w-10 h-10 rounded-full border border-border">
                                    <AvatarImage src={(testimonial as any).avatarUrl} alt={testimonial.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{testimonial.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-bold text-foreground">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Large Stats Bar */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 py-10 px-8 rounded-2xl bg-foreground text-background shadow-xl">
                    {[
                        { label: 'Tỉ lệ hài lòng', value: '98%', icon: Heart },
                        { label: 'Học viên đã học', value: '50K+', icon: Users },
                        { label: 'Điểm đánh giá', value: '4.9/5', icon: Star },
                        { label: 'Hỗ trợ AI 24/7', value: 'Sẵn sàng', icon: Heart },
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center space-y-1">
                            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-60">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
