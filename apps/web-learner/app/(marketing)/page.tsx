"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
    ChevronRight,
    CheckCircle2,
    Calendar,
    Star,
    Quote,
    BookOpen,
    Play,
    Zap,
    Users,
    Trophy,
    Video,
    Sparkles,
    ShieldCheck,
    Globe,
    MessageSquare,
    Bot,
    Languages
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
}

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export default function Page() {
    return (
        <div className="min-h-screen font-sans overflow-x-hidden">
            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-4 lg:px-8">
                <div className="flex flex-col items-center text-center space-y-10 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute -top-16 -z-10 opacity-10 hidden lg:block"
                    >
                        <span className="text-[200px] font-serif leading-none select-none text-primary">
                            新しい扉
                        </span>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6 max-w-4xl"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="px-3 py-1 text-[10px] font-black tracking-[0.3em] uppercase bg-primary/10 text-primary border border-primary/20 rounded-full">
                                Premium E-Learning
                            </span>
                        </div>
                        <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[1] text-foreground font-space">
                            Chinh phục tiếng Nhật<br />
                            <span className="text-primary italic">Chạm tới ước mơ</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            Nền tảng học tập thế hệ mới kết hợp giữa lộ trình cá nhân hóa, 
                            AI Sensei thông minh và cộng đồng học tập sôi nổi.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
                    >
                        <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-full shadow-2xl shadow-primary/30 transition-all hover:scale-105 group" asChild>
                            <Link href="/register">
                                Bắt đầu ngay miễn phí
                                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-full backdrop-blur-sm border-border/50 hover:bg-muted/50" asChild>
                            <Link href="/courses">
                                Khám phá lộ trình
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="pt-16 w-full max-w-6xl"
                    >
                        <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] bg-card/30 backdrop-blur-xl p-2">
                             <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10 pointer-events-none" />
                             <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG1lHyVlBZeCLUgxqHg38I0YGvpvFYGrVig35Kko1upPD-vnETZmzyBbBK3A6hCK57I3xnkzaOltJTb18YdOESfkh5E8u-DXu7UNjUK9geKp2TedLxR9s49yKpDR8VOHnNSVdDXRM0ysjKK1-pjZENPHk6BJ8w6hy8vVphcbKTPAbq6dHl3grtu_AOET-Egjo-oq2IlGGuV46679D4T5aqWFQQUbBUaydg23DB162kIhFl02E0QUX6AmznqvrHP2qIIvyvg6KNBpWC" 
                                alt="Platform Preview" 
                                className="w-full aspect-[21/9] object-cover rounded-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                             />
                             <div className="absolute bottom-10 left-10 z-20 hidden md:block animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                                <div className="flex items-center gap-4 bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-border shadow-2xl">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Trophy className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground">Top 1 Emerging Center</p>
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Awarded 2025</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Stats Section - Modern Glass Style */}
            <section className="py-20 container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Users, label: "Học viên", value: "12,000+", color: "text-blue-500" },
                        { icon: Trophy, label: "Tỷ lệ đỗ", value: "95%", color: "text-primary" },
                        { icon: BookOpen, label: "Bài giảng", value: "1,500+", color: "text-green-500" },
                        { icon: Globe, label: "Cộng đồng", value: "50,000+", color: "text-purple-500" },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-md flex flex-col items-center text-center space-y-4 group"
                        >
                            <div className={`p-4 rounded-2xl bg-muted/50 transition-colors group-hover:bg-primary/10 ${stat.color}`}>
                                <stat.icon className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 3. AI Sensei Section (Replacement for Gatekeeping) */}
            <section className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 space-y-8">
                            <motion.div {...fadeIn} className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest uppercase">
                                Công nghệ dẫn đầu
                            </motion.div>
                            <motion.h2 {...fadeIn} className="text-4xl lg:text-6xl font-black tracking-tighter leading-tight font-space text-foreground">
                                Trợ lý <span className="text-primary italic">AI Sensei</span> đắc lực
                            </motion.h2>
                            <motion.p {...fadeIn} className="text-lg text-muted-foreground leading-relaxed font-medium">
                                Luôn bên cạnh bạn 24/7 để giải đáp mọi thắc mắc về ngữ pháp, từ vựng và luyện tập hội thoại 1:1. 
                                AI Sensei hiểu rõ tiến độ của bạn và đưa ra lời khuyên học tập cá nhân hóa nhất.
                            </motion.p>
                            <motion.ul {...fadeIn} className="space-y-4">
                                {[
                                    "Giải đáp thắc mắc ngay lập tức",
                                    "Luyện giao tiếp theo ngữ cảnh thực tế",
                                    "Chấm điểm và sửa lỗi phát âm chuẩn Nhật",
                                    "Tóm tắt kiến thức sau mỗi buổi học"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-foreground/80">{item}</span>
                                    </li>
                                ))}
                            </motion.ul>
                            <motion.div {...fadeIn} className="pt-4">
                                <Button className="rounded-full px-8 h-14 font-black tracking-widest uppercase text-xs shadow-xl shadow-primary/20">
                                    Thử trò chuyện với AI Sensei
                                </Button>
                            </motion.div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            {/* Futuristic AI UI Mockup */}
                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative rounded-[3rem] border border-border/50 bg-card/40 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 rounded-t-full bg-gradient-to-r from-primary via-blue-400 to-purple-500" />
                                
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                                        <Bot className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-foreground">AI Sensei</h4>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active Now</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                                        <p className="text-sm font-medium">Chào bạn! Tôi có thể giúp gì cho việc học cấu trúc 「～ほうがいい」 hôm nay không?</p>
                                    </div>
                                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tr-none max-w-[80%] ml-auto">
                                        <p className="text-sm font-bold text-primary text-right">Sensei ơi, cấu trúc này dùng khi nào ạ?</p>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                                        <p className="text-sm font-medium leading-relaxed">Nó dùng để đưa ra lời khuyên. Ví dụ: 「早く寝たほうがいいですよ」(Bạn nên đi ngủ sớm đi đó).</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="h-12 flex-1 bg-muted/30 border border-border rounded-xl px-4 flex items-center">
                                        <span className="text-muted-foreground text-xs font-medium">Nhập câu hỏi tại đây...</span>
                                    </div>
                                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="absolute -z-10 bg-primary/20 blur-[120px] inset-0 rounded-full scale-125" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Methodology: VOD vs LIVE */}
            <section className="py-32 bg-foreground dark:bg-card/30 relative overflow-hidden">
                <div className="absolute inset-0 nhai-blueprint-bg opacity-10 pointer-events-none" />
                <div className="container mx-auto px-4 lg:px-8 space-y-16 relative z-10">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <motion.h2 {...fadeIn} className="text-4xl lg:text-5xl font-black tracking-tighter font-space text-background dark:text-foreground">Học thế nào cho <span className="text-primary italic">hiệu quả?</span></motion.h2>
                        <motion.p {...fadeIn} className="text-muted/70 font-medium">Bứt phá tiếng Nhật với mô hình Blended Learning độc quyền.</motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        <motion.div whileHover={{ y: -10 }} className="group relative">
                            <div className="absolute inset-0 bg-primary/5 rounded-[2rem] transition-all group-hover:scale-105 group-hover:bg-primary/10" />
                            <div className="relative p-10 lg:p-14 space-y-8 bg-background dark:bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/50 shadow-xl overflow-hidden">
                                <div className="p-4 bg-primary/10 text-primary rounded-2xl w-fit">
                                    <Zap className="size-8" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black tracking-tight">VOD - Học chủ động</h3>
                                    <p className="text-muted-foreground leading-relaxed font-medium">
                                        Thư viện 1000+ bài giảng 4K sắc nét, lồng ghép ví dụ thực tế và giải trí, 
                                        giúp bạn tiếp thu kiến thức một cách tự nhiên nhất.
                                    </p>
                                </div>
                                <ul className="space-y-3">
                                    {["Tài liệu bản cứng gửi tận nhà", "App học tập mượt mà offline", "Luyện nghe/nói cùng AI Sensei"].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/70">
                                            <CheckCircle2 className="size-5 text-primary" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full h-14 rounded-2xl font-black tracking-widest uppercase text-xs" variant="outline" asChild>
                                    <Link href="/courses">Xem bài học mẫu</Link>
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div whileHover={{ y: -10 }} className="group relative">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] transition-all group-hover:scale-105 group-hover:bg-blue-500/10" />
                            <div className="relative p-10 lg:p-14 space-y-8 bg-background dark:bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/50 shadow-xl overflow-hidden">
                                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl w-fit">
                                    <Users className="size-8" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black tracking-tight text-foreground">Live - Tương tác cao</h3>
                                    <p className="text-muted-foreground leading-relaxed font-medium">
                                        Học trực tiếp cùng Sensei qua Google Meet/LiveKit. Sĩ số nhỏ (max 15 người) 
                                        đảm bảo mọi học viên đều được sửa lỗi và thực hành.
                                    </p>
                                </div>
                                <ul className="space-y-3">
                                    {["Sửa phát âm 1:1 trực tiếp", "Thảo luận nhóm breakout rooms", "Cam kết đầu ra bằng hợp đồng"].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/70">
                                            <CheckCircle2 className="size-5 text-blue-500" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full h-14 rounded-2xl font-black tracking-widest uppercase text-xs bg-blue-500 hover:bg-blue-600 border-none shadow-lg shadow-blue-500/30">Đăng ký tư vấn Live</Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 5. Sensei Section - Compact Luxury Grid */}
            <section className="py-24 container mx-auto px-4 lg:px-8">
                <div className="flex flex-col items-center text-center space-y-4 mb-16 max-w-2xl mx-auto">
                    <motion.div {...fadeIn} className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase">
                        Đội ngũ chuyên gia
                    </motion.div>
                    <motion.h2 {...fadeIn} className="text-4xl lg:text-5xl font-black tracking-tighter font-space">Tâm huyết & Tài năng</motion.h2>
                    <motion.p {...fadeIn} className="text-base text-muted-foreground font-medium">
                        Những người đồng hành tâm huyết mang văn hóa Nhật đến gần bạn.
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: "Xuân Sensei", lvl: "N1", tags: ["12+ năm"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60" },
                        { name: "Nhân Sensei", lvl: "N1", tags: ["Exp Japan"], avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60" },
                        { name: "Yuki Sensei", lvl: "Native", tags: ["Giao tiếp"], avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60" },
                        { name: "Tomohiro-san", lvl: "Native", tags: ["Văn hóa"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60" },
                    ].map((s, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative h-[320px] lg:h-[380px] overflow-hidden rounded-3xl border border-border shadow-md hover:shadow-xl transition-all duration-500"
                        >
                            <Image 
                                src={s.avatar} 
                                alt={s.name} 
                                fill 
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            
                            <div className="absolute top-4 right-4 h-8 w-8 border-border/50 border rounded flex items-center justify-center bg-background/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <Star className="size-3 text-primary fill-primary" />
                            </div>

                            <div className="absolute bottom-0 left-0 p-5 w-full space-y-2">
                                <div className="flex gap-1.5 flex-wrap">
                                    <Badge className="bg-primary/90 text-[9px] h-5 rounded-full px-2">{s.lvl}</Badge>
                                    {s.tags.map(t => <Badge key={t} variant="outline" className="backdrop-blur-md bg-white/5 text-[8px] h-5 text-foreground font-black border-border/20 uppercase">{t}</Badge>)}
                                </div>
                                <h4 className="text-xl font-black tracking-tight text-foreground">{s.name}</h4>
                                <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                        Sensei ưu tú
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>


            {/* 6. Testimonials - Minimalist Clean Style */}
            <section className="py-32 container mx-auto px-4 lg:px-8 bg-card/30 backdrop-blur-xl rounded-[4rem] border border-border/50 shadow-inner mb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12">
                    <Sparkles className="size-64 text-primary" />
                </div>
                
                <div className="flex flex-col items-center text-center space-y-16 relative z-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter font-space">Tiếng vang từ <span className="text-primary italic">Thành công</span></h2>
                        <p className="text-muted-foreground font-medium">Lắng nghe chia sẻ từ những người đã chinh phục mục tiêu.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 w-full">
                        {[
                            { name: "Minh Thu", sc: "145/180 N2", q: "Khoá học VOD rất chi tiết, lồng ghép thực tế hay. Lớp feedback chấm bài cực kỳ có tâm!", avt: 30 },
                            { name: "Hải Đăng", sc: "Kỹ sư tại Tokyo", q: "Nhờ Torii mà mình tự tin phỏng vấn. Các Sensei Native sửa lỗi phát âm rất kỹ.", avt: 12 },
                            { name: "Ngọc Linh", sc: "Thủ khoa N3", q: "Lộ trình rõ ràng, hệ thống bài học thông minh giúp mình không bị dồn kiến thức cuối kỳ.", avt: 41 },
                        ].map((h, i) => (
                            <div key={i} className="flex flex-col items-start text-left p-10 space-y-6 bg-background/50 rounded-3xl border border-border transition-all hover:shadow-2xl hover:border-primary/30 group">
                                <div className="flex text-amber-500 gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => <Star fill="currentColor" className="size-4" key={s} />)}
                                </div>
                                <p className="text-lg font-bold leading-relaxed italic text-foreground/80">&quot;{h.q}&quot;</p>
                                <div className="flex items-center gap-4 pt-6 mt-auto">
                                    <Avatar className="size-14 border-2 border-primary/20 p-1 bg-background shadow-lg">
                                        <AvatarImage src={`https://i.pravatar.cc/100?img=${h.avt}`} />
                                    </Avatar>
                                    <div>
                                        <p className="font-black text-foreground">{h.name}</p>
                                        <p className="text-xs font-black text-primary tracking-widest uppercase">{h.sc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8">
                        <Button variant="link" className="font-black tracking-widest uppercase text-xs group">
                            Xem tất cả 1.200 đánh giá <ChevronRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 container mx-auto px-4 lg:px-8 text-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="p-16 lg:p-24 rounded-[3.5rem] bg-foreground text-background relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
                >
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="relative z-10 space-y-10">
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight font-space">
                            Sẵn sàng cho cửa tiếp theo?
                        </h2>
                        <p className="text-lg text-background/70 max-w-2xl mx-auto font-medium">
                            Tham gia cùng 12,000+ học viên và bắt đầu lộ trình được cá nhân hóa ngay hôm nay.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                            <Button size="lg" className="h-16 px-10 text-lg font-black rounded-full bg-background text-foreground hover:bg-background/90 transition-all hover:scale-105" asChild>
                                <Link href="/register">Đăng ký miễn phí</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black rounded-full border-background/20 text-background hover:bg-background/10">
                                Liên hệ tư vấn
                            </Button>
                        </div>
                    </div>
                    {/* Decorative JP text */}
                    <div className="absolute bottom-[-10%] right-[10%] opacity-10 select-none">
                        <span className="text-[150px] font-serif font-black leading-none text-background">
                            鳥居
                        </span>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}