"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
    ChevronRight,
    CheckCircle2,
    Star,
    BookOpen,
    Zap,
    Users,
    Trophy,
    Globe,
    MessageSquare,
    Bot,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const fadeIn = {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
}

export default function Page() {
    return (
        <div className="min-h-screen font-sans">
            {/* 1. Hero Section */}
            <section className="relative pt-24 pb-16 lg:pt-40 lg:pb-24 container mx-auto px-4 lg:px-8">
                <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6 max-w-4xl"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md border-primary/20">
                                Nền tảng học tập cao cấp
                            </Badge>
                        </div>
                        <h1 className="text-4xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground font-heading">
                            Chinh phục tiếng Nhật<br />
                            <span className="text-primary">Chạm tới ước mơ</span>
                        </h1>
                        <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Nền tảng học tập thế hệ mới kết hợp giữa lộ trình cá nhân hóa, 
                            AI Sensei thông minh và cùng bạn đồng hành mỗi ngày.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
                    >
                        <Button size="lg" className="h-14 px-8 text-base font-bold rounded-lg shadow-lg shadow-primary/20 group" asChild>
                            <Link href="/register">
                                Bắt đầu miễn phí
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-lg border-border" asChild>
                            <Link href="/courses">
                                Khám phá lộ trình
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="pt-12 w-full max-w-5xl"
                    >
                        <div className="relative rounded-xl overflow-hidden border border-border bg-card shadow-xl p-1">
                             <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG1lHyVlBZeCLUgxqHg38I0YGvpvFYGrVig35Kko1upPD-vnETZmzyBbBK3A6hCK57I3xnkzaOltJTb18YdOESfkh5E8u-DXu7UNjUK9geKp2TedLxR9s49yKpDR8VOHnNSVdDXRM0ysjKK1-pjZENPHk6BJ8w6hy8vVphcbKTPAbq6dHl3grtu_AOET-Egjo-oq2IlGGuV46679D4T5aqWFQQUbBUaydg23DB162kIhFl02E0QUX6AmznqvrHP2qIIvyvg6KNBpWC" 
                                alt="Platform Preview" 
                                className="w-full aspect-video object-cover rounded-lg"
                             />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Stats Section */}
            <section className="py-16 container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Users, label: "Học viên", value: "12,000+", color: "text-blue-500" },
                        { icon: Trophy, label: "Tỷ lệ đỗ", value: "95%", color: "text-primary" },
                        { icon: BookOpen, label: "Bài giảng", value: "1,500+", color: "text-green-500" },
                        { icon: Globe, label: "Cộng đồng", value: "50,000+", color: "text-purple-500" },
                    ].map((stat, i) => (
                        <div 
                            key={i}
                            className="p-6 rounded-xl border border-border bg-card flex flex-col items-center text-center space-y-3"
                        >
                            <div className={`p-3 rounded-lg bg-muted/50 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. AI Sensei Section */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-6">
                            <Badge variant="outline" className="px-3 py-1 rounded-md text-primary font-bold uppercase tracking-wider">
                                Công nghệ AI
                            </Badge>
                            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground font-heading">
                                Trợ lý <span className="text-primary italic">AI Sensei</span> đắc lực
                            </h2>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Luôn bên cạnh bạn 24/7 để giải đáp mọi thắc mắc về ngữ pháp, từ vựng và luyện tập hội thoại. 
                                AI Sensei hiểu rõ tiến độ của bạn và đưa ra lời khuyên học tập cá nhân hóa nhất.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Giải đáp thắc mắc ngay lập tức",
                                    "Luyện giao tiếp theo ngữ cảnh thực tế",
                                    "Chấm điểm và sửa lỗi phát âm chuẩn Nhật",
                                    "Tóm tắt kiến thức sau mỗi buổi học"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-foreground/80">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-2">
                                <Button className="rounded-lg px-6 h-12 font-bold uppercase text-xs">
                                    Trò chuyện với AI Sensei
                                </Button>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full">
                            <Card className="rounded-xl border border-border bg-card shadow-lg p-6 overflow-hidden">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">AI Sensei</h4>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                            <span className="text-[10px] font-bold text-green-500 uppercase">Hoạt động</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[85%]">
                                        <p className="text-sm">Chào bạn! Tôi có thể giúp gì cho việc học cấu trúc 「～ほうがいい」 hôm nay không?</p>
                                    </div>
                                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg rounded-tr-none max-w-[85%] ml-auto">
                                        <p className="text-sm text-primary font-medium text-right">Sensei ơi, cấu trúc này dùng khi nào ạ?</p>
                                    </div>
                                    <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[85%]">
                                        <p className="text-sm">Nó dùng để đưa ra lời khuyên. Ví dụ: 「早く寝たほうがいいですよ」(Bạn nên đi ngủ sớm đi đó).</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="h-10 flex-1 bg-muted/50 border border-border rounded-lg px-3 flex items-center">
                                        <span className="text-muted-foreground text-xs">Nhập câu hỏi...</span>
                                    </div>
                                    <Button size="icon" className="h-10 w-10 rounded-lg">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Methodology Section */}
            <section className="py-24 container mx-auto px-4 lg:px-8">
                <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight font-heading">Học thế nào cho hiệu quả?</h2>
                    <p className="text-muted-foreground text-sm font-medium">Kết hợp giữa học chủ động và tương tác trực tiếp.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="p-8 lg:p-10 space-y-6 rounded-xl border-border bg-card shadow-md">
                        <div className="p-3 bg-primary/10 text-primary rounded-lg w-fit">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">VOD - Học chủ động</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Thư viện 1000+ bài giảng sắc nét, lồng ghép ví dụ thực tế giúp bạn tiếp thu kiến thức một cách tự nhiên.
                            </p>
                        </div>
                        <ul className="space-y-2">
                            {["Tài liệu bản cứng gửi tận nhà", "App học tập mượt mà", "Luyện nghe/nói cùng AI"].map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                                </li>
                            ))}
                        </ul>
                        <Button className="w-full h-12 rounded-lg font-bold uppercase text-xs" variant="outline" asChild>
                            <Link href="/courses">Xem bài học mẫu</Link>
                        </Button>
                    </Card>

                    <Card className="p-8 lg:p-10 space-y-6 rounded-xl border-border bg-card shadow-md">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg w-fit">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Live - Tương tác cao</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Học trực tiếp cùng Sensei qua Google Meet. Sĩ số nhỏ giúp đảm bảo mọi học viên đều được thực hành.
                            </p>
                        </div>
                        <ul className="space-y-2">
                            {["Sửa phát âm trực tiếp", "Thảo luận nhóm nhỏ", "Cam kết đầu ra"].map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500" /> {f}
                                </li>
                            ))}
                        </ul>
                        <Button className="w-full h-12 rounded-lg font-bold uppercase text-xs bg-blue-600 hover:bg-blue-700 text-white border-none">Đăng ký tư vấn Live</Button>
                    </Card>
                </div>
            </section>

            {/* 5. Sensei Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <div className="space-y-4 mb-16 max-w-2xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-foreground">
                            Đội ngũ Sensei tâm huyết
                        </h2>
                        <p className="text-muted-foreground text-base lg:text-lg font-medium leading-relaxed">
                            Những chuyên gia hàng đầu với kinh nghiệm thực chiến tại Nhật Bản, 
                            luôn sẵn sàng đồng hành cùng bạn trên con đường chinh phục JLPT.
                        </p>
                    </div>

                    {/* Overlapping Avatar Stack */}
                    <div className="flex flex-col items-center gap-16">
                        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
                            {[
                                { 
                                    name: "Xuân Sensei", 
                                    sc: "Chuyên gia luyện thi N1", 
                                    tags: ["12+ năm"], 
                                    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60" 
                                },
                                { 
                                    name: "Minh Sensei", 
                                    sc: "Kỹ năng Giao tiếp & Business", 
                                    tags: ["8+ năm"], 
                                    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60" 
                                },
                                { 
                                    name: "Hương Sensei", 
                                    sc: "Luyện nghe - Đọc hiểu N2", 
                                    tags: ["6+ năm"], 
                                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60" 
                                },
                                { 
                                    name: "Thắng Sensei", 
                                    sc: "Ngữ pháp & Kanji đặc biệt", 
                                    tags: ["10+ năm"], 
                                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60" 
                                },
                            ].map((s, idx) => (
                                <div 
                                    key={idx}
                                    className="relative group cursor-pointer flex flex-col items-center text-center space-y-4"
                                >
                                    <Avatar className="size-32 lg:size-48 border-[6px] border-background shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 ring-1 ring-border">
                                        <AvatarImage src={s.avatar} alt={s.name} />
                                        <AvatarFallback>{s.name[0]}</AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="space-y-1">
                                        <p className="font-bold text-foreground text-sm lg:text-base">{s.name}</p>
                                        <p className="text-[10px] lg:text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.sc}</p>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            {s.tags.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="text-[8px] px-1.5 py-0">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-xl z-10">
                                        Sensei
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Testimonials */}
            <section className="py-24 container mx-auto px-4 lg:px-8">
                <div className="text-center space-y-3 mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight font-heading">Đánh giá từ học viên</h2>
                    <p className="text-sm text-muted-foreground font-medium">Hàng ngàn học viên đã tìm thấy niềm đam mê và thành công.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { name: "Minh Thu", sc: "145/180 N2", q: "Khoá học VOD rất chi tiết, lồng ghép thực tế hay. Lớp feedback chấm bài cực kỳ có tâm!", avt: 30 },
                        { name: "Hải Đăng", sc: "Kỹ sư tại Tokyo", q: "Nhờ Torii mà mình tự tin phỏng vấn. Các Sensei Native sửa lỗi phát âm rất kỹ.", avt: 12 },
                        { name: "Ngọc Linh", sc: "Thủ khoa N3", q: "Lộ trình rõ ràng, hệ thống bài học thông minh giúp mình không bị dồn kiến thức cuối kỳ.", avt: 41 },
                    ].map((h, i) => (
                        <Card key={i} className="p-8 flex flex-col items-start gap-4 rounded-xl border-border bg-card shadow-sm">
                            <div className="flex text-amber-500 gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} fill="currentColor" className="h-3.5 w-3.5" />)}
                            </div>
                            <p className="text-sm font-medium italic text-foreground/80 leading-relaxed">&quot;{h.q}&quot;</p>
                            <div className="flex items-center gap-3 mt-4">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarImage src={`https://i.pravatar.cc/100?img=${h.avt}`} />
                                    <AvatarFallback>{h.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{h.name}</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{h.sc}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 7. Final CTA */}
            <section className="py-24 container mx-auto px-4 lg:px-8">
                <Card className="p-12 lg:p-20 rounded-xl bg-primary text-primary-foreground border-none text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl lg:text-6xl font-bold tracking-tight font-heading">
                            Sẵn sàng bắt đầu học?
                        </h2>
                        <p className="text-base lg:text-lg opacity-90 max-w-xl mx-auto">
                            Gia nhập cộng đồng 12,000+ học viên và bắt đầu lộ trình được cá nhân hóa ngay hôm nay.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                            <Button size="lg" className="h-14 px-10 text-base font-bold rounded-lg bg-background text-foreground hover:bg-background/90" asChild>
                                <Link href="/register">Đăng ký miễn phí</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 text-base font-bold rounded-lg border-white/20 hover:bg-white/10 text-white">
                                Liên hệ tư vấn
                            </Button>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    )
}