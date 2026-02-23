import { CourseHeader } from "@/components/courses/course-header"
import { CourseCurriculum } from "@/components/courses/course-curriculum"
import { CourseInstructor } from "@/components/courses/course-instructor"
import { CourseReviews } from "@/components/courses/course-reviews"
import { CourseSidebar } from "@/components/courses/course-sidebar"
import { CheckCircle2, Sparkles, BookOpen, GraduationCap } from "lucide-react"
import { courseApi } from "@/lib/api/services/course-api"
import { notFound } from "next/navigation"

interface CourseDetailPageProps {
    params: Promise<{ slug: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
    const { slug } = await params

    const course = await courseApi.getCourseBySlug(slug)

    if (!course) {
        notFound()
    }

    const curriculum = await courseApi.getCurriculum(course.id)

    const learningOutcomes = Array.isArray(course.learningOutcomes)
        ? course.learningOutcomes
        : []

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-32">
            <CourseHeader course={course} />

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-12 order-2 lg:order-1">

                        {/* What you'll learn */}
                        {learningOutcomes.length > 0 && (
                            <div className="space-y-6 animate-in fade-in duration-700">
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-foreground">Bạn sẽ học được gì</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
                                    {learningOutcomes.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-start group">
                                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium text-foreground/80 leading-relaxed">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {course.description && (
                            <div className="space-y-6 animate-in fade-in duration-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">Giới thiệu khóa học</h2>
                                </div>
                                <div
                                    className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: course.description }}
                                />
                            </div>
                        )}

                        {/* Requirements */}
                        {Array.isArray(course.requirements) && course.requirements.length > 0 && (
                            <div className="space-y-6 animate-in fade-in duration-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">Yêu cầu đầu vào</h2>
                                </div>
                                <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                                    <ul className="space-y-3">
                                        {course.requirements.map((req: string, index: number) => (
                                            <li key={index} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Curriculum */}
                        <div id="curriculum">
                            <CourseCurriculum curriculum={curriculum} courseSlug={course.slug} />
                        </div>

                        {/* Instructor */}
                        <div id="instructor">
                            <CourseInstructor course={course} />
                        </div>

                        {/* Reviews */}
                        <div id="reviews">
                            <CourseReviews course={course} />
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1 order-1 lg:order-2">
                        <CourseSidebar course={course} />
                    </div>
                </div>
            </div>
        </div>
    )
}
