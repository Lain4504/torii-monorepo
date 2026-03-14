"use client"

import { useParams, useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"
import { useAcademyOfferings } from "@/lib/api/services/academy-course-api"
import { useAppSelector } from "@/hooks/hooks"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item"
import { LoginForm } from "@/components/auth/login-form"
import {
    Calendar,
    Clock,
    PlayCircle,
    Star,
    Users,
    ChevronRight,
    BookOpen,
    CheckCircle2,
    Info,
    ArrowLeft,
    MonitorPlay,
    Users2
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

// Syllabus Data
const levelSyllabus: Record<string, {
    title: string;
    description: string;
    points: string[];
}> = {
    n5: {
        title: "Chương Trình Sơ Cấp N5",
        description: "Bắt đầu hành trình với những kiến thức nền tảng nhất của tiếng Nhật.",
        points: [
            "Làm quen với bảng chữ cái Hiragana và Katakana",
            "Nắm vững 80 - 100 chữ Hán (Kanji) cơ bản",
            "Học khoảng 800 từ vựng thông dụng",
            "Ngữ pháp sơ cấp: Các mẫu câu đơn giản, trợ từ cơ bản, chia động từ thể Masu",
            "Khả năng nghe hiểu các đoạn hội thoại ngắn trong nhà trường hoặc đời sống"
        ]
    },
    n4: {
        title: "Chương Trình Sơ Cấp N4",
        description: "Củng cố và mở rộng khả năng giao tiếp hằng ngày.",
        points: [
            "Học thêm 300 chữ Hán thường gặp",
            "Mở rộng vốn từ vựng lên khoảng 1,500 từ",
            "Ngữ pháp: Các thể của động từ (Thể Te, Thể từ điển, Thể ý chí,...), câu điều kiện",
            "Đọc hiểu các bài viết ngắn về các chủ đề quen thuộc",
            "Nghe hiểu các tình huống hội thoại thường nhật với tốc độ chậm"
        ]
    },
    n3: {
        title: "Chương Trình Trung Cấp N3",
        description: "Bước đệm quan trọng để tiến tới trình độ cao cấp.",
        points: [
            "Làm chủ 600 chữ Hán và 3,000 từ vựng",
            "Sử dụng thành thạo các cấu trúc ngữ pháp trung cấp phức tạp",
            "Kỹ năng đọc hiểu các bài báo, tạp chí về chủ đề xã hội đơn giản",
            "Nghe hiểu hội thoại trong các tình huống thực tế với tốc độ tự nhiên",
            "Khả năng tóm tắt nội dung và bày tỏ ý kiến cá nhân"
        ]
    },
    n2: {
        title: "Chương Trình Cao Cấp N2",
        description: "Tự tin sử dụng tiếng Nhật trong công việc và đời sống chuyên nghiệp.",
        points: [
            "Thông thạo 1,000 chữ Hán và 6,000 từ vựng",
            "Hiểu sâu về các cách diễn đạt tinh tế, kính ngữ và tiếng Nhật thương mại",
            "Đọc hiểu các bài luận, bài bình luận chuyên môn",
            "Nghe hiểu các bài báo cáo, tin tức thời sự",
            "Khả năng tranh luận và thuyết trình bằng tiếng Nhật"
        ]
    },
    n1: {
        title: "Chương Trình Bậc Thầy N1",
        description: "Đỉnh cao của ngôn ngữ và sự am hiểu văn hóa sâu sắc.",
        points: [
            "Am hiểu hơn 2,000 chữ Hán và 10,000 từ vựng",
            "Nắm vững các cấu trúc ngữ pháp cổ điển và văn viết học thuật",
            "Đọc hiểu các văn bản triết học, nghệ thuật và kỹ thuật phức tạp",
            "Nghe hiểu toàn diện các cuộc thảo luận trừu tượng, hội thảo chuyên sâu",
            "Khả năng sử dụng ngôn ngữ linh hoạt như người bản xứ trong mọi hoàn cảnh"
        ]
    }
}

const formatPrice = (price?: number | string) => {
    if (price === undefined || price === null) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN').format(Number(price)) + 'đ';
};

export default function CourseCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const levelId = (params.category as string).toLowerCase();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { data: offerings, isLoading } = useAcademyOfferings({ status: 'PUBLISHED' });

    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const syllabus = levelSyllabus[levelId] || levelSyllabus.n5;

    if (!syllabus) {
        return <div className="p-24 text-center">Cấp độ không hợp lệ</div>;
    }

    const filteredCourses = useMemo(() => {
        if (!offerings?.data) return { vod: [], live: [] };

        const matched = offerings.data.filter((o: any) =>
            o.jlptLevel?.toLowerCase() === levelId || 
            o.classes?.some((c: any) => c.class?.courseProfile?.level?.toLowerCase() === levelId)
        );

        return {
            vod: matched.filter((o: any) => o.classes?.every((c: any) => c.class?.mode === 'VOD')),
            live: matched.filter((o: any) => o.classes?.some((c: any) => c.class?.mode === 'LIVE'))
        };
    }, [offerings, levelId]);

    const handleCourseClick = (course: any) => {
        setSelectedCourse(course);
    };

    const handleActionClick = () => {
        if (!isAuthenticated) {
            setShowLoginDialog(true);
        } else {
            router.push('/dashboard/available-courses');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Breadcrumb */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Link href="/courses" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors group">
                    <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
                    Quay lại danh sách cấp độ
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-3 px-3 py-1 text-sm font-bold uppercase">
                            KHÓA HỌC {levelId.toUpperCase()}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                            Hành trình <span className="text-primary">{levelId.toUpperCase()}</span> của bạn
                        </h1>
                    </div>
                </div>
            </div>

            {/* Syllabus Section */}
            <section className="bg-muted/30 border-y border-border py-16">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <BookOpen className="text-primary size-8" />
                                {syllabus.title}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                {syllabus.description}
                            </p>
                            <div className="space-y-4">
                                {syllabus.points.map((point, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-background p-4 rounded-xl border border-border shadow-sm group hover:border-primary/30 transition-colors">
                                        <CheckCircle2 className="text-primary size-5 mt-0.5 shrink-0" />
                                        <span className="font-medium text-foreground/80">{point}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-background"
                        >
                            <img
                                src={`https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2070&auto=format&fit=crop`}
                                alt="Syllabus visual"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                                <p className="text-white font-bold text-xl italic">
                                    "Học tiếng Nhật không chỉ là học một ngôn ngữ, mà là khám phá một tâm hồn mới."
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <main className="container mx-auto px-4 py-20 max-w-7xl">
                <Tabs defaultValue="vod" className="w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                        <div>
                            <h2 className="text-3xl font-black text-foreground mb-2">Danh Sách Khóa Học</h2>
                            <p className="text-muted-foreground">Chọn giữa học VOD linh hoạt hoặc Lớp Live tương tác.</p>
                        </div>
                        <TabsList className="bg-muted p-1 h-12 rounded-full border border-border shadow-inner">
                            <TabsTrigger value="vod" className="rounded-full px-8 h-10 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <MonitorPlay className="size-4 mr-2" />
                                VIDEO (VOD)
                            </TabsTrigger>
                            <TabsTrigger value="live" className="rounded-full px-8 h-10 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Users2 className="size-4 mr-2" />
                                LỚP LIVE
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* VOD Content */}
                    <TabsContent value="vod" className="mt-0">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredCourses.vod.map((course: any) => (
                                    <motion.div
                                        key={course.id}
                                        whileHover={{ y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card
                                            className="h-full border border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden group cursor-pointer"
                                            onClick={() => handleCourseClick(course)}
                                        >
                                            <div className="relative aspect-video overflow-hidden">
                                                <img
                                                    src={course.classes?.[0]?.class?.courseProfile?.thumbnailUrl || "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop"}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-black/60 backdrop-blur-md text-white border-none font-bold">VOD</Badge>
                                                </div>
                                            </div>
                                            <CardHeader className="p-6">
                                                <div className="flex items-center gap-1 text-yellow-500 mb-2 font-bold text-sm">
                                                    <Star className="size-4 fill-current" />
                                                    <span>4.9</span>
                                                    <span className="text-muted-foreground font-medium ml-1">(1.2k)</span>
                                                </div>
                                                <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                                    {course.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-6 pb-6 pt-0 flex-1">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <PlayCircle className="size-4" />
                                                        <span>24 Bài học</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="size-4" />
                                                        <span>12 Giờ</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-6 pt-0 border-t border-border/40 mt-auto flex justify-between items-center bg-muted/20">
                                                <div className="font-black text-xl text-primary">{formatPrice(course.originalPrice)}</div>
                                                <Button size="sm" variant="ghost" className="font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                                    Chi tiết <ChevronRight className="ml-1 size-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                                {filteredCourses.vod.length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                                        <Info className="size-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-xl font-bold text-muted-foreground">Hiện chưa có khóa học VOD cho cấp độ này.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Live Content */}
                    <TabsContent value="live" className="mt-0">
                        <div className="grid grid-cols-1 gap-4">
                            {filteredCourses.live.map((course: any) => (
                                <Item
                                    key={course.id}
                                    variant="outline"
                                    className="p-6 hover:border-primary/40 transition-all group cursor-pointer flex flex-col md:flex-row gap-6 md:items-center"
                                    onClick={() => handleCourseClick(course)}
                                >
                                    <ItemMedia className="size-24 md:size-32 rounded-2xl overflow-hidden border border-border shadow-sm shrink-0">
                                        <img
                                            src={course.classes?.[0]?.class?.courseProfile?.thumbnailUrl || "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop"}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </ItemMedia>
                                    <ItemContent className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold">LIVE</Badge>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                Khai giảng: {course.classes?.[0]?.class?.startDate ? new Date(course.classes?.[0]?.class?.startDate).toLocaleDateString('vi-VN') : 'TBA'}
                                            </span>
                                        </div>
                                        <ItemTitle className="text-xl md:text-2xl font-black truncate group-hover:text-primary transition-colors mb-2">
                                            {course.title}
                                        </ItemTitle>
                                        <ItemDescription className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                <Calendar className="size-4 text-primary" />
                                                T2, T4, T6 (19:00 - 21:00)
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="size-4" />
                                                Hơn 20 học viên đã đăng ký
                                            </div>
                                        </ItemDescription>
                                    </ItemContent>
                                    <ItemActions className="flex flex-col justify-center items-end md:border-l border-border md:pl-8 pt-4 md:pt-0 shrink-0 min-w-[180px]">
                                        <div className="text-2xl font-black text-primary mb-3">
                                            {formatPrice(course.originalPrice)}
                                        </div>
                                        <Button className="w-full md:w-auto font-bold shadow-lg shadow-primary/10">Xem chi tiết</Button>
                                    </ItemActions>
                                </Item>
                            ))}
                            {filteredCourses.live.length === 0 && (
                                <div className="py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                                    <Info className="size-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-xl font-bold text-muted-foreground">Hiện chưa có lớp học Live cho đợt này.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Course Detail Dialog */}
            <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
                <DialogContent className="max-w-[95vw] md:max-w-[800px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                    <AnimatePresence>
                        {selectedCourse && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <div className="relative aspect-video md:aspect-[21/9] overflow-hidden">
                                    <img
                                        src={selectedCourse.classes?.[0]?.class?.courseProfile?.thumbnailUrl || "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop"}
                                        alt={selectedCourse.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                                        <Badge className="w-fit mb-4 bg-primary text-primary-foreground border-none font-bold">
                                            {selectedCourse.classes?.[0]?.class?.mode || "Course"}
                                        </Badge>
                                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                                            {selectedCourse.title}
                                        </h2>
                                    </div>
                                </div>

                                <ScrollArea className="max-h-[60vh]">
                                    <div className="p-8 space-y-8">
                                        <div className="flex flex-wrap items-center gap-6 py-4 border-b border-border">
                                            <div className="flex items-center gap-2">
                                                <Star className="size-5 text-yellow-500 fill-yellow-500" />
                                                <span className="font-black text-xl">4.9</span>
                                                <span className="text-muted-foreground font-medium">/ 5.0</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="size-5 text-primary" />
                                                <span className="font-bold">1,245</span>
                                                <span className="text-muted-foreground font-medium">Học viên</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="size-5 text-primary" />
                                                <span className="font-bold">120 Ngày</span>
                                                <span className="text-muted-foreground font-medium">Sở hữu</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xl font-bold flex items-center gap-2">
                                                <Info className="size-5 text-primary" />
                                                Mô tả khóa học
                                            </h4>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {selectedCourse.description || selectedCourse.classes?.[0]?.class?.courseProfile?.description || "Khóa học sẽ cung cấp cho bạn toàn bộ kiến thức cần thiết để chinh phục mục tiêu JLPT của mình một cách hiệu quả nhất."}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-bold">Nội dung học tập</h4>
                                                <div className="space-y-2">
                                                    {['12 Chương học cốt lõi', '80+ Video bài giảng', 'Bộ đề thi thử sát thực tế', 'Tài liệu PDF độc quyền'].map((item, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                            <div className="size-1.5 rounded-full bg-primary" />
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-bold">Lợi ích khi học</h4>
                                                <div className="space-y-2">
                                                    {['Hỗ trợ giải đáp 24/7', 'Chứng chỉ hoàn thành', 'Truy cập mọi lúc mọi nơi', 'Cập nhật kiến thức mới nhất'].map((item, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                            <div className="size-1.5 rounded-full bg-primary" />
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>

                                <div className="p-8 bg-muted/40 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-1">
                                        <span className="text-sm font-bold text-muted-foreground uppercase opacity-70">Giá đăng ký</span>
                                        <div className="text-3xl font-black text-primary">{formatPrice(selectedCourse.originalPrice)}</div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            className="flex-1 md:flex-none h-14 px-8 font-extrabold border-2"
                                            onClick={() => setSelectedCourse(null)}
                                        >
                                            Hủy bỏ
                                        </Button>
                                        <Button
                                            className="flex-1 md:flex-none h-14 px-12 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                                            onClick={handleActionClick}
                                        >
                                            Bắt đầu học ngay
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>

            {/* Login Dialog */}
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                    <div className="p-8">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-3xl font-black text-center mb-2">Đăng nhập</DialogTitle>
                            <DialogDescription className="text-center font-medium">
                                Bạn cần đăng nhập để tiếp tục đăng ký khóa học này.
                            </DialogDescription>
                        </DialogHeader>
                        <LoginForm />
                        <div className="mt-8 pt-6 border-t border-border text-center">
                            <p className="text-sm text-muted-foreground font-medium">
                                Chưa có tài khoản?{' '}
                                <Link href="/register" className="text-primary font-black hover:underline underline-offset-4">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
