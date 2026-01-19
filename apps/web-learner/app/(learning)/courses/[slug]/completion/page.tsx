'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Award, CheckCircle2, Share2, Download, Sparkles, Home, BookOpen, ArrowRight } from 'lucide-react'
import { courseApi } from '@/apis/services/course-api'

export default function CourseCompletionPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const courseData = await courseApi.getCourseBySlug(slug)
                if (courseData) {
                    setCourse(courseData)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchData()
        }
    }, [slug])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-center p-6">
                <div className="space-y-4">
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Không tìm thấy dữ liệu khóa học</p>
                    <Link href="/dashboard">
                        <Button variant="outline" className="rounded-full">Trở về Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse duration-5000" />
            </div>

            <Card className="max-w-3xl w-full border-border/40 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-1000">
                <CardContent className="p-8 md:p-16 text-center space-y-10">
                    {/* Icon & Badge */}
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110" />
                        <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center mx-auto relative z-10 shadow-xl shadow-primary/20">
                            <Award className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-lg animate-bounce duration-3000">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-center flex-wrap gap-2">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                Hoàn thành xuất sắc
                            </Badge>
                            <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                Chứng chỉ chính thức
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-4xl font-black text-foreground tracking-tighter leading-none">
                            XIN CHÚC MỪNG!
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium opacity-80 max-w-md mx-auto">
                            Hành trình vạn dặm đã kết thúc tại đây. Bạn đã chính thức vượt qua các bài học của khóa học:
                        </p>
                        <p className="text-2xl font-black text-primary uppercase tracking-tight">
                            {course.title}
                        </p>
                    </div>

                    {/* Main Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                        <Link href={`/dashboard/certificates`} className="sm:col-span-2">
                            <Button size="lg" className="w-full rounded-2xl h-14 text-sm font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 cursor-pointer transition-all active:scale-95">
                                <Download className="mr-3 w-5 h-5 text-white" />
                                Nhận Chứng Chỉ Ngay
                            </Button>
                        </Link>
                        <Link href={`/courses/${slug}/progress`}>
                            <Button variant="outline" className="w-full rounded-2xl h-12 text-xs font-bold uppercase tracking-widest border-border/50 hover:bg-muted cursor-pointer transition-all">
                                Xem lại lộ trình
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full rounded-2xl h-12 text-xs font-bold uppercase tracking-widest border-border/50 hover:bg-muted cursor-pointer transition-all">
                            <Share2 className="mr-3 w-4 h-4" />
                            Chia sẻ thành tích
                        </Button>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="pt-8 border-t border-border/30">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
                            Bước tiếp theo cho hành trình của bạn
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/courses">
                                <Button variant="ghost" className="rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-primary/5 hover:text-primary cursor-pointer group">
                                    <BookOpen className="mr-2.5 w-4 h-4" />
                                    Khám phá khóa mới
                                    <ArrowRight className="ml-2 w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </Button>
                            </Link>
                            <Link href="/dashboard/my-courses">
                                <Button variant="ghost" className="rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-primary/5 hover:text-primary cursor-pointer">
                                    <Home className="mr-2.5 w-4 h-4" />
                                    Về Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
