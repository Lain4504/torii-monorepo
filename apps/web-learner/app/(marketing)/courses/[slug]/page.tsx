import { CourseHeader } from "@/components/courses/course-header"
import { CourseCurriculum } from "@/components/courses/course-curriculum"
import { CourseInstructor } from "@/components/courses/course-instructor"
import { CourseReviews } from "@/components/courses/course-reviews"
import { CourseSidebar } from "@/components/courses/course-sidebar"
import { CheckCircle2, Sparkles, BookOpen, GraduationCap } from "lucide-react"
import { courseApi } from "@/api/services/course-api"
import { notFound } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

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
        <div className="min-h-screen bg-background pb-32 selection:bg-primary/10 selection:text-primary">
            <CourseHeader course={course} />

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
                <div className="grid lg:grid-cols-3 gap-16">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-24">

                        {/* What you'll learn */}
                        {learningOutcomes.length > 0 && (
                            <div className="space-y-10 animate-in fade-in duration-700">
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Bạn sẽ học được gì</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-y-6 gap-x-12 p-10 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                                    {learningOutcomes.map((item, index) => (
                                        <div key={index} className="flex gap-4 items-start group/item">
                                            <div className="w-6 h-6 rounded-lg bg-background flex items-center justify-center border border-primary/20 group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-sm font-bold text-muted-foreground/80 leading-relaxed group-hover/item:text-foreground transition-colors">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {course.description && (
                            <div className="space-y-10 animate-in fade-in duration-700">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Giới thiệu khóa học</h2>
                                </div>
                                <div
                                    className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground/80 leading-relaxed font-bold italic border-l-4 border-primary/10 pl-8"
                                    dangerouslySetInnerHTML={{ __html: course.description }}
                                />
                            </div>
                        )}

                        {/* Requirements */}
                        {Array.isArray(course.requirements) && course.requirements.length > 0 && (
                            <div className="space-y-10 animate-in fade-in duration-700">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Yêu cầu đầu vào</h2>
                                </div>
                                <ul className="space-y-4 pl-1">
                                    {course.requirements.map((req: string, index: number) => (
                                        <li key={index} className="flex items-center gap-4 text-sm font-bold text-muted-foreground/60 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
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
                    <div className="lg:col-span-1">
                        <CourseSidebar course={course} />
                    </div>
                </div>
            </div>
        </div>
    )
}
