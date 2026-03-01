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
import { Badge } from '@workspace/ui/components/badge'
import { CourseAssignmentsList } from './course-assignments-list'
import { LessonDiscussion } from './lesson-discussion'

interface LessonContentProps {
    description: string;
    courseRunId?: string;
    courseMasterId?: string;
    courseSlug?: string;
    lessonId?: string;
    moduleId?: string;
}

export function LessonContent({ description, courseRunId, courseMasterId, courseSlug, lessonId, moduleId }: LessonContentProps) {
    return (
        <Tabs defaultValue="content" className="w-full">
            <TabsList>
                {[
                    { id: 'content', label: 'Bài học', icon: BookOpen },
                    { id: 'resources', label: 'Tài liệu', icon: FileText, badge: 1 },
                    { id: 'assignments', label: 'Bài tập', icon: ClipboardList },
                    { id: 'comments', label: 'Thảo luận', icon: MessageSquare }
                ].map((tab) => (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="gap-2"
                    >
                        <tab.icon className="size-4" />
                        {tab.label}
                        {tab.badge && (
                            <Badge variant="secondary" className="ml-1 px-1 py-0 h-4 min-w-[16px] text-[9px] font-bold">
                                {tab.badge}
                            </Badge>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>


            <TabsContent value="content" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none mt-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <h3 className="text-lg font-bold text-foreground">
                            Nội dung bài học
                        </h3>
                    </div>

                    <div className="p-6 rounded-lg border bg-muted/20">
                        <div className="space-y-4 text-foreground/80 leading-relaxed text-sm font-medium">
                            {description ? (
                                description.split('\n').map((para: string, i: number) => (
                                    <p key={i}>{para}</p>
                                ))
                            ) : (
                                <p className="text-muted-foreground font-medium">
                                    Nội dung bài học này được giảng viên thiết kế để học viên tự nghiên cứu qua video và các học liệu đi kèm.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="resources" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none mt-6">
                <div className="grid gap-4">
                    <div className="group flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-background rounded-md flex items-center justify-center shrink-0 border shadow-sm transition-all duration-300">
                                <FileText className="size-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-base font-bold text-foreground leading-none">Giáo trình bài học (PDF)</h4>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-2">
                                    <span>PDF</span> <span className="size-1 bg-muted-foreground/30 rounded-full" /> <span>4.2 MB</span>
                                </p>
                            </div>
                        </div>
                        <Button>
                            <Download className="size-4 mr-2" /> Tải tài liệu
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="assignments" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none mt-6">
                {courseMasterId && courseSlug ? (
                    <CourseAssignmentsList courseId={courseMasterId} courseSlug={courseSlug} />
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-lg border bg-muted/20">
                        <div className="size-16 bg-background rounded-lg flex items-center justify-center border shadow-sm">
                            <ClipboardList className="size-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Bài tập khóa học</h4>
                            <p className="text-base font-bold text-foreground">
                                Không thể tải danh sách bài tập
                            </p>
                        </div>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="comments" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none mt-6">
                {lessonId && courseRunId ? (
                    <LessonDiscussion courseRunId={courseRunId} moduleId={moduleId} lessonId={lessonId} />
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-lg border bg-muted/20">
                        <div className="size-16 bg-background rounded-lg flex items-center justify-center border shadow-sm">
                            <MessageSquare className="size-8 text-primary/40" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Diễn đàn thảo luận</h4>
                            <p className="text-2xl font-bold text-foreground tracking-tight">
                                Không thể tải thảo luận
                            </p>
                        </div>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
