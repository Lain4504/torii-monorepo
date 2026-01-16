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
                <div className="flex items-center gap-4">
                    <Users className="w-5 h-5 text-primary/40" />
                    <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-foreground uppercase tracking-tight">Academic Mentors</h2>
                </div>

                <div className="rounded-3xl p-6 bg-muted/20 border border-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all duration-700" />

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl p-1 border-2 border-primary/20 bg-background shadow-2xl relative">
                                <Avatar className="w-full h-full rounded-xl">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">T</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white border-2 border-background">
                                    <Sparkles className="w-3 h-3" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex gap-0.5 text-amber-500">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">4.9 Rating</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary/5 text-primary rounded-full text-[8px] font-black uppercase tracking-[0.3em]">
                                    <span>Specialist Team</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-serif font-bold italic tracking-tight text-foreground uppercase">Torii Academic Faculty</h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">Elite linguistic instructors & JLPT specialists</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-black text-foreground">{course.totalStudents.toLocaleString()}+</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Học viên</div>
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-sm font-black text-foreground">15+</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Khóa học</div>
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-sm font-black text-foreground">JLPT N1</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Chứng chỉ</div>
                                </div>
                            </div>

                            <p className="text-xs font-bold text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4">
                                "Sứ mệnh của chúng tôi không chỉ dừng lại ở việc dạy tiếng Nhật, mà là truyền cảm hứng và xây dựng tư duy thành công cho mọi học viên trên con đường chinh phục Nhật Bản."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Giảng viên hướng dẫn</h2>
            </div>

            <div className="grid gap-6">
                {instructors.map((instructor) => (
                    <div key={instructor.id} className="rounded-3xl p-6 bg-muted/20 border border-border/40 group hover:border-primary/20 transition-all duration-500">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 flex flex-row md:flex-col items-center gap-4 w-full md:w-auto">
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl p-1 border-2 border-primary/20 bg-background shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                                    <Avatar className="w-full h-full rounded-xl">
                                        <AvatarImage src={instructor.user.avatarUrl ?? undefined} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">
                                            {instructor?.user?.displayName?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex flex-col items-start md:items-center gap-1">
                                    <div className="flex gap-0.5 text-amber-500">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-[10px] font-black text-foreground ml-1">5.0</span>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Rating</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="space-y-1.5">
                                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary/5 text-primary rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                                        <span>Certified Instructor</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-serif font-bold italic tracking-tight text-foreground uppercase group-hover:text-primary transition-colors leading-tight">
                                        {instructor.user.displayName}
                                    </h3>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">Senior Academic Lead at Torii Nihongo</p>
                                </div>

                                <div className="flex flex-wrap gap-y-3 gap-x-6">
                                    <div className="flex items-center gap-2.5 group/stat">
                                        <div className="w-6 h-6 rounded-md bg-background flex items-center justify-center text-muted-foreground group-hover/stat:text-primary transition-colors">
                                            <Users className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Kinh nghiệm dày dặn</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 group/stat">
                                        <div className="w-6 h-6 rounded-md bg-background flex items-center justify-center text-muted-foreground group-hover/stat:text-primary transition-colors">
                                            <Award className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Hệ thống bài giảng JLPT</span>
                                    </div>
                                </div>

                                <p className="text-xs font-bold text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4 break-words">
                                    Mang đến trải nghiệm học tiếng Nhật hiện đại, đơn giản và cực kỳ hiệu quả thông qua lộ trình cá nhân hóa.
                                </p>

                                <Button variant="outline" className="h-9 px-5 rounded-lg text-[9px] font-black uppercase tracking-widest border-border/40 hover:bg-muted hover:border-primary/20 transition-all cursor-pointer group/btn active:scale-95 w-full md:w-auto">
                                    Xem hồ sơ chi tiết
                                    <ChevronRight className="ml-2 w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
