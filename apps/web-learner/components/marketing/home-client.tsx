'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import {
    PlayCircle, Video, Bot, CheckCircle2, Users, GraduationCap, Star,
    ArrowRight, TrendingUp, ShieldCheck, Globe, Zap, BookOpen,
    MessageSquare, ChevronDown, Award, Clock, Mic, Tag
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@workspace/ui/components/accordion';

// ─── Helpers ────────────────────────────────────────────────────────────────

const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { duration: 1800, bounce: 0 });
    const display = useTransform(spring, (v) => `${Math.round(v).toLocaleString()}${suffix}`);
    React.useEffect(() => { if (inView) animate(motionVal, to, { duration: 1.8 }); }, [inView, motionVal, to]);
    return <motion.span ref={ref}>{display}</motion.span>;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const JLPT_LEVELS = [
    { level: 'N5', title: 'Cơ bản', desc: 'Nền tảng ngữ âm, bảng chữ Hiragana & Katakana.', color: '#3b82f6', courses: 12 },
    { level: 'N4', title: 'Sơ cấp', desc: 'Giao tiếp cơ bản, ~300 từ vựng thông dụng.', color: '#14b8a6', courses: 18 },
    { level: 'N3', title: 'Trung cấp', desc: 'Ngữ pháp thực dụng, đọc hiểu đoạn văn ngắn.', color: '#22c55e', courses: 24 },
    { level: 'N2', title: 'Thượng cấp', desc: 'Tự tin làm việc & sinh sống tại Nhật Bản.', color: '#f59e0b', courses: 20 },
    { level: 'N1', title: 'Chuyên gia', desc: 'Chinh phục đỉnh cao, đọc tài liệu chuyên sâu.', color: '#f43f5e', courses: 16 },
];

const TESTIMONIALS = [
    { name: 'Nguyễn Văn A', level: 'Đỗ N2', content: 'AI Sensei giúp mình cải thiện phản xạ giao tiếp cực nhanh. Không còn sợ nói tiếng Nhật nữa!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A', role: 'Kỹ sư tại Hà Nội' },
    { name: 'Lê Thị B', level: 'Đỗ N3', content: 'Lớp Live Class rất tương tác, Sensei giải đáp tận tình như học trực tiếp tại trung tâm.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B', role: 'Sinh viên ĐH Bách Khoa' },
    { name: 'Trần Văn C', level: 'Đỗ N1', content: 'VOD được sắp xếp khoa học, tự học mọi lúc mọi nơi mà vẫn đảm bảo lộ trình.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C', role: 'Du học sinh tại Tokyo' },
    { name: 'Phạm Thị D', level: 'Đỗ N4', content: 'Học từ con số 0, chỉ sau 6 tháng đã tự giao tiếp được. Cảm ơn Torii rất nhiều!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D', role: 'Nhân viên văn phòng' },
    { name: 'Hoàng Minh E', level: 'Đỗ N2', content: 'Tính năng phân tích phát âm của AI cực kỳ chi tiết, giúp mình sửa lỗi nhanh hơn bao giờ hết.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=E', role: 'Phiên dịch viên tự do' },
];

const FAQS = [
    { q: 'Tôi cần bao lâu để đỗ JLPT N3?', a: 'Trung bình 6–12 tháng nếu học 1–2 giờ/ngày. Với lộ trình cá nhân hóa của AI Sensei, nhiều học viên rút ngắn xuống còn 4–6 tháng.' },
    { q: 'Có học thử miễn phí không?', a: 'Có! Bạn có thể truy cập toàn bộ nội dung N5 miễn phí, bao gồm video bài giảng, bài tập và 3 buổi live class demo.' },
    { q: 'AI Sensei hoạt động như thế nào?', a: 'AI Sensei sử dụng mô hình ngôn ngữ lớn kết hợp nhận diện giọng nói, phân tích ngữ pháp và cá nhân hóa lộ trình dựa trên điểm yếu của bạn.' },
    { q: 'Tôi có thể học offline không?', a: 'Bạn có thể tải video bài giảng để xem offline. Tuy nhiên live class và AI Sensei yêu cầu kết nối internet.' },
    { q: 'Chứng chỉ có được công nhận không?', a: 'Torii Nihongo cấp chứng chỉ hoàn thành khóa học. Để thi JLPT chính thức, bạn cần đăng ký tại Hội đồng thi JLPT.' },
    { q: 'Tôi có thể chuyển gói học không?', a: 'Có thể nâng hoặc hạ cấp gói học bất kỳ lúc nào. Khoản chênh lệch sẽ được tính theo ngày sử dụng thực tế.' },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
    return (
        <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.64_0.13_175/0.15),transparent)] pointer-events-none" />
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <FadeIn>
                            <Badge variant="outline" className="px-4 py-1.5 border-primary/40 text-primary font-bold tracking-widest uppercase text-[10px]">
                                ✦ Nền tảng học tiếng Nhật thế hệ mới
                            </Badge>
                            <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight font-serif">
                                Chinh Phục <br />
                                <span className="text-primary">Tiếng Nhật</span> <br />
                                Với AI Sensei
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Kết hợp VOD chuyên sâu, lớp Live WebRTC và trợ lý AI cá nhân hóa — rút ngắn 50% thời gian chinh phục JLPT.
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.15}>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Button size="lg" className="h-14 px-10 rounded-full text-base font-bold group" asChild>
                                    <Link href="/register">Bắt đầu miễn phí <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" /></Link>
                                </Button>
                                <Button variant="outline" size="lg" className="h-14 px-10 rounded-full text-base font-bold" asChild>
                                    <Link href="/courses">Xem khóa học</Link>
                                </Button>
                            </div>
                            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                {['Học thử miễn phí', 'Cam kết đầu ra', 'Hủy bất kỳ lúc nào'].map((t) => (
                                    <span key={t} className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-4 text-primary" />{t}
                                    </span>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                    <FadeIn delay={0.3}>
                        <div className="relative">
                            <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-2xl">
                                {/* Mock app UI */}
                                <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                        <div className="size-2 rounded-full bg-destructive" />
                                        <div className="size-2 rounded-full bg-amber-400" />
                                        <div className="size-2 rounded-full bg-green-400" />
                                        <span className="ml-2 text-xs text-muted-foreground font-mono">AI Sensei — Luyện hội thoại</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <div className="size-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-[9px] font-bold">YOU</div>
                                            <div className="bg-background border border-border/50 px-3 py-2 rounded-xl rounded-tl-none text-sm">おはようございます！</div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl rounded-tr-none text-sm font-medium">
                                                おはようございます！発音が上手ですね ✨
                                            </div>
                                            <div className="size-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-primary-foreground">AI</div>
                                        </div>
                                    </div>
                                    <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                                        {[['94%', 'Phát âm'], ['88%', 'Ngữ pháp'], ['N3', 'Trình độ']].map(([v, l]) => (
                                            <div key={l} className="bg-background rounded-xl p-2 border border-border/50">
                                                <div className="text-primary text-base font-black">{v}</div>
                                                <div className="text-muted-foreground">{l}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Floating badge */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-4 -right-4 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-2xl px-4 py-3 flex items-center gap-2"
                            >
                                <div className="size-8 bg-primary/15 rounded-full flex items-center justify-center">
                                    <Bot className="size-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase font-black text-primary tracking-wider">AI Sensei Live</p>
                                    <p className="text-xs font-bold">Luyện 24/7</p>
                                </div>
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="absolute -bottom-4 -left-4 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-2xl px-4 py-3 flex items-center gap-2"
                            >
                                <div className="size-8 bg-amber-500/15 rounded-full flex items-center justify-center">
                                    <Award className="size-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase font-black text-amber-500 tracking-wider">Tỉ lệ đỗ JLPT</p>
                                    <p className="text-xs font-bold">98% học viên</p>
                                </div>
                            </motion.div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}

function TrustBarSection() {
    const items = ['10,000+ Học Viên', 'Giảng Viên Bản Ngữ', 'JLPT N1 → N5', 'WebRTC Live Class', 'AI Phát Âm', 'Cam Kết Đầu Ra', '5,000+ Video', 'Cộng Đồng Nihongo'];
    return (
        <div className="border-y border-border/50 bg-muted/30 py-4 overflow-hidden">
            <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="flex gap-12 whitespace-nowrap"
            >
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="text-sm font-bold text-muted-foreground flex items-center gap-3">
                        <span className="size-1.5 rounded-full bg-primary inline-block" />{item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

function StatsSection() {
    const stats = [
        { label: 'Học viên tích cực', value: 10000, suffix: '+', icon: Users },
        { label: 'Tỉ lệ đỗ JLPT', value: 98, suffix: '%', icon: TrendingUp },
        { label: 'Giảng viên bản ngữ', value: 50, suffix: '+', icon: GraduationCap },
        { label: 'Bài học video', value: 5000, suffix: '+', icon: PlayCircle },
    ];
    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div className="text-center space-y-2">
                                <div className="size-12 bg-background rounded-2xl border border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <s.icon className="size-6 text-primary" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black font-serif">
                                    <CountUp to={s.value} suffix={s.suffix} />
                                </h3>
                                <p className="text-muted-foreground text-sm font-medium">{s.label}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProblemSolutionSection() {
    const problems = ['Học mãi không nhớ Kanji & từ vựng', 'Phát âm sai mà không ai sửa', 'Không có lộ trình học rõ ràng'];
    const solutions = ['Flashcard AI cá nhân hóa theo điểm yếu', 'Phân tích giọng nói thời gian thực', 'JLPT roadmap N5→N1 được thiết kế bởi chuyên gia'];
    return (
        <section className="py-24">
            <div className="container mx-auto px-4 max-w-7xl">
                <FadeIn>
                    <div className="text-center mb-16 space-y-3">
                        <h2 className="text-4xl md:text-5xl font-black font-serif">Vì sao học tiếng Nhật <span className="text-primary italic">hay thất bại?</span></h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Và cách Torii Nihongo giải quyết từng vấn đề.</p>
                    </div>
                </FadeIn>
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    <FadeIn delay={0.1}>
                        <div className="h-full bg-destructive/5 border border-destructive/20 rounded-3xl p-8 space-y-6">
                            <h3 className="font-black text-lg flex items-center gap-2 text-destructive"><Zap className="size-5" />Vấn đề thường gặp</h3>
                            {problems.map((p, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="size-6 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-destructive text-xs font-black">✗</span>
                                    </div>
                                    <p className="text-sm leading-relaxed font-medium">{p}</p>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <div className="h-full bg-primary/5 border border-primary/20 rounded-3xl p-8 space-y-6">
                            <h3 className="font-black text-lg flex items-center gap-2 text-primary"><ShieldCheck className="size-5" />Giải pháp Torii</h3>
                            {solutions.map((s, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle2 className="size-3.5 text-primary" />
                                    </div>
                                    <p className="text-sm leading-relaxed font-medium">{s}</p>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    const features = [
        { icon: PlayCircle, title: 'Video Bài Giảng (VOD)', desc: 'Hàng nghìn bài giảng từ N5 đến N1. Giáo trình chuẩn quốc tế, cập nhật liên tục. Học mọi lúc mọi nơi.', href: '/courses', cta: 'Khám phá khoá học', highlight: false },
        { icon: Video, title: 'Lớp Học Trực Tiếp (Live)', desc: 'Tương tác thời gian thực qua WebRTC với giảng viên bản ngữ. Luyện phát âm và giao tiếp thực chiến.', href: '/live-classes', cta: 'Tìm lớp học live', highlight: true },
        { icon: Bot, title: 'Trợ Lý AI Sensei', desc: 'Luyện tập 24/7 với AI cá nhân hóa. Sửa lỗi ngữ pháp, phát âm và xây dựng phản xạ hội thoại.', href: '/ai-sensei', cta: 'Thử AI ngay', highlight: false },
    ];
    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 max-w-7xl">
                <FadeIn>
                    <div className="text-center mb-16 space-y-3">
                        <h2 className="text-4xl md:text-5xl font-black font-serif">Hệ Sinh Thái Học Tập <span className="text-primary italic">Tam Trụ</span></h2>
                        <p className="text-muted-foreground text-lg">Sự kết hợp hoàn hảo giữa công nghệ và phương pháp sư phạm.</p>
                    </div>
                </FadeIn>
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <Card className={`h-full transition-all duration-300 cursor-pointer group ${f.highlight ? 'border-primary/40 shadow-xl shadow-primary/10 bg-primary/[0.02]' : 'border-border/50 hover:border-primary/30 hover:shadow-lg'}`}>
                                <CardContent className="p-8 flex flex-col items-center text-center space-y-5">
                                    <div className={`size-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${f.highlight ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-primary/10'}`}>
                                        <f.icon className={`size-8 ${f.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                                    </div>
                                    <h3 className="text-xl font-bold font-serif">{f.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{f.desc}</p>
                                    <Link href={f.href} className="text-primary font-bold text-sm flex items-center gap-1.5 group/link">
                                        {f.cta} <ArrowRight className="size-3.5 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </CardContent>
                            </Card>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    const steps = [
        { num: '01', icon: BookOpen, title: 'Chọn lộ trình', desc: 'Làm bài test đầu vào, AI xác định trình độ và xây lộ trình học cá nhân hóa cho bạn.' },
        { num: '02', icon: Video, title: 'Học theo kế hoạch', desc: 'Học VOD + tham gia live class theo lịch. AI nhắc nhở và điều chỉnh tiến độ hàng ngày.' },
        { num: '03', icon: Mic, title: 'Luyện tập với AI', desc: 'Chat, đọc, nghe với AI Sensei 24/7. Sửa lỗi tức thì và theo dõi tiến bộ chi tiết.' },
    ];
    return (
        <section className="py-24">
            <div className="container mx-auto px-4 max-w-7xl">
                <FadeIn>
                    <div className="text-center mb-16 space-y-3">
                        <h2 className="text-4xl md:text-5xl font-black font-serif">Bắt đầu chỉ <span className="text-primary italic">3 bước đơn giản</span></h2>
                        <p className="text-muted-foreground text-lg">Từ con số 0 đến bậc thầy tiếng Nhật.</p>
                    </div>
                </FadeIn>
                <div className="relative grid md:grid-cols-3 gap-8">
                    <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px border-t-2 border-dashed border-border/60" />
                    {steps.map((s, i) => (
                        <FadeIn key={i} delay={i * 0.15}>
                            <div className="relative text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                                        <s.icon className="size-9 text-primary" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 size-7 bg-primary text-primary-foreground rounded-full text-xs font-black flex items-center justify-center">{s.num}</span>
                                </div>
                                <h3 className="text-xl font-bold">{s.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function JLPTSection() {
    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <FadeIn>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black font-serif">Lộ trình chinh phục <span className="text-primary">JLPT</span></h2>
                            <p className="text-muted-foreground font-medium">Từ con số 0 đến bậc thầy, đồng hành trên mọi nẻo đường.</p>
                        </div>
                    </FadeIn>
                    <Button variant="ghost" className="font-bold text-primary hover:bg-primary/10 group shrink-0" asChild>
                        <Link href="/courses">Xem toàn bộ <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" /></Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {JLPT_LEVELS.map((j, i) => (
                        <FadeIn key={i} delay={i * 0.08}>
                            <div className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md mb-4 flex-shrink-0" style={{ backgroundColor: j.color }}>
                                    {j.level}
                                </div>
                                <h4 className="font-bold text-base mb-1">{j.title}</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{j.desc}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">{j.courses} khoá học</span>
                                    <Link href={`/courses?level=${j.level}`} className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        Xem <ArrowRight className="size-3" />
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

function AIShowcaseSection() {
    const feats = ['Sửa lỗi phát âm tức thì', 'Phân tích ngữ pháp chuyên sâu', 'Luyện hội thoại 1:1 thực chiến', 'Cá nhân hóa lộ trình học'];
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });
    const pitchMV = useMotionValue(0);
    const pitchSpring = useSpring(pitchMV, { duration: 1500, bounce: 0 });
    const pitchW = useTransform(pitchSpring, (v) => `${v}%`);
    const fluencyMV = useMotionValue(0);
    const fluencySpring = useSpring(fluencyMV, { duration: 1800, bounce: 0 });
    const fluencyW = useTransform(fluencySpring, (v) => `${v}%`);
    React.useEffect(() => { if (inView) { animate(pitchMV, 94, { duration: 1.5 }); animate(fluencyMV, 88, { duration: 1.8 }); } }, [inView, pitchMV, fluencyMV]);
    return (
        <section className="py-24 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="bg-primary/5 border border-primary/15 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 opacity-[0.04] pointer-events-none">
                        <Bot className="size-80 text-primary" />
                    </div>
                    <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                                <Bot className="size-3.5" /> Advanced AI Technology
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black font-serif leading-tight">
                                Gặp gỡ <span className="text-primary italic">AI Sensei</span> — Trợ lý học tập 24/7
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">Không còn chờ đợi hay lo sợ nói sai. AI Sensei sử dụng nhận diện giọng nói và NLP tiên tiến để:</p>
                            <ul className="grid sm:grid-cols-2 gap-3">
                                {feats.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-sm font-bold">
                                        <CheckCircle2 className="size-4 text-primary flex-shrink-0" />{f}
                                    </li>
                                ))}
                            </ul>
                            <Button size="lg" className="rounded-full px-8 h-12 font-black" asChild>
                                <Link href="/ai-sensei">Trải nghiệm ngay</Link>
                            </Button>
                        </div>
                        <div ref={ref} className="space-y-4">
                            <div className="bg-background/90 backdrop-blur-md rounded-2xl p-5 border border-border shadow-xl space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-3">
                                    <MessageSquare className="size-3.5" />Chat với AI Sensei
                                </div>
                                <div className="flex gap-2">
                                    <div className="size-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-[9px] font-black">YOU</div>
                                    <div className="bg-muted px-3 py-2 rounded-xl rounded-tl-none text-sm">Konichiwa Sensei! Hôm nay học gì?</div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl rounded-tr-none text-sm font-medium">
                                        Konnichiwa! Hôm nay luyện <strong>体 bị động</strong> nhé. Bắt đầu thôi!
                                    </div>
                                    <div className="size-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-[9px] font-black text-primary-foreground">AI</div>
                                </div>
                            </div>
                            <div className="bg-background rounded-2xl p-6 border border-border shadow-xl">
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Voice Analysis</h4>
                                    <div className="flex gap-1 items-end">
                                        {[4, 6, 3, 7, 5, 4, 6].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1 bg-primary rounded-full"
                                                animate={{ height: [h * 3, h * 5, h * 3] }}
                                                transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
                                                style={{ height: h * 3 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[['Pitch Accuracy', pitchW, 94], ['Fluency', fluencyW, 88]].map(([label, width, val]) => (
                                        <div key={label as string} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span>{label as string}</span>
                                                <span className="text-primary">{val as number}%</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <motion.div className="h-full bg-primary rounded-full" style={{ width: width as ReturnType<typeof useTransform> }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TestimonialsSection() {
    const [active, setActive] = React.useState(0);
    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 max-w-7xl">
                <FadeIn>
                    <div className="text-center mb-12 space-y-2">
                        <h2 className="text-4xl font-black font-serif">Học Viên Chia Sẻ</h2>
                        <p className="text-muted-foreground">Câu chuyện thành công từ cộng đồng Torii Nihongo.</p>
                    </div>
                </FadeIn>
                <div className="relative overflow-hidden">
                    <motion.div
                        className="flex"
                        animate={{ x: `-${active * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 40 }}
                    >
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="w-full flex-shrink-0 px-4">
                                <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-8 md:p-10 space-y-6">
                                    <div className="flex text-amber-400">{[1, 2, 3, 4, 5].map(i => <Star key={i} className="size-4 fill-current" />)}</div>
                                    <p className="text-foreground text-lg leading-relaxed italic">"{t.content}"</p>
                                    <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                        <img src={t.avatar} alt={t.name} className="size-12 rounded-full bg-muted" />
                                        <div>
                                            <p className="font-bold text-sm">{t.name}</p>
                                            <p className="text-[11px] text-muted-foreground">{t.role}</p>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">{t.level}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-8">
                    {TESTIMONIALS.map((_, i) => (
                        <button key={i} onClick={() => setActive(i)} className={`rounded-full transition-all duration-300 cursor-pointer ${i === active ? 'w-6 h-2 bg-primary' : 'size-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`} />
                    ))}
                </div>
            </div>
        </section>
    );
}

const FEATURED_COURSES = [
    {
        level: 'N5', levelColor: '#3b82f6', title: 'Tiếng Nhật N5 Toàn Diện',
        desc: 'Nền tảng vững chắc từ Hiragana, Katakana đến ngữ pháp cơ bản. Phù hợp cho người mới bắt đầu tuyệt đối.',
        price: '499.000', originalPrice: '799.000', lessons: 48, hours: 24, students: 3200, rating: 4.9,
        badge: 'Bán chạy nhất', href: '/courses/n5-toan-dien',
    },
    {
        level: 'N3', levelColor: '#22c55e', title: 'JLPT N3 — Thực Chiến 90 Ngày',
        desc: 'Lộ trình 90 ngày chinh phục N3 với flashcard AI, luyện đề thực tế và live Q&A hàng tuần.',
        price: '899.000', originalPrice: '1.299.000', lessons: 72, hours: 40, students: 1850, rating: 4.8,
        badge: 'Phổ biến', href: '/courses/n3-thuc-chien',
    },
    {
        level: 'N2', levelColor: '#f59e0b', title: 'Tiếng Nhật Thương Mại N2',
        desc: 'Ngôn ngữ doanh nghiệp, email văn phòng và kỹ năng thuyết trình chuyên nghiệp bằng tiếng Nhật.',
        price: '1.199.000', originalPrice: '1.599.000', lessons: 60, hours: 35, students: 920, rating: 4.9,
        badge: 'Mới nhất', href: '/courses/n2-thuong-mai',
    },
];

function FeaturedCoursesSection() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <FadeIn>
                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-5xl font-black font-serif">Khóa học <span className="text-primary italic">nổi bật</span></h2>
                            <p className="text-muted-foreground text-lg">Mua một lần, học trọn đời. Không phí hàng tháng.</p>
                        </div>
                    </FadeIn>
                    <Button variant="ghost" className="font-bold text-primary hover:bg-primary/10 group shrink-0" asChild>
                        <Link href="/courses">Xem tất cả khóa học <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" /></Link>
                    </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {FEATURED_COURSES.map((c, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <Link href={c.href} className="block group cursor-pointer">
                                <div className="bg-card border border-border/60 rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                    {/* Thumbnail placeholder */}
                                    <div className="relative h-44 flex items-center justify-center" style={{ backgroundColor: `${c.levelColor}18` }}>
                                        <div className="text-center space-y-2">
                                            <div className="size-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg mx-auto" style={{ backgroundColor: c.levelColor }}>
                                                {c.level}
                                            </div>
                                            <p className="text-xs font-bold text-muted-foreground">JLPT {c.level}</p>
                                        </div>
                                        <div className="absolute top-3 left-3">
                                            <Badge className="text-[10px] font-black px-2 py-0.5">{c.badge}</Badge>
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1 space-y-3">
                                        <h3 className="font-black text-base leading-tight group-hover:text-primary transition-colors">{c.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed flex-1">{c.desc}</p>
                                        {/* Meta */}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1"><PlayCircle className="size-3.5" />{c.lessons} bài</span>
                                            <span className="flex items-center gap-1"><Clock className="size-3.5" />{c.hours}h</span>
                                            <span className="flex items-center gap-1"><Users className="size-3.5" />{c.students.toLocaleString()}</span>
                                        </div>
                                        {/* Rating */}
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex text-amber-400">{[1, 2, 3, 4, 5].map(j => <Star key={j} className="size-3 fill-current" />)}</div>
                                            <span className="text-xs font-bold">{c.rating}</span>
                                        </div>
                                        {/* Price */}
                                        <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-black text-primary">{c.price}₫</span>
                                                <span className="text-xs text-muted-foreground line-through">{c.originalPrice}₫</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                                <Tag className="size-3" />
                                                -{Math.round((1 - parseInt(c.price.replace(/\./g, '')) / parseInt(c.originalPrice.replace(/\./g, ''))) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </FadeIn>
                    ))}
                </div>
                <FadeIn delay={0.3}>
                    <div className="mt-10 text-center">
                        <p className="text-muted-foreground text-sm mb-4 flex items-center justify-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            Mua một lần, truy cập trọn đời — hoàn tiền trong 30 ngày nếu không hài lòng
                        </p>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

function FAQSection() {
    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 max-w-3xl">
                <FadeIn>
                    <div className="text-center mb-12 space-y-3">
                        <h2 className="text-4xl font-black font-serif">Câu hỏi <span className="text-primary italic">thường gặp</span></h2>
                        <p className="text-muted-foreground">Không tìm thấy câu trả lời? Liên hệ đội hỗ trợ của chúng tôi.</p>
                    </div>
                </FadeIn>
                <FadeIn delay={0.1}>
                    <Accordion type="single" collapsible className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border/60 rounded-2xl px-5 data-[state=open]:border-primary/30 transition-all">
                                <AccordionTrigger className="font-bold text-sm py-4 hover:no-underline text-left">{faq.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">{faq.a}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </FadeIn>
            </div>
        </section>
    );
}

function FinalCTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,oklch(0.5_0.15_175),transparent)] pointer-events-none" />
            <div className="container mx-auto px-4 max-w-4xl text-center relative z-10 space-y-8">
                <FadeIn>
                    <h2 className="text-4xl md:text-6xl font-black font-serif text-primary-foreground leading-tight">
                        Bắt đầu hành trình <br />chinh phục tiếng Nhật ngay hôm nay
                    </h2>
                    <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mt-4">
                        Tham gia cùng 10,000+ học viên và nhận ưu đãi 20% cho khoá học đầu tiên.
                    </p>
                </FadeIn>
                <FadeIn delay={0.15}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" variant="secondary" className="h-14 px-12 rounded-full font-black text-base" asChild>
                            <Link href="/register">ĐĂNG KÝ NGAY</Link>
                        </Button>
                        <Button size="lg" variant="ghost" className="h-14 px-12 rounded-full font-black text-base text-primary-foreground hover:bg-primary-foreground/10" asChild>
                            <Link href="/courses">TÌM HIỂU THÊM</Link>
                        </Button>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-primary-foreground/70 text-xs font-bold tracking-widest uppercase">
                        {['Học thử miễn phí', 'Cam kết hoàn tiền 30 ngày', 'Hủy bất kỳ lúc nào'].map((t, i) => (
                            <span key={i} className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5" />{t}</span>
                        ))}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

function FooterSection() {
    const links = {
        'Khám phá': [{ label: 'Khóa học', href: '/courses' }, { label: 'Lớp Live', href: '/live-classes' }, { label: 'AI Sensei', href: '/ai-sensei' }, { label: 'Blog', href: '/blog' }],
        'Hỗ trợ': [{ label: 'FAQ', href: '/#faq' }, { label: 'Liên hệ', href: '/contact' }, { label: 'Chính sách', href: '/privacy-policy' }, { label: 'Điều khoản', href: '/terms' }],
    };
    return (
        <footer className="border-t border-border/50 bg-card">
            <div className="container mx-auto px-4 max-w-7xl py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-2 space-y-4">
                        <div>
                            <p className="text-xl font-black tracking-tight">TORII</p>
                            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Nihongo</p>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">Nền tảng học tiếng Nhật thế hệ mới — kết hợp AI, Live class và VOD để đưa bạn đến đỉnh JLPT.</p>
                        <div className="flex gap-3">
                            {['Facebook', 'YouTube', 'TikTok'].map((s) => (
                                <div key={s} className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-pointer">
                                    {s[0]}
                                </div>
                            ))}
                        </div>
                    </div>
                    {Object.entries(links).map(([title, items]) => (
                        <div key={title} className="space-y-4">
                            <h4 className="font-black text-sm uppercase tracking-wider">{title}</h4>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-muted-foreground text-sm hover:text-primary transition-colors">{item.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                    <p>© 2024 Torii Nihongo. Bảo lưu mọi quyền.</p>
                    <div className="flex items-center gap-1.5">
                        <Globe className="size-3.5" />
                        <span>Tiếng Việt</span>
                        <ChevronDown className="size-3.5" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function HomeClient() {
    return (
        <div className="bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
            <main>
                <HeroSection />
                <TrustBarSection />
                <StatsSection />
                <ProblemSolutionSection />
                <FeaturesSection />
                <HowItWorksSection />
                <JLPTSection />
                <AIShowcaseSection />
                <TestimonialsSection />
                <FeaturedCoursesSection />
                <FAQSection />
                <FinalCTASection />
            </main>
            <FooterSection />
        </div>
    );
}
