import { Star, Users, PlayCircle, Award, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import type { CourseResponseDTO } from '@workspace/schemas'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { cn } from '@workspace/ui/lib/utils'

interface CourseInstructorProps {
    course: CourseResponseDTO
}

export function CourseInstructor({ course }: CourseInstructorProps) {
    const instructors = course.instructors && course.instructors.length > 0
        ? course.instructors
        : null;

    if (!instructors) {
        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Giảng viên hướng dẫn</h2>
                </div>

                <div className="rounded-[2.5rem] p-10 bg-muted/20 border border-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all duration-700" />

                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="flex-shrink-0 flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-[2rem] p-1.5 border-2 border-primary/20 bg-background shadow-2xl relative">
                                <Avatar className="w-full h-full rounded-[1.5rem]">
                                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">T</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border-2 border-background">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex gap-0.5 text-amber-500">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">4.9 Instructor Rating</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                                    <span>Specialist Team</span>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Giảng viên Torii Nihongo</h3>
                                <p className="text-sm font-bold text-muted-foreground/60">Đội ngũ chuyên gia ngôn ngữ hàng đầu</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <div className="text-base font-black text-foreground">{course.totalStudents.toLocaleString()}+</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Học viên</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-base font-black text-foreground">15+</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Khóa học</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-base font-black text-foreground">JLPT N1</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Chứng chỉ</div>
                                </div>
                            </div>

                            <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-6">
                                "Sứ mệnh của chúng tôi không chỉ dừng lại ở việc dạy tiếng Nhật, mà là truyền cảm hứng và xây dựng tư duy thành công cho mọi học viên trên con đường chinh phục Nhật Bản."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Giảng viên hướng dẫn</h2>
            </div>

            <div className="grid gap-8">
                {instructors.map((instructor) => (
                    <div key={instructor.id} className="rounded-[2.5rem] p-10 bg-muted/20 border border-border/40 group hover:border-primary/20 transition-all duration-500">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            <div className="flex-shrink-0 flex flex-col items-center gap-4">
                                <div className="w-32 h-32 rounded-[2rem] p-1.5 border-2 border-primary/20 bg-background shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                                    <Avatar className="w-full h-full rounded-[1.5rem]">
                                        <AvatarImage src={instructor.user.avatarUrl ?? undefined} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                                            {instructor.user.displayName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex gap-0.5 text-amber-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-[11px] font-black text-foreground ml-1">5.0</span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Instructor Rating</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                                        <span>Certified Instructor</span>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-foreground uppercase group-hover:text-primary transition-colors">
                                        {instructor.user.displayName}
                                    </h3>
                                    <p className="text-sm font-bold text-muted-foreground/60">Giảng viên cao cấp tại Torii Nihongo</p>
                                </div>

                                <div className="flex flex-wrap gap-8">
                                    <div className="flex items-center gap-3 group/stat">
                                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover/stat:text-primary transition-colors">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Kinh nghiệm dày dặn</span>
                                    </div>
                                    <div className="flex items-center gap-3 group/stat">
                                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover/stat:text-primary transition-colors">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Hệ thống bài giảng JLPT</span>
                                    </div>
                                </div>

                                <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-6">
                                    Mang đến trải nghiệm học tiếng Nhật hiện đại, đơn giản và cực kỳ hiệu quả thông qua lộ trình cá nhân hóa.
                                </p>

                                <Button variant="outline" className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/40 hover:bg-muted hover:border-primary/20 transition-all cursor-pointer group/btn active:scale-95">
                                    Xem hồ sơ chi tiết
                                    <ChevronRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
