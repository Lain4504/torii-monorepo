"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ArrowRight, BookOpen, GraduationCap, Star, Users } from "lucide-react"
import Link from "next/link"
import React from "react"
import { motion } from "framer-motion"

const levels = [
    {
        id: "n5",
        title: "Cấp độ N5",
        description: "Bắt đầu hành trình chinh phục tiếng Nhật từ những bước cơ bản nhất.",
        count: "12+ Khóa học",
        studentCount: "1.2k+ Học viên",
        color: "from-blue-500/10 to-blue-600/10",
        borderColor: "border-blue-200",
        badgeColor: "bg-blue-100 text-blue-700",
        icon: <BookOpen className="size-6 text-blue-600" />,
        overview: "Bảng chữ cái, chào hỏi cơ bản, ngữ pháp sơ cấp 1."
    },
    {
        id: "n4",
        title: "Cấp độ N4",
        description: "Củng cố nền tảng, giao tiếp cơ bản trong cuộc sống hàng ngày.",
        count: "10+ Khóa học",
        studentCount: "800+ Học viên",
        color: "from-emerald-500/10 to-emerald-600/10",
        borderColor: "border-emerald-200",
        badgeColor: "bg-emerald-100 text-emerald-700",
        icon: <GraduationCap className="size-6 text-emerald-600" />,
        overview: "Ngữ pháp sơ cấp 2, kanji thông dụng, nghe hiểu cơ bản."
    },
    {
        id: "n3",
        title: "Cấp độ N3",
        description: "Bước đệm quan trọng sang trình độ trung cấp, hiểu sâu về văn hóa.",
        count: "15+ Khóa học",
        studentCount: "2.5k+ Học viên",
        color: "from-orange-500/10 to-orange-600/10",
        borderColor: "border-orange-200",
        badgeColor: "bg-orange-100 text-orange-700",
        icon: <Star className="size-6 text-orange-600" />,
        overview: "Ngữ pháp trung cấp, từ vựng chuyên sâu, đọc hiểu báo chí cơ bản."
    },
    {
        id: "n2",
        title: "Cấp độ N2",
        description: "Trình độ cao cấp, tự tin làm việc và học tập trong môi trường chuyên nghiệp.",
        count: "8+ Khóa học",
        studentCount: "500+ Học viên",
        color: "from-purple-500/10 to-purple-600/10",
        borderColor: "border-purple-200",
        badgeColor: "bg-purple-100 text-purple-700",
        icon: <Users className="size-6 text-purple-600" />,
        overview: "Ngữ pháp cao cấp, hội thoại tự nhiên, kỹ năng biên phiên dịch."
    },
    {
        id: "n1",
        title: "Cấp độ N1",
        description: "Đỉnh cao ngôn ngữ, am hiểu tiếng Nhật như người bản xứ.",
        count: "5+ Khóa học",
        studentCount: "200+ Học viên",
        color: "from-rose-500/10 to-rose-600/10",
        borderColor: "border-rose-200",
        badgeColor: "bg-rose-100 text-rose-700",
        icon: <Star className="size-6 text-rose-600" />,
        overview: "Ngữ pháp học thuật, kanji khó, am hiểu văn hóa nghệ thuật sâu sắc."
    }
]

export default function CourseLevelsPage() {
    return (
        <main className="container mx-auto px-4 lg:px-8 py-12 md:py-24 max-w-7xl">
            {/* HERO SECTION */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4 uppercase tracking-wider font-bold px-4 py-1">
                        Hệ thống đào tạo Torii
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
                        Lộ trình học tập toàn diện
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Từ người mới bắt đầu đến bậc thầy ngôn ngữ. Chọn cấp độ phù hợp để bắt đầu hành trình chinh phục tiếng Nhật của bạn ngay hôm nay.
                    </p>
                </motion.div>
            </div>

            {/* LEVELS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {levels.map((level, index) => (
                    <motion.div
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Link href={`/courses/category/${level.id}`}>
                            <Card className={`group relative h-full overflow-hidden border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer ${level.borderColor}`}>
                                <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 group-hover:opacity-100 opacity-60 ${level.color}`} />
                                
                                <CardContent className="relative p-8 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-3 rounded-2xl bg-background shadow-sm border border-border group-hover:scale-110 transition-transform duration-300">
                                            {level.icon}
                                        </div>
                                        <Badge className={`${level.badgeColor} font-bold border-none`}>
                                            {level.count}
                                        </Badge>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2 group-hover:text-primary transition-colors">
                                            {level.title}
                                            <span className="uppercase text-3xl opacity-10 font-black absolute right-6 top-8 group-hover:opacity-20 transition-opacity">
                                                {level.id}
                                            </span>
                                        </h3>
                                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                                            {level.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="size-3.5" />
                                                {level.studentCount}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="size-3.5 text-yellow-500 fill-yellow-500" />
                                                4.9/5
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center text-primary font-bold text-sm">
                                            Khám phá cấp độ này
                                            <ArrowRight className="ml-2 size-4 group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* FOOTER CALL TO ACTION */}
            <motion.div 
                className="mt-20 p-8 md:p-12 rounded-[2rem] bg-foreground text-background relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Bạn chưa biết mình ở trình độ nào?</h2>
                        <p className="text-background/70 text-lg">Làm bài kiểm tra năng lực miễn phí để xác định lộ trình học tập phù hơp nhất cho bản thân.</p>
                    </div>
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold px-8 h-14 rounded-full">
                        Kiểm tra ngay
                    </Button>
                </div>
            </motion.div>
        </main>
    )
}
