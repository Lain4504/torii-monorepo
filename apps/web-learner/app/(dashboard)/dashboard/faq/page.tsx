import { Button } from '@workspace/ui/components/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@workspace/ui/components/accordion'
import { Card } from '@workspace/ui/components/card'
import { HelpCircle, MessageCircle, Sparkles, BookOpen, ShieldCheck, Zap } from 'lucide-react'

const faqs = [
    {
        question: 'Torii Nihongo là gì?',
        answer: 'Torii Nihongo là nền tảng học tiếng Nhật toàn diện, kết hợp giữa các khóa học chất lượng cao, trợ lý AI thông minh và hệ thống luyện tập thực hành được cá nhân hóa để giúp bạn chinh phục tiếng Nhật hiệu quả nhất.',
        icon: Sparkles
    },
    {
        question: 'Người mới bắt đầu nên bắt đầu từ đâu?',
        answer: 'Nếu bạn là người mới hoàn toàn, hãy bắt đầu từ lộ trình N5. Torii cung cấp đầy đủ từ bảng chữ cái (Hiragana, Katakana) đến các mẫu câu giao tiếp cơ bản thông qua các bài giảng video và tài liệu đi kèm.',
        icon: BookOpen
    },
    {
        question: 'Tôi có thể học thử trước khi đăng ký không?',
        answer: 'Có, bạn có thể xem danh mục khóa học và các thông tin giới thiệu. Một số bài học đầu tiên của các khóa VOD thường được mở miễn phí để bạn trải nghiệm chất lượng giảng dạy trước khi quyết định đăng ký.',
        icon: Zap
    },
    {
        question: 'Làm thế nào để theo dõi tiến độ học tập?',
        answer: 'Sau khi đăng nhập, Dashboard sẽ hiển thị chi tiết tiến độ hoàn thành bài học, số lượng điểm XP bạn đã tích lũy và các huy chương đạt được. Bạn cũng có thể xem lại lịch sử các buổi học Live đã tham gia.',
        icon: ShieldCheck
    },
    {
        question: 'Đăng ký lớp Live và khóa VOD khác nhau như thế nào?',
        answer: 'Lớp Live là hình thức học trực tuyến tương tác trực tiếp với giảng viên qua Google Meet theo lịch cố định. Khóa VOD là các bài giảng được quay sẵn, giúp bạn linh động học tập mọi lúc mọi nơi theo thời gian biểu cá nhân.',
        icon: MessageCircle
    },
]

export default function DashboardFAQPage() {
    return (
        <div className="space-y-12 max-w-6xl mx-auto py-8">
            {/* Header Section */}
            <div className="space-y-4 pb-8 border-b border-border mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hỗ trợ & Giải đáp</h1>
                <p className="text-sm font-medium text-muted-foreground">
                    Mọi thông tin bạn cần để bắt đầu hành trình chinh phục tiếng Nhật tại Torii Academy.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* FAQ List */}
                <div className="lg:col-span-8 space-y-6">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem 
                                key={index} 
                                value={`item-${index}`} 
                                className="border border-border/50 bg-card rounded-2xl px-6 hover:shadow-sm transition-shadow group"
                            >
                                <AccordionTrigger className="text-left font-bold text-base sm:text-lg hover:no-underline py-5 group-hover:text-primary transition-colors border-none">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-muted group-data-[state=open]:bg-primary/10 group-data-[state=open]:text-primary flex items-center justify-center transition-colors">
                                            <faq.icon className="size-5" />
                                        </div>
                                        <span className="line-clamp-1">{faq.question}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base pb-6 pl-14 pt-2">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Sidebar Support */}
                <aside className="lg:col-span-4 space-y-6">
                    <Card className="rounded-2xl border-border bg-card p-8 text-center space-y-6 shadow-sm">
                        <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                            <MessageCircle className="size-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-xl">Bạn vẫn còn thắc mắc?</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Đội ngũ giảng viên luôn sẵn sàng lắng nghe và giải đáp mọi vấn đề của bạn qua hệ thống Ticket.
                            </p>
                        </div>
                        <Button className="w-full rounded-xl h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-sm" data-requires-auth="true">
                            Gửi yêu cầu hỗ trợ ngay
                        </Button>
                    </Card>

                    <div className="rounded-2xl bg-muted/40 p-8 space-y-4 border border-border/50">
                        <h4 className="text-sm font-bold text-muted-foreground px-1">Kênh liên hệ khác</h4>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-bold bg-background hover:bg-muted/50 border-border/50">
                                <div className="size-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                    <MessageCircle className="size-4" />
                                </div>
                                Facebook Messenger
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-bold bg-background hover:bg-muted/50 border-border/50">
                                <div className="size-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center mr-3">
                                    <Zap className="size-4" />
                                </div>
                                Zalo Official
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
