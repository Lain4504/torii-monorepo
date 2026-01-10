'use client'

import { Star, Quote, Heart, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { cn } from '@workspace/ui/lib/utils'

const testimonials = [
    {
        name: 'Trần Minh Quân',
        role: 'Học viên lớp N3 - Torii',
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
        content: 'Lớp học WebRTC rất ổn định, âm thanh rõ nét. Khả năng tương tác trực tiếp với giáo viên qua bảng trắng giúp những giờ học online không còn nhàm chán.',
        rating: 5,
        avatar: 'HN',
    },
]

export function TestimonialsSection() {
    return (
        <section className="py-32 relative bg-muted/30 overflow-hidden">
            {/* Zen Ambient Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <Users className="w-3 h-3" />
                        <span>Success Stories</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic">
                        Cảm Nhận Từ <span className="text-primary not-italic">Học Viên</span>
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto opacity-70">
                        Hàng ngàn học viên đã thay đổi tương lai nhờ lộ trình học tập tối ưu tại Torii Nihongo.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="relative group bg-background/60 backdrop-blur-xl rounded-[2.5rem] p-10 border border-border/40 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col cursor-default"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-8 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Quote className="w-12 h-12 text-primary" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-8">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-base text-foreground font-bold italic leading-relaxed mb-10 flex-1">
                                "{testimonial.content}"
                            </p>

                            {/* Author Banner */}
                            <div className="flex items-center gap-5 pt-8 border-t border-border/20">
                                <Avatar className="w-12 h-12 rounded-2xl border border-border/40">
                                    <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-black">{testimonial.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <div className="text-xs font-black uppercase tracking-widest text-foreground">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Large Stats Bar */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 py-12 px-8 rounded-[2.5rem] bg-foreground text-background">
                    {[
                        { label: 'Tỉ lệ hài lòng', value: '98%', icon: Heart },
                        { label: 'Học viên đã học', value: '50K+', icon: Users },
                        { label: 'Điểm đánh giá', value: '4.9/5', icon: Star },
                        { label: 'Hỗ trợ AI 24/7', value: 'Active', icon: Heart },
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center space-y-2">
                            <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
