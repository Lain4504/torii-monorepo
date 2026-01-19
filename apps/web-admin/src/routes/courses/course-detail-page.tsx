
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    Target, Clock
} from 'lucide-react';
import { useCourse } from '@/api/services/courses';
import { useModules } from '@/api/services/modules';
import { useModulesLessons } from '@/api/services/lesson';
import type { ModuleResponseDTO, LessonResponseDTO } from '@workspace/schemas';

import { CreateModuleSheet } from '@/components/modules/create-module-sheet.tsx';
import { EditModuleSheet } from '@/components/modules/edit-module-sheet.tsx';
import { CreateLessonSheet } from '@/components/lessons/create-lesson-sheet.tsx';
import { EditLessonSheet } from '@/components/lessons/edit-lesson-sheet.tsx';
import { DeleteModuleDialog } from '@/components/modules/delete-module-dialog';
import { DeleteLessonDialog } from '@/components/lessons/delete-lesson-dialog';
import { ModuleItem } from '@/components/modules/module-item';
import { cn } from '@workspace/ui/lib/utils';
import { Card } from '@workspace/ui/components/card';
import { formatDateTime } from '@/lib/format-utils.ts';
import { PageLoading } from '@workspace/ui/components/page-loading';

export default function CourseDetailPage() {
    const { t } = useTranslation(['admin', 'common']);
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

    if (isLoadingCourse) {
        return (
            <PageLoading text={t('common.loading', 'Loading Course Data...')} className="min-h-[60vh]" />
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
                    <h2 className="text-2xl font-bold tracking-tight">Course Not Found</h2>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        The course you requested could not be found. <br />
                        It may have been moved, deleted, or you may not have permission to view it.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="h-10 px-6 rounded-xl border-border/20 bg-background/50 text-xs font-medium uppercase tracking-wider hover:bg-muted/10 transition-all"
                    onClick={() => navigate('/courses')}
                >
                    <ChevronLeft className="mr-2 size-3.5" />
                    {t('courseDetail.backToCourses', 'Back to Courses')}
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-40 animate-in fade-in duration-700">
            {/* Zen Ambient Backgrounds */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-primary/[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-blue-500/[0.02] blur-[100px] rounded-full" />
            </div>

            {/* Premium Sticky Header */}
            <div className="sticky top-0 z-40 bg-background/40 backdrop-blur-3xl border-b border-border/10 px-0 py-4 md:px-8 md:py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 px-0 md:px-0">
                    <div className="space-y-4 min-w-0 px-3 md:px-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-0 text-muted-foreground/60 hover:text-primary gap-2 transition-all hover:bg-transparent"
                            onClick={() => navigate('/courses')}
                        >
                            <ChevronLeft className="size-4" />
                            <span className="text-xs font-medium tracking-wide">{t('courseDetail.backToCourses', 'Back to Courses')}</span>
                        </Button>
                        <div className="flex items-center gap-4 overflow-hidden">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate py-1">
                                {course.title}
                            </h1>
                            <div className={cn(
                                "hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm flex-shrink-0",
                                course.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            )}>
                                <div className={cn("size-1.5 rounded-full mr-2", course.status === 'published' && 'bg-emerald-500')} />
                                {course.status === 'published' ? t('courseDetail.published', 'Published') : t('courseDetail.draft', 'Draft')}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0 px-3 md:px-0">
                        <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-muted/20 border border-border/10 hidden lg:flex">
                            <div className="text-center">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-0.5">{t('courseDetail.modulesCount', 'Modules')}</p>
                                <p className="text-xl font-bold text-foreground">{modules.length}</p>
                            </div>
                            <div className="w-px h-8 bg-border/20 mx-2" />
                            <div className="text-center">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-0.5">{t('courseDetail.level', 'Level')}</p>
                                <p className="text-xl font-bold text-foreground">{course.jlptLevel || 'N/A'}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setCreateModuleOpen(true)}
                            className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group"
                        >
                            {t('courseDetail.addModule', 'Add Module')}
                            <Plus className="ml-2 size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Portal */}
            <div className="max-w-7xl mx-auto px-0 py-8 md:px-8 md:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Curriculum */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between px-1">
                            <div className="space-y-1 px-3 md:px-0">
                                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-3">
                                    <Target className="size-5 text-primary" />
                                    {t('courseDetail.curriculum', 'Curriculum Structure')}
                                </h2>
                                <p className="text-xs font-medium text-muted-foreground pl-8">{t('courseDetail.curriculumDesc', 'Organize lessons and modules for this course.')}</p>
                            </div>
                        </div>

                        {modules.length === 0 ? (
                            <div className="p-12 text-center space-y-6 bg-muted/10 rounded-3xl border border-dashed border-border/20 relative overflow-hidden group mx-3 md:mx-0">
                                <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
                                <div className="w-16 h-16 rounded-2xl bg-background shadow-sm flex items-center justify-center mx-auto relative group-hover:scale-105 transition-transform duration-500">
                                    <Layers className="size-8 text-primary/40" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h3 className="text-lg font-semibold text-foreground">{t('courseDetail.emptyTitle', 'Course is Empty')}</h3>
                                    <p className="text-xs font-medium text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                        {t('courseDetail.emptyDesc', 'This course has no content yet. Create your first module to get started.')}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setCreateModuleOpen(true)}
                                    className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/10"
                                >
                                    {t('courseDetail.createFirstModule', 'Create First Module')}
                                </Button>
                            </div>
                        ) : (
                            <Card className="rounded-3xl bg-background/50 backdrop-blur-3xl border border-border/20 shadow-xl shadow-black/5 overflow-hidden p-6 lg:p-8">
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
                    <div className="lg:col-span-4 space-y-6 px-3 md:px-0">
                        <Card className="rounded-3xl bg-background/50 backdrop-blur-3xl border border-border/20 p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Fingerprint className="size-4" />
                                    </div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">{t('courseDetail.courseInfo', 'Course Info')}</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-0.5 px-1">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">ID</p>
                                        <p className="text-xs font-mono font-medium text-foreground truncate select-all">{course.id}</p>
                                    </div>
                                    <div className="space-y-0.5 px-1">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{t('courseDetail.price', 'Price')}</p>
                                        <p className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(course.price)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/10 space-y-4">
                                <div className="flex items-center gap-2 text-muted-foreground/70 transition-colors hover:text-foreground">
                                    <Clock className="size-3.5" />
                                    <p className="text-xs font-medium">{t('courseDetail.updated', 'Updated')}: {formatDateTime(course.updatedAt)}</p>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600/80">
                                    <ShieldCheck className="size-3.5" />
                                    <p className="text-xs font-medium">{t('courseDetail.verifiedContent', 'Verified Content')}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Guide / Help */}
                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <Zap className="size-4" />
                                <h4 className="text-xs font-semibold uppercase tracking-wider">{t('courseDetail.quickTip', 'Quick Tip')}</h4>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
                                {t('courseDetail.quickTipDesc', 'Use high-impact cover images and clear descriptions to improve course discoverability.')}
                            </p>
                        </div>
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
                <CreateLessonSheet
                    open={createLessonOpen}
                    onOpenChange={setCreateLessonOpen}
                    moduleId={selectedModuleIdForLesson || ''}
                />
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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};
