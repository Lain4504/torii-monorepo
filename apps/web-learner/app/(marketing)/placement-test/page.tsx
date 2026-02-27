"use client"

import { PlacementTest } from "@/components/assessment/placement-test"
import { Badge } from "@workspace/ui/components/badge"
import { Sparkles } from "lucide-react"

export default function PlacementTestPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Hero for Marketing */}
            <div className="border-b bg-muted/30">
                <div className="container max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
                            <Sparkles className="size-3.5 mr-1.5 text-primary" />
                            Đánh giá năng lực miễn phí
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                            Xác Định Trình Độ <br />
                            <span className="text-primary">Tiếng Nhật Của Bạn</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium">
                            Đừng lãng phí thời gian học những gì bạn đã biết. <br className="hidden md:block" />
                            Sử dụng AI của Torii để tìm điểm bắt đầu hoàn hảo cho hành trình chinh phục JLPT của bạn.
                        </p>
                    </div>
                </div>
            </div>

            {/* Test Content */}
            <div className="container max-w-6xl mx-auto px-4 py-12">
                <div className="bg-card border rounded-[2rem] shadow-2xl overflow-hidden relative group">
                    {/* Decorative Background for marketing feel */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Sparkles className="size-64 text-primary" />
                    </div>

                    <div className="relative z-10 p-4 md:p-12">
                        <PlacementTest />
                    </div>
                </div>

                {/* Marketing Footer */}
                <div className="mt-20 text-center space-y-8 pb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                        Tại sao phải thi thử?
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="space-y-3">
                            <h4 className="font-bold text-lg">Tiết kiệm thời gian</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Nhảy thẳng vào những bài học phù hợp với trình độ hiện tại, không cần học lại từ bảng chữ cái nếu bạn đã vững.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-lg">Phân tích AI chính xác</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Thuật toán của chúng tôi phân tích không chỉ câu đúng, mà cả cách bạn trả lời để đo lường độ hiểu sâu.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-lg">Lộ trình cá nhân hóa</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Sau khi hoàn thành, Torii sẽ kiến nghị một lộ trình học riêng biệt dựa trên điểm mạnh và điểm yếu của bạn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
