import { Users } from 'lucide-react'
import type { AcademyCourseProfileCreateDTO } from '@workspace/schemas'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import Image from 'next/image'

interface CourseInstructorProps {
    course: AcademyCourseProfileCreateDTO & { lecturer?: any }
}

export function CourseInstructor({ course }: CourseInstructorProps) {
    const lecturer = course.lecturer;

    if (!lecturer) {
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Users className="text-primary size-6" />
                    Giảng viên
                </h3>

                <div className="bg-muted/30 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
                    <Avatar className="size-32 rounded-2xl shadow-lg">
                        <AvatarFallback className="bg-primary/10 text-4xl font-bold text-primary rounded-2xl">T</AvatarFallback>
                    </Avatar>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold">Giảng viên Torii Nihongo</h3>
                            <p className="text-primary font-medium">Chuyên gia đào tạo JLPT</p>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Đội ngũ giảng viên giàu kinh nghiệm với phương pháp giảng dạy hiện đại, giúp học viên chinh phục JLPT một cách hiệu quả nhất.
                        </p>

                        <div className="flex gap-4">
                            <button className="text-sm font-bold text-primary hover:underline">
                                Các khóa học khác
                            </button>
                            <button className="text-sm font-bold text-primary hover:underline">
                                Xem hồ sơ đầy đủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-primary size-6" />
                Giảng viên
            </h3>

            <div className="bg-muted/30 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0">
                    {lecturer.avatarUrl ? (
                        <div className="relative size-32 rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src={lecturer.avatarUrl}
                                alt={lecturer.displayName || 'Instructor'}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <Avatar className="size-32 rounded-2xl shadow-lg">
                            <AvatarFallback className="bg-primary/10 text-4xl font-bold text-primary rounded-2xl">
                                {lecturer.displayName?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>

                <div className="space-y-4 flex-1">
                    <div>
                        <h3 className="text-2xl font-bold">{lecturer.displayName}</h3>
                        <p className="text-primary font-medium">Giảng viên tại Torii Nihongo</p>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Giảng viên giàu kinh nghiệm với phương pháp giảng dạy hiện đại, giúp học viên chinh phục JLPT một cách hiệu quả và tự tin nhất.
                    </p>

                    <div className="flex gap-4">
                        <button className="text-sm font-bold text-primary hover:underline">
                            Các khóa học khác
                        </button>
                        <button className="text-sm font-bold text-primary hover:underline">
                            Xem hồ sơ đầy đủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
