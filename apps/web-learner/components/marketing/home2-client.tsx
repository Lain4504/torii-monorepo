'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    Cpu,
    Video,
    Users,
    Zap,
    MessageSquare,
    BookOpen,
    Target,
    Award,
    ChevronRight,
    Sparkles,
    Mic,
    PenTool,
    GraduationCap,
    PlayCircle,
    Calendar,
    Clock,
    Globe,
    ShieldCheck,
    TrendingUp,
    Store
} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@workspace/ui/components/accordion';
import { Separator } from '@workspace/ui/components/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';

// --- Layout Utilities ---

const FadeIn = ({ children, delay = 0, y = 20 }: { children: React.ReactNode; delay?: number; y?: number }) => (
    <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

const Section = ({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) => (
    <section id={id} className={`py-24 px-6 md:px-12 ${className}`}>
        <div className="max-w-[1200px] mx-auto">
            {children}
        </div>
    </section>
);

const SectionHeading = ({ badge, title, subtitle, centered = true }: { badge: string; title: string | React.ReactNode; subtitle?: string; centered?: boolean }) => (
    <div className={`mb-16 space-y-4 ${centered ? 'text-center max-w-3xl mx-auto' : 'text-left'}`}>
        <FadeIn>
            <Badge variant="outline" className="px-4 py-1.5 border-red-100 bg-red-50 text-red-600 font-bold tracking-widest uppercase text-[10px] rounded-full">
                {badge}
            </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
                {title}
            </h2>
        </FadeIn>
        {subtitle && (
            <FadeIn delay={0.2}>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed italic">
                    {subtitle}
                </p>
            </FadeIn>
        )}
    </div>
);

// --- Sections ---

/**
 * 1. Hero Section: Paid positioning focus
 * UI: Left-aligned content with a "Value Stack" graphic on the right.
 */
function HeroSection() {
    return (
        <Section className="relative pt-32 pb-20 overflow-hidden bg-background">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-10">
                    <FadeIn delay={0.1}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck className="size-3 text-primary" /> Hệ sinh thái học tập chuyên sâu
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <h1 className="text-5xl md:text-7xl font-black text-foreground leading-[0.95] tracking-tighter">
                            Chinh phục JLPT <br />
                            Chuẩn Nhật với <br />
                            <span className="text-primary italic">AI Sensei.</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-bold">
                            Không phải App học miễn phí. Đây là lộ trình đào tạo bài bản giúp bạn đạt chứng chỉ N5-N1 nhanh gấp 2 lần bằng công nghệ AI trợ lý riêng.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.4}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-black bg-primary hover:bg-red-700 transition-all shadow-xl shadow-red-200 group" asChild>
                                <Link href="#courses">
                                    Mua khóa học ngay
                                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button variant="ghost" size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold text-foreground hover:bg-muted border border-border" asChild>
                                <Link href="#roadmap">Xem lộ trình N5 - N1</Link>
                            </Button>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.5}>
                        <div className="flex items-center gap-8 pt-4">
                            <div className="space-y-1">
                                <div className="text-2xl font-black text-foreground tracking-tighter">12k+</div>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Học viên</div>
                            </div>
                            <Separator orientation="vertical" className="h-10 bg-muted" />
                            <div className="space-y-1">
                                <div className="text-2xl font-black text-foreground tracking-tighter">98%</div>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Đỗ JLPT</div>
                            </div>
                            <Separator orientation="vertical" className="h-10 bg-muted" />
                            <div className="space-y-1">
                                <div className="text-2xl font-black text-foreground tracking-tighter">24/7</div>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">AI Support</div>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                <FadeIn delay={0.6} y={0}>
                    <div className="relative">
                        <div className="absolute -inset-10 bg-red-50/50 rounded-full blur-[100px] -z-10 animate-pulse" />
                        <Card className="border-none shadow-2xl shadow-primary/5 rounded-[3rem] overflow-hidden bg-background/80 backdrop-blur-sm border border-border/50">
                            <img src="/home2/hero.png" alt="Torii Premium Platform" className="w-full h-auto saturate-[0.9] hover:saturate-100 transition-all duration-700" />
                        </Card>

                        {/* Interactive floating element */}
                        <div className="absolute -bottom-6 -left-6 bg-background shadow-2xl rounded-2xl p-5 border border-border/50 max-w-[200px] animate-bounce duration-[4000ms]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                    <TrendingUp className="size-4" />
                                </div>
                                <span className="text-xs font-black uppercase text-muted-foreground">Kết quả</span>
                            </div>
                            <p className="text-sm font-bold text-card-foreground leading-tight">Tiến độ vượt 140% so với lộ trình cũ.</p>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </Section>
    );
}

/**
 * 2. Why Choose Us: Value stacking
 */
function BenefitsSection() {
    const benefits = [
        {
            icon: BookOpen,
            title: "Tài liệu bản quyền",
            desc: "Giáo trình được biên soạn riêng theo phương pháp Active Recall giúp nhớ lâu gấp 3 lần."
        },
        {
            icon: Users,
            title: "Tương tác Live thực tế",
            desc: "Không chỉ là xem video. Bạn được tương tác trực tiếp với giáo viên qua lớp Live WebRTC."
        },
        {
            icon: Cpu,
            title: "Gia sư AI cá nhân",
            desc: "Tính năng cao cấp giúp giải đáp mọi thắc mắc ngay lập tức, sửa bài Sakubun 1-1."
        }
    ];

    return (
        <Section className="bg-muted/50 border-y border-border">
            <div className="grid md:grid-cols-3 gap-12">
                {benefits.map((b, i) => (
                    <FadeIn key={i} delay={i * 0.1}>
                        <div className="space-y-6 group">
                            <div className="size-14 rounded-2xl bg-background shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <b.icon className="size-7" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{b.title}</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">{b.desc}</p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </Section>
    );
}

/**
 * 3. AI Sensei: Private tutor for paid students
 * Conversion: Positioning as an "unlocked" premium feature.
 */
function AISenseiSection() {
    return (
        <Section className="overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1 relative">
                    <FadeIn delay={0.2} y={0}>
                        <div className="bg-[#111827] rounded-[3rem] p-8 md:p-12 shadow-2xl relative">
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10">
                                <Avatar className="size-14 border-2 border-primary">
                                    <AvatarImage src="/home2/ai-sensei.png" />
                                    <AvatarFallback><Cpu className="text-white" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-white text-lg">AI Sensei v3.0</h4>
                                    <Badge className="bg-green-500/10 text-green-400 border-none font-black text-[10px] tracking-widest uppercase py-0.5">Premium Unlocked</Badge>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-background/5 p-5 rounded-2xl rounded-tl-none max-w-[85%] text-muted-foreground/70 font-medium text-sm leading-relaxed">
                                    Chào Minh! Qua bài kiểm tra N3 hôm qua, tôi thấy bạn đang yếu phần Kính ngữ (Keigo). Chúng ta tập trung phần đó nhé?
                                </div>
                                <div className="bg-primary/90 p-5 rounded-2xl rounded-tr-none max-w-[85%] ml-auto text-white font-bold text-sm shadow-xl shadow-red-900/20">
                                    Vâng ạ, Sensei giải thích lại giúp mình cách dùng ~させていただきます được không?
                                </div>
                                <Separator className="bg-background/5" />
                                <div className="bg-background/5 p-6 rounded-2xl rounded-tl-none border border-white/10">
                                    <div className="flex items-center gap-2 mb-3 text-primary font-black uppercase text-[10px] tracking-widest">
                                        <Sparkles className="size-3" /> Chế độ đào tạo cá nhân
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                                        "Tiến độ của bạn đang nhanh hơn 15% so với mục tiêu đỗ N3 vào tháng 7."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                <div className="order-1 lg:order-2 space-y-8">
                    <SectionHeading
                        centered={false}
                        badge="Private AI Tutor"
                        title={<>AI Sensei: Chỉ dành riêng cho học viên Torii.</>}
                        subtitle="Không phải chatbot thông thường. Đây là gia sư AI được huấn luyện trên kho dữ liệu JLPT khổng lồ, hiểu rõ năng lực của từng học viên."
                    />

                    <div className="grid gap-6">
                        {[
                            { icon: MessageSquare, t: "Hỏi đáp 24/7", d: "Giải thích mọi cấu trúc ngữ pháp bất cứ lúc nào." },
                            { icon: PenTool, t: "Chấm chữa bài viết", d: "Sửa lỗi Sakubun, email công sở chính xác như người Nhật." },
                            { icon: Mic, t: "Luyện hội thoại 1-1", d: "Phản xạ giao tiếp không giới hạn mà không bị phán xét." }
                        ].map((f, i) => (
                            <FadeIn key={i} delay={0.3 + i * 0.1}>
                                <div className="flex gap-4 group cursor-pointer">
                                    <div className="size-6 rounded-full bg-red-50 text-primary flex-shrink-0 flex items-center justify-center mt-1 group-hover:scale-125 transition-transform">
                                        <Check className="size-3.5 stroke-[4]" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-foreground leading-tight mb-1">{f.t}</div>
                                        <div className="text-sm text-muted-foreground font-medium">{f.d}</div>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>

                    <FadeIn delay={0.6}>
                        <Button size="lg" className="h-14 px-8 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white w-full sm:w-auto mt-4 transition-all hover:scale-105 active:scale-95" asChild>
                            <Link href="#pricing">Unlock AI Sensei ngay</Link>
                        </Button>
                    </FadeIn>
                </div>
            </div>
        </Section>
    );
}

/**
 * 4. Learning Formats: VOD + Live
 */
function LearningFormats() {
    return (
        <Section className="bg-muted border-y border-border/60">
            <SectionHeading
                badge="Hệ sinh thái đào tạo"
                title="Học chủ động. Tương tác thật."
                subtitle="Sự kết hợp hoàn hảo giữa bài giảng VOD và lớp Live trực tuyến giúp x2 hiệu quả tiếp thu."
            />

            <Tabs defaultValue="vod" className="w-full">
                <FadeIn delay={0.2}>
                    <TabsList className="grid w-fit mx-auto grid-cols-2 h-14 p-1 bg-muted/80/50 rounded-2xl mb-16 shadow-inner">
                        <TabsTrigger value="vod" className="rounded-xl px-12 font-black text-[13px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-95 transition-all">
                            VOD Courses
                        </TabsTrigger>
                        <TabsTrigger value="live" className="rounded-xl px-12 font-black text-[13px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-lg active:scale-95 transition-all">
                            Live Classes
                        </TabsTrigger>
                    </TabsList>
                </FadeIn>

                <TabsContent value="vod">
                    <FadeIn y={10} delay={0.1}>
                        <div className="grid lg:grid-cols-2 gap-12 bg-background p-12 rounded-[3.5rem] shadow-xl shadow-primary/10/50 border border-border">
                            <div className="space-y-8">
                                <h3 className="text-3xl font-black text-foreground tracking-tight">Thư viện bài giảng HD 4K</h3>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed italic">
                                    "Học mọi lúc mọi nơi. Không giới hạn thời gian truy cập. Tài liệu PDF bản quyền đính kèm từng bài học."
                                </p>
                                <ul className="space-y-5">
                                    {[
                                        "Lộ trình tinh gọn từ N5 đến N1",
                                        "Hơn 1000+ video bài giảng chi tiết",
                                        "Hệ thống bài tập củng cố sau mỗi video"
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-4">
                                            <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                <PlayCircle className="size-3.5 fill-primary text-white" />
                                            </div>
                                            <span className="font-black text-foreground text-sm italic">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="rounded-2xl h-14 px-8 font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 uppercase tracking-widest text-[11px]"
                                    asChild
                                >
                                    <Link href="/courses?format=vod">Khám phá khóa học VOD</Link>
                                </Button>
                            </div>
                            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-primary shadow-2xl group border-4 border-border/50">
                                <img src="/hero-illustration.png" className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-1000" alt="VOD" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-20 rounded-full bg-background/20 backdrop-blur-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-500 cursor-pointer">
                                        <PlayCircle className="size-10 text-white fill-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </TabsContent>

                <TabsContent value="live">
                    <FadeIn y={10} delay={0.1}>
                        <div className="grid lg:grid-cols-2 gap-12 bg-background p-12 rounded-[3.5rem] shadow-xl shadow-primary/10/50 border border-border">
                            <div className="relative aspect-square lg:aspect-video rounded-[2rem] overflow-hidden bg-muted border-4 border-border/50">
                                <div className="grid grid-cols-3 gap-3 p-4 h-full">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-muted/80 rounded-2xl overflow-hidden relative group cursor-pointer">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 140}`} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500" alt="Student" />
                                            <div className="absolute bottom-2 right-2 size-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-6 left-6 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-2 shadow-xl shadow-red-200 animate-pulse">
                                    <div className="size-1.5 bg-background rounded-full animate-ping" /> REC • LIVE FROM TOKYO
                                </div>
                            </div>
                            <div className="space-y-8">
                                <h3 className="text-3xl font-black text-foreground tracking-tight">Tương tác thực tế 1-1</h3>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed italic">
                                    "Học trực tuyến qua WebRTC không độ trễ. Sửa lỗi phát âm và luyện Kaiwa trực tiếp với giáo viên bản ngữ."
                                </p>
                                <ul className="space-y-5">
                                    {[
                                        "Sĩ số giới hạn: Tối đa 12 học viên/lớp",
                                        "Lịch khai giảng linh hoạt hàng tháng",
                                        "Hỗ trợ giải đáp trực tiếp ngay trong buổi học"
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-4">
                                            <div className="size-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                                <Globe className="size-3.5" />
                                            </div>
                                            <span className="font-black text-foreground text-sm italic">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="rounded-2xl h-14 px-8 font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 uppercase tracking-widest text-[11px]"
                                    asChild
                                >
                                    <Link href="/live-classes">Xem lịch khai giảng</Link>
                                </Button>
                            </div>
                        </div>
                    </FadeIn>
                </TabsContent>
            </Tabs>
        </Section>
    );
}

/**
 * 5. Featured Courses: Course Master + Course Run awareness
 */
function FeaturedCoursesSection() {
    const featured = [
        {
            level: "N5",
            title: "N5 Foundation – Nhập môn tiếng Nhật",
            format: "VOD + Live",
            highlight: "Phù hợp cho người mới bắt đầu, làm quen Hiragana/Katakana và mẫu câu giao tiếp cơ bản.",
            runs: "2 lớp đang tuyển sinh"
        },
        {
            level: "N3",
            title: "N3 Accelerator – Sẵn sàng đi làm",
            format: "Live Cohort",
            highlight: "Tập trung luyện đọc – nghe – ngữ pháp cho mục tiêu thi JLPT và đi làm công ty Nhật.",
            runs: "1 lớp khai giảng trong tháng này"
        },
        {
            level: "Business",
            title: "Business Nihongo – Giao tiếp công sở",
            format: "VOD chuyên đề",
            highlight: "Thực hành email, meeting, kính ngữ (Keigo) trong môi trường doanh nghiệp Nhật.",
            runs: "Mở học ngay (VOD Run)"
        }
    ];

    return (
        <Section id="courses" className="bg-muted/30">
            <SectionHeading
                badge="Khóa học tiêu biểu"
                title="Chọn khóa học, đăng ký đúng lớp khai giảng."
                subtitle="Giới thiệu theo khung chương trình (Course Master), nhưng để học bạn sẽ tham gia vào từng đợt khai giảng cụ thể (Course Run)."
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {featured.map((course, index) => (
                    <FadeIn key={course.title} delay={index * 0.1}>
                        <Card className="h-full border border-primary/10 bg-background/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="font-bold text-[10px] tracking-widest uppercase">
                                        Level {course.level}
                                    </Badge>
                                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-widest uppercase">
                                        {course.format}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg md:text-xl font-black tracking-tight">{course.title}</CardTitle>
                                <CardDescription className="mt-2 text-xs md:text-sm leading-relaxed">{course.highlight}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="size-3.5" />
                                        <span>{course.runs}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Store className="size-3.5" />
                                        <span>Thanh toán theo từng lớp</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full font-bold text-xs md:text-sm" asChild>
                                    <Link href="/courses">
                                        Xem chi tiết & lịch khai giảng
                                        <ChevronRight className="ml-1 size-3.5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </FadeIn>
                ))}
            </div>
        </Section>
    );
}

/**
 * 6. JLPT Roadmap: N5 -> N1
 */
function JLPTRoadmap() {
    const levels = [
        { lv: "N5", price: "299k", t: "Làm quen", d: "Bảng chữ cái & giao tiếp cơ bản nhất cho người mới." },
        { lv: "N4", price: "499k", t: "Sơ cấp", d: "Giao tiếp sinh hoạt hàng ngày & công việc đơn giản." },
        { lv: "N3", price: "899k", t: "Sẵn sàng", d: "Bắt đầu làm việc trong môi trường Nhật ngữ chuyên nghiệp." },
        { lv: "N2", price: "1.2tr", t: "Thành thạo", d: "Năng lực tiếng Nhật học thuật và kinh doanh chuyên sâu." },
        { lv: "N1", price: "1.5tr", t: "Chuyên gia", d: "Trình độ cao nhất, tương đương người bản ngữ." }
    ];

    return (
        <Section id="roadmap">
            <SectionHeading
                badge="Lộ trình học tập"
                title="Làm chủ tiếng Nhật từ con số 0."
                subtitle="Chúng tôi thiết kế từng cấp độ để đảm bảo bạn không chỉ thi đỗ mà còn sử dụng được tiếng Nhật thực tế."
            />

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {levels.map((l, i) => (
                    <FadeIn key={i} delay={i * 0.1}>
                        <Card className="h-full border-border hover:border-primary/50 transition-all duration-500 rounded-3xl overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-red-50 hover:-translate-y-2">
                            <CardContent className="p-8 pt-10 text-center space-y-4">
                                <div className="text-4xl font-black text-muted-foreground/50 group-hover:text-primary transition-colors duration-500">{l.lv}</div>
                                <h4 className="font-black text-foreground tracking-tight">{l.t}</h4>
                                <Separator className="bg-muted w-1/2 mx-auto" />
                                <p className="text-[11px] text-muted-foreground font-black leading-relaxed">{l.d}</p>
                                <div className="pt-2">
                                    <span className="text-xs font-black text-muted-foreground/70 uppercase tracking-widest">Từ</span>
                                    <div className="text-xl font-black text-foreground tracking-tighter">{l.price}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>
                ))}
            </div>
        </Section>
    );
}


/**
 * 7. FAQ: Giải đáp nhanh thắc mắc chính
 */
function FAQSection() {
    return (
        <Section className="bg-background">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
                <div>
                    <SectionHeading
                        centered={false}
                        badge="Câu hỏi thường gặp"
                        title="Trước khi đăng ký khóa học, bạn cần biết."
                        subtitle="Chúng tôi thiết kế flow đăng ký đơn giản: chọn khóa học → chọn lớp (Course Run) phù hợp → thanh toán an toàn."
                    />
                </div>
                <div>
                    <Accordion type="single" collapsible className="space-y-3">
                        <AccordionItem value="need-basic-japanese">
                            <AccordionTrigger className="text-sm md:text-base font-semibold">
                                Tôi chưa biết tiếng Nhật có học được không?
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                Được. Bạn có thể bắt đầu từ khóa N5 Foundation dành cho người mới hoàn toàn. Sau khi làm bài Placement Test, hệ
                                thống sẽ gợi ý đúng khóa Master và lớp Run phù hợp nhất.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="vod-vs-live">
                            <AccordionTrigger className="text-sm md:text-base font-semibold">
                                Khác nhau giữa khóa VOD và lớp Live là gì?
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                VOD giúp bạn học linh hoạt mọi lúc, còn lớp Live (Course Run dạng cohort) cho phép bạn tương tác trực tiếp với
                                giảng viên và bạn học. Nhiều chương trình của Torii kết hợp cả hai để tối đa hiệu quả.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="schedule-change">
                            <AccordionTrigger className="text-sm md:text-base font-semibold">
                                Nếu tôi bận không theo được lịch học Live thì sao?
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                Mỗi Course Run đều có chính sách hoãn/bảo lưu rõ ràng. Bạn có thể chuyển sang Run sau (nếu còn chỗ) hoặc được
                                hỗ trợ xem lại VOD, tùy chính sách cụ thể của lớp.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="refund-policy">
                            <AccordionTrigger className="text-sm md:text-base font-semibold">
                                Chính sách hoàn tiền & bảo lưu khóa học thế nào?
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                Tùy vào thời điểm so với ngày bắt đầu Course Run, bạn có thể được hoàn tiền toàn phần, một phần hoặc bảo lưu
                                sang đợt khác. Thông tin chi tiết sẽ hiển thị rõ trong quá trình checkout trước khi thanh toán.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </Section>
    );
}

/**
 * 8. Final CTA: Urgency
 */
function FinalCTA() {
    return (
        <Section className="py-16">
            <Card className="bg-primary/5 border-primary/20 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[size:16px_16px]" />
                <CardContent className="p-10 md:p-16 text-center space-y-8 relative z-10 w-full">
                    <FadeIn>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-[0.95] max-w-3xl mx-auto">
                            Đừng để tiếng Nhật <br />
                            <span className="text-primary italic">là rào cản của bạn.</span>
                        </h2>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <p className="text-lg text-muted-foreground font-bold max-w-xl mx-auto pt-2">
                            Gia nhập cộng đồng 12,000+ học viên đã thay đổi sự nghiệp nhờ tiếng Nhật tại Torii.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button
                                size="lg"
                                className="h-14 px-8 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-110 active:scale-95"
                                asChild
                            >
                                <Link href="/courses">Đăng ký khóa học phù hợp</Link>
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl text-lg font-black hover:bg-muted border-border" asChild>
                                <Link href="/support">Tư vấn lộ trình</Link>
                            </Button>
                        </div>
                    </FadeIn>
                </CardContent>
            </Card>

        </Section>
    );
}

export default function Home2Client() {
    return (
        <main className="min-h-screen bg-background selection:bg-red-100 selection:text-primary">
            <HeroSection />
            <BenefitsSection />
            <AISenseiSection />
            <LearningFormats />
            <FeaturedCoursesSection />
            <JLPTRoadmap />
            <FAQSection />
            <FinalCTA />
        </main>
    );
}
