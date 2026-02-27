import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'

const testimonials = [
    {
        quote: 'Luyện tập hội thoại với AI Sensei thực sự rất hữu ích. Lỗi sai được sửa tức thì nên tôi tự tin hơn rất nhiều.',
        name: 'Nguyễn Minh Anh',
        role: 'Đỗ JLPT N2',
        avatar: 'MA',
    },
    {
        quote: 'Nhờ khóa học kinh doanh, tôi đã chuyển việc thành công sang công ty Nhật. Cách dạy kính ngữ rất dễ hiểu.',
        name: 'Trần Hương Lan',
        role: 'Kỹ sư phần mềm',
        avatar: 'HL',
    },
    {
        quote: 'Chất lượng WebRTC rất cao, cảm giác như đang nói chuyện trực tiếp. Chất lượng giáo viên cũng rất tốt.',
        name: 'Lê Quang Huy',
        role: 'Sinh viên đại học',
        avatar: 'QH',
    },
]

export function TestimonialsNewSection() {
    return (
        <section className="py-24 overflow-hidden">
            <div className="container max-w-7xl mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Ý kiến học viên</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <div key={i} className="p-8 bg-background border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <p className="italic text-muted-foreground mb-6 leading-relaxed">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10 bg-primary/10">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                        {testimonial.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold">{testimonial.name}</p>
                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
