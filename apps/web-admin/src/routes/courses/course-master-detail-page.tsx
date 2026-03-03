import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    ChevronLeft,
    Layers,
    CalendarCheck2,
    Edit,
    Trash,
    FileText,
    PenTool,
    ArrowUp,
    ArrowDown,
    HelpCircle,
    PlayCircle,
} from 'lucide-react';


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { useCourse } from '@/lib/api/services/courses';
import { useCourseModules, useReorderModules } from '@/lib/api/services/modules';
import { useModulesLessons } from '@/lib/api/services/lesson';
import { type ModuleResponseDTO, type LessonResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { CreateModuleSheet } from '@/components/modules/create-module-sheet';
import { EditModuleSheet } from '@/components/modules/edit-module-sheet';
const CreateLessonSheet = lazy(() => import('@/components/lessons/create-lesson-sheet'));
import { EditLessonSheet } from '@/components/lessons/edit-lesson-sheet';
import { DeleteModuleDialog } from '@/components/modules/delete-module-dialog';
import { DeleteLessonDialog } from '@/components/lessons/delete-lesson-dialog';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { CourseRunsTable } from '@/components/courses/course-runs-table';
import { ReorderModulesDialog } from '@/components/modules/reorder-modules-dialog';
import { ReorderLessonsDialog } from '@/components/lessons/reorder-lessons-dialog';
import { CourseStatusHeader } from '@/components/courses/course-status-header';
import { CourseVersionHistory } from '@/components/courses/course-version-history';

export default function CourseMasterPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: modulesData } = useCourseModules(id || '');

    // Dialog States
    const [createModuleOpen, setCreateModuleOpen] = useState(false);
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<ModuleResponseDTO | null>(null);

    const [createLessonOpen, setCreateLessonOpen] = useState(false);
    const [selectedModuleIdForLesson, setSelectedModuleIdForLesson] = useState<string | null>(null);
    const [editLessonOpen, setEditLessonOpen] = useState(false);
    const [deleteLessonOpen, setDeleteLessonOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<LessonResponseDTO | null>(null);

    // Reorder dialogs
    const [reorderModulesOpen, setReorderModulesOpen] = useState(false);
    const [reorderLessonsOpen, setReorderLessonsOpen] = useState(false);
    const [reorderLessonsModuleId, setReorderLessonsModuleId] = useState<string | null>(null);
    const [reorderLessonsList, setReorderLessonsList] = useState<LessonResponseDTO[]>([]);

    const modules = modulesData || [];
    const lessonQueries = useModulesLessons(modules);

    const reorderModulesMutation = useReorderModules();

    const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
        const newModules = [...modules];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newModules.length) return;

        const temp = newModules[index];
        newModules[index] = newModules[targetIndex];
        newModules[targetIndex] = temp;

        const moduleOrders = newModules.map((m, i) => ({ id: m.id, orderIndex: i + 1 }));
        try {
            await reorderModulesMutation.mutateAsync({ courseId: id!, moduleOrders });
            toast.success('Đã cập nhật thứ tự học phần');
        } catch (error) {
            toast.error('Không thể cập nhật thứ tự');
        }
    };

    // Drag & drop đã được thay thế bằng dialog xác nhận, nên không dùng DnD nữa.

    const ModuleCard = ({ module, lessons, moduleIdx }: { module: ModuleResponseDTO, lessons: LessonResponseDTO[], moduleIdx: number }) => {
        return (
            <div className="border rounded-lg bg-card/40 p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">#{moduleIdx + 1}</span>
                        <span className="text-sm font-semibold">{module.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => { setSelectedModuleIdForLesson(module.id); setCreateLessonOpen(true); }}
                        >
                            <Plus className="size-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => { setSelectedModule(module); setEditModuleOpen(true); }}
                        >
                            <Edit className="size-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive"
                            onClick={() => { setSelectedModule(module); setDeleteModuleOpen(true); }}
                        >
                            <Trash className="size-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => {
                                setReorderLessonsModuleId(module.id);
                                setReorderLessonsList(lessons);
                                setReorderLessonsOpen(true);
                            }}
                        >
                            Lưu thứ tự bài học
                        </Button>
                        <div className="flex items-center gap-1 ml-2 border-l pl-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg"
                                onClick={(e) => { e.stopPropagation(); handleMoveModule(moduleIdx, 'up'); }}
                                disabled={moduleIdx === 0}
                            >
                                <ArrowUp className="size-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg"
                                onClick={(e) => { e.stopPropagation(); handleMoveModule(moduleIdx, 'down'); }}
                                disabled={moduleIdx === modules.length - 1}
                            >
                                <ArrowDown className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {lessons.length === 0 ? (
                    <div className="text-xs text-muted-foreground/70 italic pl-6 py-1">
                        Chưa có bài học trong học phần này.
                    </div>
                ) : (
                    <div className="space-y-1 pl-6">
                        {lessons.map((lesson: any) => (
                            <LessonRow key={lesson.id} lesson={lesson} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const LessonRow = ({ lesson }: { lesson: any }) => {
        let lessonIcon = <FileText className="size-4" />;
        if (lesson.contentType === 'video') lessonIcon = <PlayCircle className="size-4 text-rose-500" />;
        if (lesson.contentType === 'quiz') lessonIcon = <HelpCircle className="size-4 text-amber-500" />;
        if (lesson.contentType === 'assignment') lessonIcon = <PenTool className="size-4 text-indigo-500" />;

        return (
            <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md border border-transparent hover:border-border/40 hover:bg-muted/30">
                <div className="flex items-center gap-2">
                    {lessonIcon}
                    <span className="text-xs font-semibold">{lesson.title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md"
                        onClick={() => { setSelectedLesson(lesson); setEditLessonOpen(true); }}
                    >
                        <Edit className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md text-destructive"
                        onClick={() => { setSelectedLesson(lesson); setDeleteLessonOpen(true); }}
                    >
                        <Trash className="size-3.5" />
                    </Button>
                </div>
            </div>
        );
    };



    if (isLoadingCourse) {
        return <PageLoading text="Đang tải dữ liệu khóa học..." className="min-h-[60vh]" />;
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold uppercase">Không tìm thấy khung chương trình</h2>
                    <p className="text-sm text-muted-foreground">Khung giáo trình bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/course-master')}>
                    <ChevronLeft className="mr-2 size-4" />
                    Quay về danh sách
                </Button>
            </div>
        );
    }


    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-muted-foreground hover:text-foreground gap-2 transition-colors hover:bg-transparent -ml-2 w-fit group"
                    onClick={() => navigate('/course-master')}
                >
                    <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Danh sách khung chương trình</span>
                </Button>

                <Button
                    size="sm"
                    onClick={() => setCreateModuleOpen(true)}
                >
                    <Plus className="mr-2 size-4" />
                    Thiết kế Syllabus
                </Button>
            </div>

            {/* Course Status Header */}
            <CourseStatusHeader course={course} onStatusChange={() => {
                // Refetch course data on status change
                const timer = setTimeout(() => {
                    window.location.reload();
                }, 1500);
                return () => clearTimeout(timer);
            }} />

            {/* Version History */}
            <CourseVersionHistory courseId={id!} />

            <Tabs defaultValue="curriculum" className="space-y-6">
                <TabsList className="bg-muted/40 p-1 h-auto gap-1">
                    <TabsTrigger value="curriculum" className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                        <Layers className="size-4" />
                        Syllabus & Giáo trình
                    </TabsTrigger>
                    <TabsTrigger value="course-runs" className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                        <CalendarCheck2 className="size-4" />
                        Đợt khai giảng (Runs)
                    </TabsTrigger>
                </TabsList>

                {/* Curriculum Tab */}
                <TabsContent value="curriculum" className="space-y-4">
                    {modules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center gap-6 border border-dashed rounded-xl bg-muted/5">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40">
                                <Layers className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold uppercase tracking-tight">Chưa có Syllabus</h3>
                                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">Khung chương trình này chưa được thiết kế syllabus. Hãy bắt đầu ngay.</p>
                            </div>
                            <Button onClick={() => setCreateModuleOpen(true)} variant="outline">
                                <Plus className="mr-2 size-4" />
                                Thiết kế Syllabus ngay
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <p className="text-xs text-muted-foreground">
                                    Thứ tự hiện tại của học phần và bài học. Dùng các nút lưu để cập nhật vào hệ thống.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-3 text-[11px]"
                                    onClick={() => setReorderModulesOpen(true)}
                                >
                                    Lưu thứ tự học phần
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {modules.map((module, moduleIdx) => {
                                    const lessons = (lessonQueries[moduleIdx]?.data?.data || []) as LessonResponseDTO[];
                                    return (
                                        <ModuleCard key={module.id} module={module} lessons={lessons} moduleIdx={moduleIdx} />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Course Runs Tab - VOD có 1 run, Live có nhiều run */}
                <TabsContent value="course-runs" className="space-y-4">
                    <CourseRunsTable courseId={id!} courseType={course.type as 'vod' | 'live'} />
                </TabsContent>
            </Tabs >


            {/* Dialogs & Sheets */}
            <CreateModuleSheet
                open={createModuleOpen}
                onOpenChange={setCreateModuleOpen}
                courseMasterId={id || ''}
                existingModules={modulesData || []}
                courseTitle={course?.title}
            />
            <EditModuleSheet open={editModuleOpen} onOpenChange={setEditModuleOpen} module={selectedModule} />
            <DeleteModuleDialog open={deleteModuleOpen} onOpenChange={setDeleteModuleOpen} module={selectedModule} />

            <Suspense fallback={<div>Đang tải...</div>}>
                <CreateLessonSheet open={createLessonOpen} onOpenChange={setCreateLessonOpen} moduleId={selectedModuleIdForLesson || ''} />
            </Suspense>
            <EditLessonSheet open={editLessonOpen} onOpenChange={setEditLessonOpen} lesson={selectedLesson} />
            <DeleteLessonDialog open={deleteLessonOpen} onOpenChange={setDeleteLessonOpen} lesson={selectedLesson} />

            <ReorderModulesDialog
                open={reorderModulesOpen}
                onOpenChange={setReorderModulesOpen}
                courseId={id!}
                modules={modules}
            />
            <ReorderLessonsDialog
                open={reorderLessonsOpen}
                onOpenChange={setReorderLessonsOpen}
                moduleId={reorderLessonsModuleId || ''}
                lessons={reorderLessonsList}
            />
        </div >
    );
}
