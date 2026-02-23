import { Brain, Video, GraduationCap, BookOpen, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

const mainFeature = {
    icon: Brain,
    badge: 'Công nghệ AI',
    title: 'Trung tâm điều khiển AI Sensei',
    description:
        'Không chỉ là một chatbot, AI Sensei là người đồng hành thông minh phân tích từng bước đi của bạn trong vũ trụ tiếng Nhật. Giải thích ngữ pháp phức tạp, chỉnh sửa phát âm và tối ưu hóa bộ nhớ dựa trên thuật toán SRS tiên tiến.',
    points: ['Phân tích lỗi sai thời gian thực', 'Gợi ý lộ trình theo điểm yếu', 'Tương tác 24/7 không giới hạn'],
}

const secondaryFeatures = [
    {
        icon: Video,
        title: 'Trạm liên lạc WebRTC',
        description: 'Tương tác trực tiếp với giáo viên bản xứ qua hệ thống truyền tin không độ trễ.',
    },
    {
        icon: GraduationCap,
        title: 'Hệ thống định vị JLPT',
        description: 'Tự động xác định tọa độ trình độ và dẫn đường bạn đến mục tiêu N5-N1.',
    },
    {
        icon: BookOpen,
        title: 'Thư viện thiên hà',
        description: '5,000+ tài liệu, video và bài tập được số hóa theo chuẩn giáo trình Nhật Bản.',
    },
    {
        icon: Users,
        title: 'Liên minh học viên',
        description: 'Kết nối với 50,000+ "phi hành gia" khác để cùng nhau trau dồi và chia sẻ.',
    },
    {
        icon: TrendingUp,
        title: 'Radar tiến độ',
        description: 'Theo dõi sự tăng trưởng kiến thức qua biểu đồ radar và dự báo tỉ lệ đỗ JLPT.',
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
                        Hệ sinh thái học tập
                    </Badge>
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                        Công Nghệ{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                            Vượt Giới Hạn.
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
                                    Kết nối với AI Sensei <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right: Visual card (Space Station Dashboard feel) */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-500" />
                        <div className="rounded-[2rem] bg-slate-950 p-8 md:p-10 text-white overflow-hidden relative border border-white/10 shadow-2xl">
                            {/* Stars background */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                            <div className="relative space-y-6 z-10">
                                <div className="flex items-center justify-between">
                                    <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                                        System Online
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="size-2 rounded-full bg-red-500" />
                                        <div className="size-2 rounded-full bg-yellow-500" />
                                        <div className="size-2 rounded-full bg-green-500" />
                                    </div>
                                </div>

                                <div className="size-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-inner">
                                    <MainIcon className="size-8 text-primary" />
                                </div>

                                {/* Mock chat UI - Terminal Style */}
                                <div className="space-y-4 font-mono">
                                    <div className="flex gap-3 items-start">
                                        <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/5 text-[10px] font-bold">USR</div>
                                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-sm max-w-[80%] text-blue-100 shadow-sm leading-relaxed">
                                            Phân biệt giúp tôi 「は」 và 「が」?
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start justify-end">
                                        <div className="bg-primary/20 border border-primary/40 rounded-2xl rounded-tr-none px-4 py-4 text-sm max-w-[85%] space-y-2 text-indigo-50 shadow-lg">
                                            <p className="font-bold text-[10px] text-primary-foreground/70 uppercase tracking-widest">AI Command Terminal</p>
                                            <p className="text-xs leading-relaxed">「は」 thường dùng để nhấn mạnh chủ đề (topic), còn 「が」 dùng để nhấn mạnh chủ thể hành động...</p>
                                            <div className="h-0.5 w-12 bg-primary/50 mt-2" />
                                        </div>
                                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0 border border-primary/40 text-[10px] font-bold shadow-lg">AIR</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] pt-2">
                                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                                    Syncing with Satellite N-302
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
