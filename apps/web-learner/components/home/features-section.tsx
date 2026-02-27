import { Brain, Video, GraduationCap, BookOpen, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

const mainFeature = {
    icon: Brain,
    badge: 'Công nghệ AI',
    title: 'Trợ lý ảo AI Sensei',
    description:
        'Không chỉ là chatbot, AI Sensei là trợ lý học tập thông minh phân tích tiến độ học của bạn. Giải thích ngữ pháp phức tạp, chỉnh sửa phát âm và tối ưu hóa bộ nhớ dựa trên thuật toán SRS tiên tiến.',
    points: ['Phân tích lỗi sai thời gian thực', 'Gợi ý lộ trình theo điểm yếu', 'Hỗ trợ 24/7 không giới hạn'],
}

const secondaryFeatures = [
    {
        icon: Video,
        title: 'Lớp học trực tuyến',
        description: 'Tương tác trực tiếp với giáo viên bản xứ qua hệ thống video chất lượng cao.',
    },
    {
        icon: GraduationCap,
        title: 'Kiểm tra định cấp JLPT',
        description: 'Tự động xác định trình độ hiện tại và hướng dẫn bạn đến mục tiêu N5-N1.',
    },
    {
        icon: BookOpen,
        title: 'Thư viện tài liệu',
        description: '5,000+ tài liệu, video và bài tập được số hóa theo chuẩn giáo trình Nhật Bản.',
    },
    {
        icon: Users,
        title: 'Cộng đồng học viên',
        description: 'Kết nối với 50,000+ học viên khác để cùng nhau học tập và chia sẻ.',
    },
    {
        icon: TrendingUp,
        title: 'Theo dõi tiến độ',
        description: 'Theo dõi sự tăng trưởng kiến thức qua biểu đồ và dự báo tỉ lệ đỗ JLPT.',
    },
]

export function FeaturesSection() {
    const MainIcon = mainFeature.icon
    return (
        <section className="py-24 lg:py-32 bg-background relative">
            {/* Background decorative dots */}
            <div className="absolute top-1/4 left-10 size-2 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute top-3/4 right-20 size-1 bg-primary/30 rounded-full animate-ping" />

            <div className="container max-w-6xl mx-auto px-4 md:px-6">
                {/* Section header */}
                <div className="text-center max-w-xl mx-auto mb-20 space-y-3">
                    <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
                        <Sparkles className="size-3.5 mr-1.5 text-primary" />
                        Tính năng nổi bật
                    </Badge>
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                        Công Nghệ{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                            Học Tập Hiện Đại.
                        </span>
                    </h2>
                </div>

                {/* Main feature — split layout */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    {/* Left: Text */}
                    <div className="space-y-6">
                        <Badge className="rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-none">
                            {mainFeature.badge}
                        </Badge>
                        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                            {mainFeature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-base">
                            {mainFeature.description}
                        </p>
                        <ul className="space-y-4">
                            {mainFeature.points.map((p, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm group">
                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary transition-colors">
                                        <div className="size-1.5 rounded-full bg-primary group-hover:bg-primary-foreground" />
                                    </div>
                                    <span className="text-foreground font-semibold uppercase text-[11px] tracking-wide">{p}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-2">
                            <Button asChild className="rounded-xl h-12 px-6 group">
                                <Link href="/register">
                                    Trải nghiệm AI Sensei <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right: Chat UI Preview */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition duration-500" />
                        
                        {/* Main Chat Container */}
                        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                            {/* Chat Header */}
                            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
                                            <MainIcon className="size-5 text-white" />
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">AI Sensei</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Đang hoạt động
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="size-2 rounded-full bg-red-500/60" />
                                    <div className="size-2 rounded-full bg-yellow-500/60" />
                                    <div className="size-2 rounded-full bg-green-500/60" />
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="p-5 space-y-4 bg-slate-50 dark:bg-slate-950 min-h-[320px]">
                                {/* User Message */}
                                <div className="flex gap-3 items-end justify-end">
                                    <div className="max-w-[75%] space-y-1">
                                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                                            <p className="text-sm leading-relaxed">
                                                Phân biệt giúp tôi 「は」 và 「が」?
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground text-right">10:23 AM</p>
                                    </div>
                                    <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-md">
                                        BẠN
                                    </div>
                                </div>

                                {/* AI Response */}
                                <div className="flex gap-3 items-end">
                                    <div className="size-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 shadow-md">
                                        <MainIcon className="size-4 text-white" />
                                    </div>
                                    <div className="max-w-[80%] space-y-1">
                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                            <p className="text-xs font-semibold text-primary mb-1">AI Sensei</p>
                                            <p className="text-sm text-foreground leading-relaxed">
                                                「は」 thường dùng để nhấn mạnh <strong>chủ đề</strong> (topic), còn 「が」 dùng để nhấn mạnh <strong>chủ thể hành động</strong>.
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-muted-foreground">Ví dụ:</p>
                                                <p className="text-xs text-foreground mt-1">私<span className="text-primary font-semibold">は</span>学生です。(Tôi là sinh viên)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-muted-foreground">10:23 AM</p>
                                            <div className="flex gap-0.5">
                                                <div className="size-1 rounded-full bg-primary" />
                                                <div className="size-1 rounded-full bg-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Typing Indicator */}
                                <div className="flex gap-3 items-end">
                                    <div className="size-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 shadow-md opacity-60">
                                        <MainIcon className="size-4 text-white" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-5 py-3 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <div className="size-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="size-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="size-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="px-5 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                    <div className="size-5 rounded-full bg-muted flex items-center justify-center">
                                        <Sparkles className="size-3 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground flex-1">Hỏi AI Sensei...</p>
                                    <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <ArrowRight className="size-3 text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary features strip */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {secondaryFeatures.map((f, i) => {
                        const Icon = f.icon
                        return (
                            <div
                                key={i}
                                className="group rounded-2xl border bg-muted/30 p-6 hover:bg-background hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default space-y-4"
                            >
                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-12 transition-all duration-300">
                                    <Icon className="size-5" />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="font-bold text-[13px] tracking-tight group-hover:text-primary transition-colors duration-200 uppercase">
                                        {f.title}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{f.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
