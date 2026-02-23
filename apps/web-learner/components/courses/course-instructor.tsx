import { Star, Users, Award, ChevronRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import type { CourseResponseDTO } from '@workspace/schemas'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { formatNumber } from '@/utils/format-utils'

interface CourseInstructorProps {
    course: CourseResponseDTO
}

export function CourseInstructor({ course }: CourseInstructorProps) {
    const instructors = course.instructors && course.instructors.length > 0
        ? course.instructors
        : null;

    if (!instructors) {
        return (
            <div className="space-y-6 animate-in fade-in duration-700">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Đội ngũ Cố vấn</h2>
                </div>

                <div className="rounded-2xl p-6 bg-card border border-border shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden">
                                <Avatar className="w-full h-full rounded-xl">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">T</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                <span className="text-xs font-bold text-foreground">4.9 Đánh giá</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-foreground">Học viện Torii Nihongo</h3>
                                <p className="text-sm font-medium text-muted-foreground">Giảng viên ngôn ngữ & Chuyên gia đào tạo JLPT</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-lg font-bold text-foreground">{formatNumber(course.totalStudents)}+</div>
                                    <div className="text-xs text-muted-foreground">Học viên</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-foreground">15+</div>
                                    <div className="text-xs text-muted-foreground">Khóa học</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-foreground">JLPT N1</div>
                                    <div className="text-xs text-muted-foreground">Chứng chỉ</div>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                "Sứ mệnh của chúng tôi không chỉ dừng lại ở việc dạy tiếng Nhật, mà là truyền cảm hứng và xây dựng tư duy thành công cho mọi học viên trên con đường chinh phục Nhật Bản."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Users className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Giảng viên hướng dẫn</h2>
            </div>

            <div className="grid gap-4">
                {instructors.map((instructor) => (
                    <div key={instructor.id} className="rounded-2xl p-6 bg-card border border-border hover:border-primary/50 transition-colors shadow-sm">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 flex flex-row md:flex-col items-center gap-4 w-full md:w-auto">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-muted overflow-hidden">
                                    <Avatar className="w-full h-full rounded-xl">
                                        <AvatarImage src={instructor.user.avatarUrl ?? undefined} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                            {instructor?.user?.displayName?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex flex-col items-start md:items-center gap-0.5">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-xs font-bold text-foreground">5.0</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground">Đánh giá</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {instructor.user.displayName}
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground">Trưởng nhóm Học thuật tại Torii Nihongo</p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span>Kinh nghiệm dày dặn</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-primary" />
                                        <span>Hệ thống bài giảng JLPT</span>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Mang đến trải nghiệm học tiếng Nhật hiện đại, đơn giản và cực kỳ hiệu quả thông qua lộ trình cá nhân hóa.
                                </p>

                                <Button variant="outline" size="sm" className="rounded-lg font-bold border-border hover:bg-muted transition-all">
                                    Xem hồ sơ chi tiết
                                    <ChevronRight className="ml-1.5 w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
