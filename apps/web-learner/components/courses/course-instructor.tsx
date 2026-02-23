import { Award, ChevronRight, Star, Users } from 'lucide-react'
import type { CourseResponseDTO } from '@workspace/schemas'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'

import { formatNumber } from '@/utils/format-utils'

interface CourseInstructorProps {
    course: CourseResponseDTO
}

export function CourseInstructor({ course }: CourseInstructorProps) {
    const instructors = course.instructors && course.instructors.length > 0
        ? course.instructors
        : null

    if (!instructors) {
        return (
            <div className="space-y-6 animate-in fade-in duration-700">
                <div className="flex items-center gap-3">
                    <div className="rounded bg-primary/10 p-1.5 text-primary">
                        <Users className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Đội ngũ Cố vấn</h2>
                </div>

                <Card className="p-6">
                    <div className="flex flex-col gap-6 md:flex-row">
                        <div className="flex shrink-0 flex-col items-center gap-3">
                            <Avatar className="size-16">
                                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">T</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1">
                                <Star className="size-3.5 fill-primary text-primary" />
                                <span className="text-xs font-bold">4.9 Đánh giá</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold">Học viện Torii Nihongo</h3>
                                <p className="text-sm text-muted-foreground">Giảng viên ngôn ngữ & Chuyên gia đào tạo JLPT</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-lg font-bold">{formatNumber(course.totalStudents)}+</div>
                                    <div className="text-xs text-muted-foreground">Học viên</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold">15+</div>
                                    <div className="text-xs text-muted-foreground">Khóa học</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold">JLPT N1</div>
                                    <div className="text-xs text-muted-foreground">Chứng chỉ</div>
                                </div>
                            </div>

                            <p className="text-sm italic text-muted-foreground">
                                "Sứ mệnh của chúng tôi không chỉ dừng lại ở việc dạy tiếng Nhật, mà là truyền cảm hứng và xây dựng tư duy thành công cho mọi học viên trên con đường chinh phục Nhật Bản."
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center gap-3">
                <div className="rounded bg-primary/10 p-1.5 text-primary">
                    <Users className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Giảng viên hướng dẫn</h2>
            </div>

            <div className="grid gap-4">
                {instructors.map(instructor => (
                    <Card key={instructor.id} className="p-6 transition-colors hover:border-primary/50">
                        <div className="flex flex-col gap-6 md:flex-row">
                            <div className="flex shrink-0 flex-col items-center gap-3">
                                <Avatar className="size-16">
                                    <AvatarImage src={instructor.user.avatarUrl ?? undefined} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                                        {instructor?.user?.displayName?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className="flex items-center gap-1 text-primary">
                                        <Star className="size-3.5 fill-current" />
                                        <span className="text-xs font-bold text-foreground">5.0</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">Đánh giá</span>
                                </div>
                            </div>

                            <div className="w-full flex-1 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {instructor.user.displayName}
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground">Trưởng nhóm Học thuật tại Torii Nihongo</p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Users className="size-4 text-primary" />
                                        <span>Kinh nghiệm dạy tốt</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award className="size-4 text-primary" />
                                        <span>Hệ thống bài giảng hay</span>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Mang đến trải nghiệm học tiếng Nhật hiện đại, đơn giản và cực kỳ hiệu quả thông qua lộ trình cá nhân hóa.
                                </p>

                                <Button variant="outline" size="sm" className="font-bold">
                                    Xem hồ sơ chi tiết
                                    <ChevronRight className="ml-1.5 size-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
