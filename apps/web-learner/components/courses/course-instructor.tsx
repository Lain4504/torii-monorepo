import { Users, User } from 'lucide-react'
import type { AcademyCourseProfileCreateDTO } from '@workspace/schemas'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import Image from 'next/image'
import Link from 'next/link'

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

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold">Giảng viên Torii Nihongo</h3>
                            <p className="text-primary font-medium">Chuyên gia đào tạo JLPT</p>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Đội ngũ giảng viên giàu kinh nghiệm với phương pháp giảng dạy hiện đại, giúp học viên chinh phục JLPT một cách hiệu quả nhất.
                        </p>

                        <div className="flex gap-4">
                            <Link href="/dashboard/available-courses" className="text-sm font-bold text-primary hover:underline">
                                Các khóa học khác
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const instructorHref = `/dashboard/instructors/${lecturer.id}?name=${encodeURIComponent(lecturer.displayName || '')}`

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-primary size-6" />
                Giảng viên
            </h3>

            <div className="bg-muted/30 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
                {lecturer.avatarUrl && (
                    <div className="shrink-0">
                        <Link href={instructorHref} className="block group">
                            <div className="relative size-32 rounded-2xl overflow-hidden shadow-lg group-hover:ring-2 group-hover:ring-primary transition-all">
                                <Image
                                    src={lecturer.avatarUrl}
                                    alt={lecturer.displayName || 'Instructor'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </Link>
                    </div>
                )}

                <div className="space-y-4 flex-1">
                    <div>
                        <Link href={instructorHref} className="hover:text-primary transition-colors">
                            <h3 className="text-2xl font-bold">{lecturer.displayName}</h3>
                        </Link>
                        <p className="text-primary font-medium">Giảng viên tại Torii Nihongo</p>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Giảng viên giàu kinh nghiệm với phương pháp giảng dạy hiện đại, giúp học viên chinh phục JLPT một cách hiệu quả và tự tin nhất.
                    </p>

                    <div className="flex gap-4">
                        <Link href={instructorHref} className="text-sm font-bold text-primary hover:underline">
                            Xem hồ sơ đầy đủ & các khóa học
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
