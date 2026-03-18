'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs-lifted'
import { Search, Filter, BookOpen, Users, Star, ArrowRight, PlayCircle, Calendar, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAcademyOfferings } from '@/lib/api/services/academy-course-api'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatNumber } from '@/utils/format-utils'

export default function DashboardCoursesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<string>('all')
    const apiParams =
        activeTab === 'live'
            ? { limit: 50, mode: 'LIVE' as const, hasEnrollableLiveClass: true }
            : activeTab === 'vod'
                ? { limit: 50, mode: 'VOD' as const }
                : { limit: 50 }
    const { data: offeringsData, isLoading } = useAcademyOfferings(apiParams)

    const courses = offeringsData?.data ?? []
    const liveCourses = courses.filter((c: any) => c.type === 'LIVE' || c.isLive)
    const vodCourses = courses.filter((c: any) => c.type === 'VOD' || !c.isLive)

    // Simple search filtering
    const filteredCourses = (list: any[]) => list.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Khám phá khóa học</h1>
                    <p className="text-muted-foreground mt-1">Tìm kiếm và đăng ký các khóa học phù hợp với lộ trình của bạn.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm khóa học..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="vod">Học qua Video (VOD)</TabsTrigger>
                    <TabsTrigger value="live">Lớp học trực tiếp (Live)</TabsTrigger>
                </TabsList>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Spinner className="h-8 w-8 text-primary" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="all" className="space-y-10">
                            {filteredCourses(courses).length === 0 ? (
                                <div className="text-center py-10 border rounded-xl bg-muted/20">
                                    <p className="text-muted-foreground">
                                        Hiện chưa có khóa học nào để hiển thị.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <CourseSection
                                        title="Lớp học trực tiếp sắp khai giảng"
                                        description="Học tương tác cùng đội ngũ thầy cô giàu kinh nghiệm"
                                        courses={filteredCourses(liveCourses)}
                                        type="live"
                                    />
                                    <CourseSection
                                        title="Khóa học Video (VOD)"
                                        description="Tự chủ thời gian học tập với kho bài giảng chất lượng cao"
                                        courses={filteredCourses(vodCourses)}
                                        type="vod"
                                    />
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="vod">
                            <CourseGrid courses={filteredCourses(vodCourses)} type="vod" />
                        </TabsContent>

                        <TabsContent value="live">
                            <CourseGrid courses={filteredCourses(liveCourses)} type="live" />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    )
}

function CourseSection({ title, description, courses, type }: any) {
    if (courses.length === 0) return null
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    {type === 'live' ? <Calendar className="h-6 w-6 text-primary" /> : <PlayCircle className="h-6 w-6 text-primary" />}
                    {title}
                </h2>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <CourseGrid courses={courses.slice(0, 4)} type={type} />
        </div>
    )
}

function CourseGrid({ courses, type }: any) {
    if (courses.length === 0) {
        return (
            <div className="text-center py-10 border rounded-xl bg-muted/20">
                <p className="text-muted-foreground">Hiện chưa có khóa học nào trong danh mục này.</p>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course: any) => (
                <div key={course.id} className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div className="aspect-video relative overflow-hidden">
                        <Image
                            src={course.thumbnailUrl || '/course-placeholder.jpg'}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                            <Badge className="bg-primary/90 backdrop-blur-sm">{course.jlptLevel || 'N5'}</Badge>
                            {type === 'live' && <Badge variant="secondary" className="bg-yellow-500/90 text-white border-none">LIVE</Badge>}
                        </div>
                    </div>

                    <div className="p-4 space-y-4 flex-1 flex flex-col text-left">
                        <div className="space-y-2 flex-1">
                            <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors">
                                {course.title}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {formatNumber(course.totalStudents || 0)}</span>
                                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {course.rating || '5.0'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t mt-auto">
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-primary">{formatNumber(course.price || 0)} đ</span>
                                {course.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatNumber(course.oldPrice)} đ</span>}
                            </div>
                            <Button size="sm" asChild>
                                <Link href={`/dashboard/available-courses/${course.id}`}>
                                    Xem chi tiết
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
