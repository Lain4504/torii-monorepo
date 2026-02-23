'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'

const faqs = [
    {
        q: 'Tôi cần trình độ ban đầu như thế nào?',
        a: 'Torii phù hợp với tất cả mọi người — từ người mới hoàn toàn (N5) đến người muốn chinh phục N1. AI đánh giá trình độ ngay sau đăng ký và tạo lộ trình phù hợp.',
    },
    {
        q: 'Lớp học WebRTC hoạt động như thế nào?',
        a: 'Lớp học sử dụng công nghệ WebRTC cho phép video call không độ trễ giữa giáo viên và học viên, tích hợp bảng trắng virtual và chia sẻ tài liệu real-time — gần như lớp học trực tiếp.',
    },
    {
        q: 'AI Sensei có thể giúp tôi những gì cụ thể?',
        a: 'AI Sensei hỗ trợ 24/7: dịch thuật tức thì, giải thích ngữ pháp theo ngữ cảnh cụ thể, phân tích lỗi sai trong bài làm, gợi ý từ vựng, và tạo bài tập cá nhân hóa theo điểm yếu của bạn.',
    },
    {
        q: 'Tôi có nhận được chứng chỉ không?',
        a: 'Có — sau khi vượt qua bài kiểm tra cuối khóa, bạn nhận chứng chỉ hoàn thành từ Torii Nihongo, được cộng đồng doanh nghiệp Nhật Bản tại Việt Nam công nhận rộng rãi.',
    },
    {
        q: 'Chính sách hoàn tiền như thế nào?',
        a: 'Torii cam kết hoàn tiền 100% trong vòng 7 ngày nếu bạn không hài lòng, không cần lý do. Chúng tôi tự tin vào chất lượng.',
    },
    {
        q: 'Tôi có thể học offline không?',
        a: 'Tài liệu, video bài giảng và Flashcard có thể tải về để học offline. Lớp học WebRTC và AI Sensei cần kết nối internet để hoạt động đầy đủ.',
    },
]

export function FaqSection() {
    const [open, setOpen] = useState<number | null>(0)

    return (
        <section className="py-24 lg:py-32 bg-muted/40">
            <div className="container max-w-3xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-14 space-y-3">
                    <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
                        FAQ
                    </Badge>
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Câu Hỏi Thường Gặp
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Mọi thứ bạn muốn biết trước khi bắt đầu.
                    </p>
                </div>

                {/* Accordion */}
                <div className="divide-y divide-border rounded-xl border bg-background overflow-hidden">
                    {faqs.map((faq, i) => (
                        <div key={i}>
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                aria-expanded={open === i}
                                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/40 transition-colors duration-150 cursor-pointer"
                            >
                                <span className="font-medium text-sm sm:text-base">{faq.q}</span>
                                <ChevronDown
                                    className={cn(
                                        'size-4 text-muted-foreground shrink-0 transition-transform duration-200',
                                        open === i && 'rotate-180'
                                    )}
                                />
                            </button>
                            <div
                                className={cn(
                                    'overflow-hidden transition-all duration-200 ease-in-out',
                                    open === i ? 'max-h-64' : 'max-h-0'
                                )}
                            >
                                <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
