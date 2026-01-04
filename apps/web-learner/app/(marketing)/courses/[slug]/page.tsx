import { CourseHeader } from "@/components/courses/course-header"
import { CourseCurriculum } from "@/components/courses/course-curriculum"
import { CourseInstructor } from "@/components/courses/course-instructor"
import { CourseReviews } from "@/components/courses/course-reviews"
import { CourseSidebar } from "@/components/courses/course-sidebar"
import { Check } from "lucide-react"

export default function CourseDetailPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
            <CourseHeader />

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* What you'll learn */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Bạn sẽ học được gì</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    "Thành thạo 2 bảng chữ cái Hiragana và Katakana",
                                    "Nắm vững 800+ từ vựng N5 thông dụng nhất",
                                    "Hiểu sâu 60+ cấu trúc ngữ pháp N5 căn bản",
                                    "Tự tin giao tiếp các chủ đề hàng ngày",
                                    "Kỹ năng nghe hiểu và đọc hiểu sơ cấp",
                                    "Phương pháp học tiếng Nhật hiệu quả"
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700 dark:text-slate-300 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div id="curriculum">
                            <CourseCurriculum />
                        </div>

                        {/* Instructor */}
                        <div id="instructor">
                            <CourseInstructor />
                        </div>

                        {/* Reviews */}
                        <div id="reviews">
                            <CourseReviews />
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1">
                        <CourseSidebar />
                    </div>
                </div>
            </div>
        </div>
    )
}
