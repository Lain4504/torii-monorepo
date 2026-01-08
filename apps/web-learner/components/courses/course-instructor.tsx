import { Star, Users, PlayCircle, Award } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import type { CourseResponseDTO } from '@workspace/schemas'

interface CourseInstructorProps {
    course: CourseResponseDTO
}

export function CourseInstructor({ course }: CourseInstructorProps) {
    // Note: Instructor data is not yet available in the course model
    // This is a placeholder that can be enhanced when instructor API is available
    // For now, we'll show a generic instructor placeholder

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Giảng viên</h2>

            <div className="border rounded-lg p-6 bg-card">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 bg-muted flex items-center justify-center">
                            <Users className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <div className="flex gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <div className="text-sm font-bold text-foreground">4.9</div>
                            <div className="text-sm text-muted-foreground">(2.5k)</div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-primary">
                                Giảng viên Torii Nihongo
                            </h3>
                            <p className="text-muted-foreground font-medium">
                                Đội ngũ giảng viên chuyên nghiệp
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{course.totalStudents.toLocaleString()}+ Học viên</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-muted-foreground" />
                                <span>Nhiều khóa học</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-muted-foreground" />
                                <span>JLPT Certified</span>
                            </div>
                        </div>

                        <p className="text-muted-foreground leading-relaxed">
                            Đội ngũ giảng viên của Torii Nihongo có nhiều năm kinh nghiệm giảng dạy tiếng Nhật cho người nước ngoài.
                            Phương pháp giảng dạy tập trung vào việc sử dụng tiếng Nhật tự nhiên trong giao tiếp và hiểu sâu văn hóa Nhật Bản.
                            Đã giúp hàng nghìn học viên đạt được mục tiêu JLPT của mình.
                        </p>

                        <Button variant="outline" className="h-9 cursor-pointer">
                            Xem hồ sơ chi tiết
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
