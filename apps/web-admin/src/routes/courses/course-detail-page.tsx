
import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { Accordion } from '@workspace/ui/components/accordion';
import {
    Layers,
    Plus,
    ChevronLeft,
    AlertCircle,
    ShieldCheck,
    Fingerprint,
    Zap,
    Clock
} from 'lucide-react';
import { useCourse } from '@/api/services/courses';
import { useModules } from '@/api/services/modules';
import { useModulesLessons } from '@/api/services/lesson';
import type { ModuleResponseDTO, LessonResponseDTO } from '@workspace/schemas';

import { CreateModuleSheet } from '@/components/modules/create-module-sheet.tsx';
import { EditModuleSheet } from '@/components/modules/edit-module-sheet.tsx';
// Lazy load CreateLessonSheet for optimization
const CreateLessonSheet = lazy(() => import('@/components/lessons/create-lesson-sheet.tsx').then(m => ({ default: m.CreateLessonSheet })));

import { EditLessonSheet } from '@/components/lessons/edit-lesson-sheet.tsx';
import { DeleteModuleDialog } from '@/components/modules/delete-module-dialog';
import { DeleteLessonDialog } from '@/components/lessons/delete-lesson-dialog';
import { ModuleItem } from '@/components/modules/module-item';
import { cn } from '@workspace/ui/lib/utils';
import { Card } from '@workspace/ui/components/card';
import { formatDateTime, formatCurrency } from '@/lib/format-utils.ts';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { Can } from '@/lib/guard/can';

import { CreateAssignmentSheet } from '@/components/assignments/create-assignment-sheet.tsx';
import { BookOpen } from 'lucide-react';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: modulesData } = useModules({
        page: 1, limit: 100, courseId: id
    });

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

    const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
    const [assignmentContext, setAssignmentContext] = useState<{
        moduleId?: string;
        lessonId?: string;
    }>({});

    const modules = modulesData?.data || [];

    // Optimized lesson fetching using dedicated hook
    const lessonQueries = useModulesLessons(modules);

    const handleEditModule = (module: ModuleResponseDTO) => {
        setSelectedModule(module);
        setEditModuleOpen(true);
    };

    const handleDeleteModule = (module: ModuleResponseDTO) => {
        setSelectedModule(module);
        setDeleteModuleOpen(true);
    };

    const handleAddLesson = (moduleId: string) => {
        setSelectedModuleIdForLesson(moduleId);
        setCreateLessonOpen(true);
    };

    const handleEditLesson = (lesson: LessonResponseDTO) => {
        setSelectedLesson(lesson);
        setEditLessonOpen(true);
    };

    const handleDeleteLesson = (lesson: LessonResponseDTO) => {
        setSelectedLesson(lesson);
        setDeleteLessonOpen(true);
    };

    const handleAddAssignment = (moduleId?: string, lessonId?: string) => {
        setAssignmentContext({ moduleId, lessonId });
        setCreateAssignmentOpen(true);
    };

    if (isLoadingCourse) {
        return (
            <PageLoading text="Đang tải dữ liệu khóa học..." className="min-h-[60vh]" />
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500 max-w-lg mx-auto px-6">
                <div className="p-6 rounded-3xl bg-destructive/5 border border-destructive/20 relative group">
                    <div className="absolute inset-0 bg-destructive/5 blur-xl rounded-full opacity-50" />
                    <AlertCircle className="size-12 text-destructive/60 relative z-10 mx-auto" />
                </div>
                <div className="space-y-2 text-center relative z-10">
                    <h2 className="text-2xl font-sans font-bold italic tracking-tight uppercase">Không tìm thấy khóa học</h2>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Khóa học bạn yêu cầu không tồn tại hoặc đã bị xóa. <br />
                        Vui lòng kiểm tra lại đường dẫn hoặc quyền truy cập.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="h-10 px-6 rounded-xl border-border/20 bg-background/50 text-xs font-bold uppercase tracking-wider hover:bg-muted/10 transition-all"
                    onClick={() => navigate('/courses')}
                >
                    <ChevronLeft className="mr-2 size-3.5" />
                    Quay về danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-muted-foreground hover:text-foreground gap-2 transition-colors hover:bg-transparent -ml-2 w-fit"
                    onClick={() => navigate('/courses')}
                >
                    <ChevronLeft className="size-4" />
                    <span className="text-xs font-sans font-bold italic uppercase tracking-wider">Quay lại danh sách</span>
                </Button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                                {course.title}
                            </h1>
                            <div className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 uppercase tracking-wide",
                                course.status === 'published'
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}>
                                {course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {course.shortDescription || "Chưa có mô tả ngắn cho khóa học này."}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="hidden lg:flex items-center gap-6 px-6 py-3 rounded-xl bg-background border border-border">
                            <div className="text-center">
                                <p className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/70 mb-0.5">Học phần</p>
                                <p className="text-lg font-bold text-foreground">{modules.length}</p>
                            </div>
                            <div className="w-px h-8 bg-border/50 mx-2" />
                            <div className="text-center">
                                <p className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/70 mb-0.5">Cấp độ</p>
                                <p className="text-lg font-bold text-foreground">{course.jlptLevel || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Can permission="course.manage" roles={["lecturer"]}>
                                <Button
                                    onClick={() => handleAddAssignment()}
                                    variant="outline"
                                    className="h-11 px-6 rounded-xl border-border hover:bg-muted/10 font-bold text-xs uppercase tracking-wide transition-all"
                                >
                                    <BookOpen className="mr-2 size-4" />
                                    Thêm Bài Tập
                                </Button>
                            </Can>
                            <Button
                                onClick={() => setCreateModuleOpen(true)}
                                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wide hover:bg-primary/90 hover:shadow-md transition-all"
                            >
                                <Plus className="mr-2 size-4" />
                                Thêm Học Phần
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Curriculum */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <Layers className="size-5 text-primary" />
                            Cấu Trúc Chương Trình
                        </h2>
                    </div>

                    {modules.length === 0 ? (
                        <div className="p-12 text-center space-y-6 bg-background rounded-xl border border-dashed border-border flex flex-col items-center justify-center min-h-[300px]">
                            <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                                <Layers className="size-8 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-sans font-bold italic uppercase tracking-tight text-foreground">Chưa có nội dung</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Khóa học này chưa có học phần nào. Hãy bắt đầu xây dựng chương trình học ngay.
                                </p>
                            </div>
                            <Button
                                onClick={() => setCreateModuleOpen(true)}
                                variant="outline"
                                className="h-10 rounded-xl px-6 font-medium"
                            >
                                Tạo Học Phần Mới
                            </Button>
                        </div>
                    ) : (
                        <Card className="rounded-xl bg-background border border-border shadow-sm overflow-hidden p-6">
                            <Accordion type="multiple" className="space-y-4">
                                {modules.map((module, idx) => {
                                    const lessonQuery = lessonQueries[idx];
                                    const lessons = lessonQuery?.data?.data || [];
                                    const lessonsLoading = lessonQuery?.isLoading || false;

                                    return (
                                        <div key={module.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                            <ModuleItem
                                                module={module}
                                                lessons={lessons}
                                                isLoading={lessonsLoading}
                                                onEditModule={handleEditModule}
                                                onDeleteModule={handleDeleteModule}
                                                onAddLesson={handleAddLesson}
                                                onAddModuleAssignment={(moduleId) => handleAddAssignment(moduleId)}
                                                onAddLessonAssignment={(moduleId, lessonId) => handleAddAssignment(moduleId, lessonId)}
                                                onEditLesson={handleEditLesson}
                                                onDeleteLesson={handleDeleteLesson}
                                            />
                                        </div>
                                    );
                                })}
                            </Accordion>
                        </Card>
                    )}
                </div>

                {/* Right Column: Metadata & Details */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-xl bg-background border border-border shadow-sm p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-border">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Fingerprint className="size-4" />
                                </div>
                                <h3 className="text-sm font-sans font-bold italic uppercase tracking-wide text-foreground">Thông Tin Chi Tiết</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/70">Mã khóa học</p>
                                    <p className="text-xs font-mono font-medium text-foreground bg-muted/30 px-2 py-1.5 rounded-md truncate select-all border border-border/50">
                                        {course.id}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/70">Học phí</p>
                                    <p className="text-xl font-bold text-emerald-600 tracking-tight">{formatCurrency(course.price)}</p>
                                    {course.discountPrice && (
                                        <p className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                                            {formatCurrency(course.discountPrice)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border space-y-3">
                            <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                <Clock className="size-4" />
                                <p className="text-xs font-medium">Cập nhật: {formatDateTime(course.updatedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2.5 text-emerald-600">
                                <ShieldCheck className="size-4" />
                                <p className="text-xs font-medium">Nội dung đã được kiểm duyệt</p>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Guide */}
                    <div className="p-5 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Zap className="size-4 fill-current" />
                            <h4 className="text-xs font-sans font-bold italic uppercase tracking-wide">Mẹo quản trị</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Cấu trúc chương trình học rõ ràng giúp học viên dễ dàng theo dõi. Hãy chia nhỏ nội dung thành các bài học vừa phải.
                        </p>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <CreateModuleSheet
                open={createModuleOpen}
                onOpenChange={setCreateModuleOpen}
                courseId={id}
                courseTitle={course.title}
                existingModules={modules}
            />

            <CreateAssignmentSheet
                open={createAssignmentOpen}
                onOpenChange={setCreateAssignmentOpen}
                courseId={id}
                moduleId={assignmentContext.moduleId}
                lessonId={assignmentContext.lessonId}
            />

            {selectedModule && (
                <>
                    <EditModuleSheet
                        open={editModuleOpen}
                        onOpenChange={setEditModuleOpen}
                        module={selectedModule}
                        existingModules={modules}
                        courseTitle={course.title}
                    />
                    <DeleteModuleDialog
                        open={deleteModuleOpen}
                        onOpenChange={setDeleteModuleOpen}
                        module={selectedModule}
                    />
                </>
            )}

            {selectedModuleIdForLesson && (
                <Suspense fallback={null}>
                    <CreateLessonSheet
                        open={createLessonOpen}
                        onOpenChange={setCreateLessonOpen}
                        moduleId={selectedModuleIdForLesson || ''}
                    />
                </Suspense>
            )}

            {selectedLesson && (
                <>
                    <EditLessonSheet
                        open={editLessonOpen}
                        onOpenChange={setEditLessonOpen}
                        lesson={selectedLesson}
                    />
                    <DeleteLessonDialog
                        open={deleteLessonOpen}
                        onOpenChange={setDeleteLessonOpen}
                        lesson={selectedLesson}
                    />
                </>
            )}
        </div>
    );
}
