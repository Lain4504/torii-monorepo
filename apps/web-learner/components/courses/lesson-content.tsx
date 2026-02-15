'use client';

import {
    BookOpen,
    FileText,
    MessageSquare,
    Download,
    ClipboardList
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { cn } from '@workspace/ui/lib/utils'
import { CourseAssignmentsList } from './course-assignments-list'

interface LessonContentProps {
    description: string;
    courseId?: string;
    courseSlug?: string;
}

export function LessonContent({ description, courseId, courseSlug }: LessonContentProps) {
    return (
        <Tabs defaultValue="content" className="w-full">
            <TabsList className="bg-muted/20 border-none w-auto inline-flex h-auto p-1.5 gap-2 rounded-full">
                {[
                    { id: 'content', label: 'Bài học', icon: BookOpen },
                    { id: 'resources', label: 'Tài liệu', icon: FileText, badge: 1 },
                    { id: 'assignments', label: 'Bài tập', icon: ClipboardList },
                    { id: 'comments', label: 'Thảo luận', icon: MessageSquare }
                ].map((tab) => (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="px-6 py-3 rounded-full border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 transition-all flex items-center gap-2 hover:bg-background/40 hover:text-primary"
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {tab.badge && (
                            <span className={cn(
                                "ml-1 text-[9px] font-black rounded-full px-1.5 py-0.5",
                                "bg-background/20 text-current"
                            )}>
                                {tab.badge}
                            </span>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="content" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-5 bg-primary/40 rounded-full" />
                        <h3 className="text-xl font-sans font-bold italic text-foreground uppercase tracking-tight">
                            Nội dung bài học
                        </h3>
                    </div>

                    <div className="p-8 rounded-2xl border border-border/10 bg-muted/5">
                        <div className="space-y-4 text-foreground/80 leading-relaxed text-sm font-medium italic">
                            {description ? (
                                description.split('\n').map((para: string, i: number) => (
                                    <p key={i}>{para}</p>
                                ))
                            ) : (
                                <p className="text-muted-foreground/40 font-black uppercase tracking-[0.2em] text-sm">
                                    Nội dung bài học này được giảng viên thiết kế để học viên tự nghiên cứu qua video và các học liệu đi kèm.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="resources" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                <div className="grid gap-6">
                    <div className="group flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] border border-border/20 bg-muted/5 hover:bg-background hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shrink-0 border border-border/20 shadow-xl group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Tài liệu đi kèm</p>
                                <h4 className="text-2xl font-sans font-bold italic text-foreground tracking-tight uppercase leading-none">Giáo trình bài học (PDF)</h4>
                                <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span>ĐỊNH DẠNG PDF</span> <span className="w-1 h-1 bg-primary/40 rounded-full inline-block" /> <span>DUNG LƯỢNG 4.2 MB</span>
                                </p>
                            </div>
                        </div>
                        <Button className="h-14 rounded-2xl px-8 text-[11px] font-black uppercase tracking-[0.2em] bg-primary text-white hover:opacity-90 transition-all relative z-10 shadow-lg shadow-primary/20">
                            <Download className="w-4 h-4 mr-3" /> Tải tài liệu
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="assignments" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                {courseId && courseSlug ? (
                    <CourseAssignmentsList courseId={courseId} courseSlug={courseSlug} />
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center space-y-8 rounded-[3rem] border border-border/10 bg-muted/5">
                        <div className="w-24 h-24 bg-background rounded-3xl flex items-center justify-center shadow-2xl border border-border/10">
                            <ClipboardList className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Bài tập khóa học</h4>
                            <p className="text-xl font-sans font-bold italic text-foreground tracking-tight uppercase max-w-md mx-auto">
                                Không thể tải danh sách bài tập
                            </p>
                        </div>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="comments" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-8 rounded-[3rem] border border-border/10 bg-muted/5 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <div className="w-24 h-24 bg-background rounded-3xl flex items-center justify-center shadow-2xl border border-border/10 group">
                        <MessageSquare className="w-10 h-10 text-primary/20 group-hover:text-primary transition-colors duration-500" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Diễn đàn thảo luận</h4>
                        <p className="text-3xl font-sans font-bold italic text-foreground tracking-tight uppercase max-w-md mx-auto leading-none">
                            Tham gia <span className="text-primary not-italic">Trao đổi kiến thức</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/50 font-black uppercase tracking-[0.1em] max-w-sm mx-auto">
                            Tương tác với các học viên khác và đội ngũ giảng viên chuyên môn để giải đáp thắc mắc.
                        </p>
                    </div>
                    <Button className="h-16 rounded-2xl px-12 text-[11px] font-black uppercase tracking-[0.3em] bg-muted/10 text-foreground border border-border/40 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500">
                        Bắt đầu thảo luận
                    </Button>
                </div>
            </TabsContent>
        </Tabs>
    );
}
