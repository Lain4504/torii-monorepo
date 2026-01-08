import { CourseHeader } from "@/components/courses/course-header"
import { CourseCurriculum } from "@/components/courses/course-curriculum"
import { CourseInstructor } from "@/components/courses/course-instructor"
import { CourseReviews } from "@/components/courses/course-reviews"
import { CourseSidebar } from "@/components/courses/course-sidebar"
import { Check } from "lucide-react"
import { courseApi } from "@/api/services/course-api"
import { notFound } from "next/navigation"

interface CourseDetailPageProps {
    params: Promise<{ slug: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
    const { slug } = await params
    
    // Fetch course data
    const course = await courseApi.getCourseBySlug(slug)
    
    if (!course) {
        notFound()
    }

    // Fetch curriculum data
    const curriculum = await courseApi.getCurriculum(course.id)

    // Extract learning outcomes (assuming it's an array of strings)
    const learningOutcomes = Array.isArray(course.learningOutcomes) 
        ? course.learningOutcomes 
        : []

    return (
        <div className="min-h-screen bg-background pb-20">
            <CourseHeader course={course} />

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* What you'll learn */}
                        {learningOutcomes.length > 0 && (
                            <div className="bg-card border rounded-lg p-8">
                                <h2 className="text-2xl font-bold text-card-foreground mb-6">Bạn sẽ học được gì</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {learningOutcomes.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Curriculum */}
                        <div id="curriculum">
                            <CourseCurriculum curriculum={curriculum} />
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
