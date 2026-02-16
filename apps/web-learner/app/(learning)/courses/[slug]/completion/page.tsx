'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Award, CheckCircle2, Download, Home, BookOpen } from 'lucide-react'
import { courseApi } from '@/apis/services/course-api'

export default function CourseCompletionPage() {
    const params = useParams()

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-2xl animate-in fade-in duration-500">
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-8 md:p-12 text-center space-y-8">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <Award className="w-10 h-10" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-center gap-2">
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-3 py-1 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                Hoàn thành xuất sắc
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Chúc mừng bạn!
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Bạn đã hoàn thành khóa học <strong className="text-foreground">{course.title}</strong>
                        </p>
                    </div>

                    {/* Main Actions */}
                    <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
                        <Link href={`/dashboard/certificates`} className="w-full">
                            <Button size="lg" className="w-full rounded-xl font-bold">
                                <Download className="mr-2 w-4 h-4" />
                                Nhận chứng chỉ
                            </Button>
                        </Link>
                        <Link href={`/courses/${slug}/progress`} className="w-full">
                            <Button variant="outline" className="w-full rounded-xl font-bold">
                                Xem lại lộ trình
                            </Button>
                        </Link>
                    </div>

                    {/* Footer Nav */}
                    <div className="pt-8 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-4">
                            Bạn muốn làm gì tiếp theo?
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/courses">
                                <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold h-9">
                                    <BookOpen className="mr-2 w-3.5 h-3.5" />
                                    Khám phá khóa mới
                                </Button>
                            </Link>
                            <Link href="/dashboard/my-courses">
                                <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold h-9">
                                    <Home className="mr-2 w-3.5 h-3.5" />
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
