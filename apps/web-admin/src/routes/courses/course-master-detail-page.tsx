import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    Layers,
    CalendarCheck2,
    FileText,
    PlayCircle,
} from 'lucide-react';


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { useCourse } from '@/lib/api/services/courses';
import { useCourseModules } from '@/lib/api/services/modules';
import { useModulesLessons } from '@/lib/api/services/lesson';
import { type ModuleResponseDTO, type LessonResponseDTO, LessonContentType } from '@workspace/schemas';
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

export default function CourseMasterPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: modulesData } = useCourseModules(id || '');

    // Dialog States
    const [createModuleOpen, setCreateModuleOpen] = useState(false);
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
    const [selectedModule] = useState<ModuleResponseDTO | null>(null);

    const [createLessonOpen, setCreateLessonOpen] = useState(false);
    const [selectedModuleIdForLesson] = useState<string | null>(null);
    const [editLessonOpen, setEditLessonOpen] = useState(false);
    const [deleteLessonOpen, setDeleteLessonOpen] = useState(false);
    const [selectedLesson] = useState<LessonResponseDTO | null>(null);

    // Reorder dialogs
    const [reorderModulesOpen, setReorderModulesOpen] = useState(false);
    const [reorderLessonsOpen, setReorderLessonsOpen] = useState(false);
    const [reorderLessonsModuleId, setReorderLessonsModuleId] = useState<string | null>(null);
    const [reorderLessonsList, setReorderLessonsList] = useState<LessonResponseDTO[]>([]);

    const [versionSheetOpen, setVersionSheetOpen] = useState(false);
    const [selectedLessonForView, setSelectedLessonForView] = useState<LessonResponseDTO | null>(null);
    const [activeLessonModuleId, setActiveLessonModuleId] = useState<string | null>(null);

    const modules = modulesData || [];
    const lessonQueries = useModulesLessons(modules);

    // Drag & drop đã được thay thế bằng dialog xác nhận, nên không dùng DnD nữa.

    const ModuleCard = ({ module, lessons, moduleIdx }: { module: ModuleResponseDTO, lessons: LessonResponseDTO[], moduleIdx: number }) => {
        return (
            <div className="rounded-lg border bg-background">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Chương {moduleIdx + 1}</span>
                        <span className="text-sm font-semibold truncate">
                            {module.title}
                        </span>
                    </div>
                </div>

                <div className="px-3 py-2 space-y-2">
                    {lessons.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                            Chưa có bài học trong chương này.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {lessons.map((lesson) => (
                                <LessonRow key={lesson.id} lesson={lesson} />
                            ))}
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => {
                            setSelectedLessonForView(null);
                            setActiveLessonModuleId(module.id);
                        }}
                    >
                        Thêm bài học
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-[11px] text-muted-foreground"
                        onClick={() => {
                            setReorderLessonsModuleId(module.id);
                            setReorderLessonsList(lessons);
                            setReorderLessonsOpen(true);
                        }}
                    >
                        Lưu thứ tự bài học
                    </Button>
                </div>
            </div>
        );
    };

    const LessonRow = ({ lesson }: { lesson: LessonResponseDTO }) => {
        let lessonIcon = <FileText className="size-4" />;
        if (lesson.contentType === LessonContentType.VIDEO) lessonIcon = <PlayCircle className="size-4 text-rose-500" />;
        if (lesson.contentType === LessonContentType.ARTICLE) lessonIcon = <FileText className="size-4 text-blue-500" />;

        const isSelected = selectedLessonForView?.id === lesson.id;

        return (
            <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md border border-transparent hover:border-border/40 hover:bg-muted/30">
                <button
                    type="button"
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => {
                        setSelectedLessonForView(lesson);
                        setActiveLessonModuleId(null);
                    }}
                >
                    {lessonIcon}
                    <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : ''}`}>{lesson.title}</span>
                </button>
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
                    Quay về danh sách
                </Button>
            </div>
        );
    }


    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        Khung chương trình
                    </p>
                    <p className="text-lg font-semibold">
                        {course.title}
                    </p>
                </div>
            </div>

            {/* Course Status Header */}
            <CourseStatusHeader course={course} onStatusChange={() => {
                // Refetch course data on status change
                const timer = setTimeout(() => {
                    window.location.reload();
                }, 1500);
                return () => clearTimeout(timer);
            }} />

            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVersionSheetOpen(true)}
                >
                    Lịch sử phiên bản
                </Button>
            </div>

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
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
                                {/* Main lesson content */}
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">
                                                {selectedLessonForView
                                                    ? selectedLessonForView.title
                                                    : activeLessonModuleId
                                                        ? 'Tạo bài học mới'
                                                        : 'Chọn một bài học'}
                                            </CardTitle>
                                            <CardDescription>
                                                {selectedLessonForView && 'Form cấu hình bài học.'}
                                                {!selectedLessonForView && activeLessonModuleId && 'Nhập thông tin cho bài học mới.'}
                                                {!selectedLessonForView && !activeLessonModuleId && 'Chọn bài học ở panel bên phải hoặc tạo mới.'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {selectedLessonForView && (
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-muted-foreground">Tiêu đề</p>
                                                        <Input value={selectedLessonForView.title} readOnly />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-muted-foreground">Loại nội dung</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            {selectedLessonForView.contentType}
                                                        </Badge>
                                                    </div>
                                                    {selectedLessonForView.contentType === LessonContentType.ARTICLE ? (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-muted-foreground">Nội dung bài viết</p>
                                                            <RichTextEditor
                                                                initialContent={selectedLessonForView.articleContent || ''}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">
                                                            Bài học này không phải dạng bài viết. Vui lòng chỉnh sửa bằng sheet riêng.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {!selectedLessonForView && activeLessonModuleId && (
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-muted-foreground">Tiêu đề</p>
                                                        <Input placeholder="Nhập tiêu đề bài học..." />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-muted-foreground">Loại nội dung</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            article
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-muted-foreground">Nội dung bài viết</p>
                                                        <RichTextEditor initialContent="" />
                                                    </div>
                                                </div>
                                            )}

                                            {!selectedLessonForView && !activeLessonModuleId && (
                                                <p className="text-sm text-muted-foreground">
                                                    Chưa có bài học nào được chọn.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Modules & lessons tree */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            Cấu trúc syllabus: học phần và bài học.
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
                                    {modules.map((module, moduleIdx) => {
                                        const lessons = (lessonQueries[moduleIdx]?.data?.data || []) as LessonResponseDTO[];
                                        return (
                                            <ModuleCard key={module.id} module={module} lessons={lessons} moduleIdx={moduleIdx} />
                                        );
                                    })}
                                </div>
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

            <Sheet open={versionSheetOpen} onOpenChange={setVersionSheetOpen}>
                <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Lịch sử phiên bản</SheetTitle>
                        <SheetDescription>
                            Xem danh sách các phiên bản đã công bố của khung chương trình này.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            <CourseVersionHistory courseId={id!} />
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div >
    );
}
