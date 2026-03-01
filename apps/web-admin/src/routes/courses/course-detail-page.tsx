import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    ChevronLeft,
    AlertCircle,
    Layers,
    CalendarCheck2,
    Edit,
    Trash,
    MoreVertical,
    FileText,
    PenTool,
    ArrowUp,
    ArrowDown,
    HelpCircle,
    Users,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Badge } from '@workspace/ui/components/badge';
import { useCourse } from '@/lib/api/services/courses';
import { useCourseModules, useReorderModules } from '@/lib/api/services/modules';
import { useModulesLessons, useReorderLessons } from '@/lib/api/services/lesson';
import { EnrollmentStatus, type ModuleResponseDTO, type LessonResponseDTO, type AssignmentResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import {
    useAssignments,
    useDeleteAssignment,
    usePublishAssignment
} from '@/lib/api/services/assignments';
import { CreateModuleSheet } from '@/components/modules/create-module-sheet.tsx';
import { EditModuleSheet } from '@/components/modules/edit-module-sheet.tsx';
const CreateLessonSheet = lazy(() => import('@/components/lessons/create-lesson-sheet.tsx').then(m => ({ default: m.CreateLessonSheet })));
import { EditLessonSheet } from '@/components/lessons/edit-lesson-sheet.tsx';
import { DeleteModuleDialog } from '@/components/modules/delete-module-dialog';
import { DeleteLessonDialog } from '@/components/lessons/delete-lesson-dialog';
import { PageHeader } from '@/components/common/page-header';
import { AssignmentsTable } from '@/components/assignments/assignments-table';
import { CreateAssignmentSheet } from '@/components/assignments/create-assignment-sheet';
import { EditAssignmentSheet } from '@/components/assignments/edit-assignment-sheet';
import { QuizzesTable } from '@/components/quizzes/quizzes-table';
import { CreateQuizSheet } from '@/components/quizzes/create-quiz-sheet';
import { EditQuizSheet } from '@/components/quizzes/edit-quiz-sheet';
import { useQuizzes, useDeleteQuiz, usePublishQuiz, type QuizDTO } from '@/lib/api/services/quizzes';
import { useEnrollmentsByCourse } from '@/lib/api/services/enrollments';
import { Progress } from '@workspace/ui/components/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';

import { cn } from '@workspace/ui/lib/utils';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { SmartPagination } from '@/components/common/smart-pagination';
import { CourseRunsTable } from '@/components/courses/course-runs-table';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: modulesData } = useCourseModules(id || '');
    const { data: enrollments, isLoading: isLoadingEnrollments } = useEnrollmentsByCourse(id || '');

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

    // Assignment States
    const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
    const [selectedModuleIdForAssignment, setSelectedModuleIdForAssignment] = useState<string | null>(null);
    const [selectedLessonIdForAssignment, setSelectedLessonIdForAssignment] = useState<string | null>(null);
    const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponseDTO | null>(null);

    // Quiz States
    const [createQuizOpen, setCreateQuizOpen] = useState(false);
    const [selectedModuleIdForQuiz, setSelectedModuleIdForQuiz] = useState<string | null>(null);
    const [selectedLessonIdForQuiz, setSelectedLessonIdForQuiz] = useState<string | null>(null);
    const [editQuizOpen, setEditQuizOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizDTO | null>(null);
    const [quizPage] = useState(1);



    const [assignmentPage, setAssignmentPage] = useState(1);

    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    const modules = modulesData || [];
    const lessonQueries = useModulesLessons(modules);

    const reorderModulesMutation = useReorderModules();
    const reorderLessonsMutation = useReorderLessons();

    const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
        const newModules = [...modules];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newModules.length) return;

        // Swap
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

    const handleMoveLesson = async (moduleIdx: number, lessonIdx: number, direction: 'up' | 'down') => {
        const lessons = [...(lessonQueries[moduleIdx]?.data?.data || [])];
        const targetIndex = direction === 'up' ? lessonIdx - 1 : lessonIdx + 1;
        if (targetIndex < 0 || targetIndex >= lessons.length) return;

        // Swap
        const temp = lessons[lessonIdx];
        lessons[lessonIdx] = lessons[targetIndex];
        lessons[targetIndex] = temp;

        const lessonOrders = lessons.map((l, i) => ({ id: l.id, orderIndex: i + 1 }));
        try {
            await reorderLessonsMutation.mutateAsync({ moduleId: modules[moduleIdx].id, lessonOrders });
            toast.success('Đã cập nhật thứ tự bài học');
        } catch (error) {
            toast.error('Không thể cập nhật thứ tự');
        }
    };

    // Assignment Hooks
    const { data: assignmentsData, isLoading: isLoadingAssignments } = useAssignments({
        courseMasterId: id,
        page: assignmentPage,
        limit: 50,
    });
    const publishAssignmentMutation = usePublishAssignment();
    const deleteAssignmentMutation = useDeleteAssignment();

    // Quiz Hooks
    const { data: quizzesData, isLoading: isLoadingQuizzes } = useQuizzes({
        courseMasterId: id,
        page: quizPage,
        limit: 50,
    });
    const publishQuizMutation = usePublishQuiz();
    const deleteQuizMutation = useDeleteQuiz();


    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const handlePublishAssignment = async (assignment: AssignmentResponseDTO) => {
        try {
            await publishAssignmentMutation.mutateAsync(assignment.id);
            toast.success(`Đã công bố bài tập: ${assignment.title}`);
        } catch (error) {
            toast.error("Công bố thất bại");
        }
    };

    const handleDeleteAssignment = async (assignment: AssignmentResponseDTO) => {
        if (!confirm(`Bạn có chắc muốn xóa bài tập "${assignment.title}"?`)) return;
        try {
            await deleteAssignmentMutation.mutateAsync(assignment.id);
            toast.success("Đã xóa bài tập");
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    const handleEditAssignment = (assignment: AssignmentResponseDTO) => {
        setSelectedAssignment(assignment);
        setEditAssignmentOpen(true);
    };

    const handleViewSubmissions = (assignment: AssignmentResponseDTO) => {
        navigate(`/courses/${id}/assignments/${assignment.id}/submissions`);
    };

    // Quiz handlers
    const handlePublishQuiz = async (quiz: QuizDTO) => {
        try {
            await publishQuizMutation.mutateAsync(quiz.id);
            toast.success(`Đã công bố quiz: ${quiz.title}`);
        } catch {
            toast.error('Công bố thất bại');
        }
    };

    const handleDeleteQuiz = async (quiz: QuizDTO) => {
        if (!confirm(`Bạn có chắc muốn xóa quiz "${quiz.title}"?`)) return;
        try {
            await deleteQuizMutation.mutateAsync(quiz.id);
            toast.success('Đã xóa quiz');
        } catch {
            toast.error('Xóa thất bại');
        }
    };

    const handleEditQuiz = (quiz: QuizDTO) => {
        setSelectedQuiz(quiz);
        setEditQuizOpen(true);
    };



    if (isLoadingCourse) {
        return <PageLoading text="Đang tải dữ liệu khóa học..." className="min-h-[60vh]" />;
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <AlertCircle className="size-6" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Không tìm thấy khóa học</h2>
                    <p className="text-sm text-muted-foreground">Khóa học bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/courses')}>
                    <ChevronLeft className="mr-2 size-4" />
                    Quay về danh sách
                </Button>
            </div>
        );
    }


    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-muted-foreground hover:text-foreground gap-2 transition-colors hover:bg-transparent -ml-2 w-fit group"
                    onClick={() => navigate('/courses')}
                >
                    <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Quay lại danh sách</span>
                </Button>

                <PageHeader
                    title={course.title}
                    subtitle={course.shortDescription || "Chưa có mô tả ngắn cho khóa học này."}
                    stats={[
                        { label: "Trình độ", value: course.jlptLevel || 'N/A' },
                        { label: "Bài học", value: course.totalLessons || 0 },
                        { label: "Quiz", value: course.totalQuizzes || 0 },
                        { label: "Live session", value: course.type === 'live' ? 'Lớp học' : 'VOD' },
                    ]}
                    actions={
                        <Button
                            onClick={() => setCreateModuleOpen(true)}
                        >
                            <Plus className="mr-2 size-4" />
                            Thêm Học Phần
                        </Button>
                    }
                />
            </div>

            <Tabs defaultValue="curriculum" className="space-y-6">
                <TabsList className="bg-muted/40 p-1 h-auto gap-1">
                    <TabsTrigger value="curriculum" className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                        <Layers className="size-4" />
                        Chương Trình
                    </TabsTrigger>
                    {course?.type === 'live' && (
                        <TabsTrigger value="course-runs" className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                            <CalendarCheck2 className="size-4" />
                            Danh sách Lớp (Runs)
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="assignments" className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                        <PenTool className="size-4" />
                        Bài Tập
                    </TabsTrigger>
                    <TabsTrigger value="quizzes" className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                        <HelpCircle className="size-4" />
                        Quiz
                    </TabsTrigger>
                    <TabsTrigger value="students" className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                        <Users className="size-4" />
                        Học viên
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
                                <h3 className="text-lg font-semibold uppercase tracking-tight">Chưa có nội dung</h3>
                                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">Khóa học này chưa có học phần nào. Hãy bắt đầu xây dựng chương trình học ngay.</p>
                            </div>
                            <Button onClick={() => setCreateModuleOpen(true)} variant="outline">
                                <Plus className="mr-2 size-4" />
                                Tạo Học Phần Mới
                            </Button>
                        </div>
                    ) : (
                        <Card className="overflow-hidden shadow-sm border-border">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/30 border-b border-border">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-12">#</TableHead>
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Học phần / Bài học</TableHead>
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-32">Loại</TableHead>
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-24">Thứ tự</TableHead>
                                            <TableHead className="text-right h-11 text-xs font-semibold text-muted-foreground px-4 w-32">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modules.map((module, moduleIdx) => {
                                            const lessonQuery = lessonQueries[moduleIdx];
                                            const lessons = lessonQuery?.data?.data || [];
                                            const isExpanded = expandedModules.has(module.id);

                                            return (
                                                <>
                                                    <TableRow key={module.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                                        <TableCell className="font-mono text-xs text-muted-foreground border-r border-border/30">{moduleIdx + 1}</TableCell>
                                                        <TableCell className="border-r border-border/30">
                                                            <div className="flex items-center gap-3">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-6 rounded-lg"
                                                                    onClick={() => toggleModule(module.id)}
                                                                >
                                                                    <ChevronLeft className={cn("size-3 transition-transform", isExpanded && "-rotate-90")} />
                                                                </Button>
                                                                <div>
                                                                    <p className="font-semibold text-sm">{module.title}</p>
                                                                    {module.description && <p className="text-xs text-muted-foreground line-clamp-1">{module.description}</p>}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="border-r border-border/30">
                                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                                                                Học phần
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium border-r border-border/30">{module.orderIndex}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreVertical className="size-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="rounded-xl border-border/40 shadow-xl min-w-[160px] p-1.5">
                                                                    <DropdownMenuItem onClick={() => { setSelectedModuleIdForLesson(module.id); setCreateLessonOpen(true); }} className="rounded-lg gap-2 py-2">
                                                                        <Plus className="size-3.5" /> <span className="font-bold text-xs uppercase">Thêm bài học</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        setSelectedModuleIdForAssignment(module.id);
                                                                        setSelectedLessonIdForAssignment(null);
                                                                        setCreateAssignmentOpen(true);
                                                                    }} className="rounded-lg gap-2 py-2">
                                                                        <PenTool className="size-3.5" /> <span className="font-bold text-xs uppercase">Thêm bài tập</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => { setSelectedModule(module); setEditModuleOpen(true); }} className="rounded-lg gap-2 py-2">
                                                                        <Edit className="size-3.5" /> <span className="font-bold text-xs uppercase">Sửa</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleMoveModule(moduleIdx, 'up')} disabled={moduleIdx === 0} className="rounded-lg gap-2 py-2">
                                                                        <ArrowUp className="size-3.5" /> <span className="font-bold text-xs uppercase">Di chuyển lên</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleMoveModule(moduleIdx, 'down')} disabled={moduleIdx === modules.length - 1} className="rounded-lg gap-2 py-2">
                                                                        <ArrowDown className="size-3.5" /> <span className="font-bold text-xs uppercase">Di chuyển xuống</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => { setSelectedModule(module); setDeleteModuleOpen(true); }} className="rounded-lg text-destructive focus:bg-destructive/10 gap-2 py-2">
                                                                        <Trash className="size-3.5" /> <span className="font-bold text-xs uppercase">Xóa</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isExpanded && lessons.map((lesson, lessonIdx) => (
                                                        <TableRow key={lesson.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors bg-muted/5">
                                                            <TableCell className="font-mono text-xs text-muted-foreground border-r border-border/30 pl-8">{moduleIdx + 1}.{lessonIdx + 1}</TableCell>
                                                            <TableCell className="border-r border-border/30 pl-12">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="size-4 text-primary" />
                                                                    <div>
                                                                        <p className="font-medium text-sm">{lesson.title}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="border-r border-border/30">
                                                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                                                                    Bài học
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm font-medium border-r border-border/30">{lesson.orderIndex}</TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon">
                                                                            <MoreVertical className="size-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="rounded-xl border-border/40 shadow-xl min-w-[160px] p-1.5">
                                                                        <DropdownMenuItem onClick={() => { setSelectedLesson(lesson); setEditLessonOpen(true); }} className="rounded-lg gap-2 py-2">
                                                                            <Edit className="size-3.5" /> <span className="font-bold text-xs uppercase">Sửa</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => {
                                                                            setSelectedModuleIdForAssignment(module.id);
                                                                            setSelectedLessonIdForAssignment(lesson.id);
                                                                            setCreateAssignmentOpen(true);
                                                                        }} className="rounded-lg gap-2 py-2">
                                                                            <PenTool className="size-3.5" /> <span className="font-bold text-xs uppercase">Thêm bài tập</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleMoveLesson(moduleIdx, lessonIdx, 'up')} disabled={lessonIdx === 0} className="rounded-lg gap-2 py-2">
                                                                            <ArrowUp className="size-3.5" /> <span className="font-bold text-xs uppercase">Di chuyển lên</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleMoveLesson(moduleIdx, lessonIdx, 'down')} disabled={lessonIdx === lessons.length - 1} className="rounded-lg gap-2 py-2">
                                                                            <ArrowDown className="size-3.5" /> <span className="font-bold text-xs uppercase">Di chuyển xuống</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => { setSelectedLesson(lesson); setDeleteLessonOpen(true); }} className="rounded-lg text-destructive focus:bg-destructive/10 gap-2 py-2">
                                                                            <Trash className="size-3.5" /> <span className="font-bold text-xs uppercase">Xóa</span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Course Runs Tab - only for live courses */}
                {course?.type === 'live' && (
                    <TabsContent value="course-runs" className="space-y-4">
                        <CourseRunsTable courseId={id!} />
                    </TabsContent>
                )}

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Quản lý bài tập về nhà và các bài kiểm tra định kỳ</p>
                        <Button
                            onClick={() => {
                                setSelectedModuleIdForAssignment(null);
                                setSelectedLessonIdForAssignment(null);
                                setCreateAssignmentOpen(true);
                            }}
                        >
                            <Plus className="mr-2 size-4" />
                            Thêm bài tập mới
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <Card className="overflow-hidden shadow-sm border-border">
                            <CardContent className="p-0">
                                <div className="bg-card/20 backdrop-blur-sm overflow-x-auto">
                                    <AssignmentsTable
                                        data={assignmentsData?.data || []}
                                        isLoading={isLoadingAssignments}
                                        onEdit={handleEditAssignment}
                                        onDelete={handleDeleteAssignment}
                                        onPublish={handlePublishAssignment}
                                        onViewSubmissions={handleViewSubmissions}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {assignmentsData && assignmentsData.totalPages > 1 && (
                            <div className="flex justify-end">
                                <SmartPagination
                                    page={assignmentPage}
                                    totalItems={assignmentsData.total}
                                    totalPages={assignmentsData.totalPages}
                                    onPageChange={setAssignmentPage}
                                    itemName="bài tập"
                                />
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Quizzes Tab */}
                <TabsContent value="quizzes" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Quản lý quiz kiểm tra kiến thức cho học viên</p>
                        <Button onClick={() => {
                            setSelectedLessonIdForQuiz(null);
                            setSelectedModuleIdForQuiz(null);
                            setCreateQuizOpen(true);
                        }}>
                            <Plus className="mr-2 size-4" />
                            Thêm Quiz mới
                        </Button>
                    </div>

                    <Card className="overflow-hidden shadow-sm border-border">
                        <CardContent className="p-0">
                            <div className="bg-card/20 backdrop-blur-sm overflow-x-auto">
                                <QuizzesTable
                                    data={quizzesData?.data || []}
                                    isLoading={isLoadingQuizzes}
                                    onEdit={handleEditQuiz}
                                    onDelete={handleDeleteQuiz}
                                    onPublish={handlePublishQuiz}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Danh sách học viên đang tham gia khóa học này</p>
                    </div>

                    <Card className="overflow-hidden shadow-sm border-border">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30 border-b border-border">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Học viên</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Ngày tham gia</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Tiến độ</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingEnrollments ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={4}><PageLoading text="Đang tải..." /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : enrollments && enrollments.length > 0 ? (
                                        enrollments.map((enrollment) => (
                                            <TableRow key={enrollment.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={enrollment.user?.avatarUrl || ''} />
                                                            <AvatarFallback>{enrollment.user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{enrollment.user?.displayName || 'Unknown'}</span>
                                                            <span className="text-[10px] text-muted-foreground font-mono">{enrollment.user?.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-sm">
                                                    {new Date(enrollment.enrollmentDate).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 w-[200px]">
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                                            <span>Tiến độ</span>
                                                            <span className="text-primary">{Math.round(enrollment.completionPercentage)}%</span>
                                                        </div>
                                                        <Progress value={enrollment.completionPercentage} className="h-1.5" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <Badge variant={enrollment.completionStatus === EnrollmentStatus.COMPLETED ? 'success' as any : 'secondary'}>
                                                        {enrollment.completionStatus === EnrollmentStatus.COMPLETED ? 'Hoàn thành' : 'Đang học'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                                                Chưa có học viên nào tham gia
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs >


            {/* Dialogs & Sheets */}
            < CreateModuleSheet open={createModuleOpen} onOpenChange={setCreateModuleOpen} courseId={id || ''} />
            < EditModuleSheet open={editModuleOpen} onOpenChange={setEditModuleOpen} module={selectedModule} />
            <DeleteModuleDialog open={deleteModuleOpen} onOpenChange={setDeleteModuleOpen} module={selectedModule} />

            <Suspense fallback={<div>Đang tải...</div>}>
                <CreateLessonSheet open={createLessonOpen} onOpenChange={setCreateLessonOpen} moduleId={selectedModuleIdForLesson || ''} />
            </Suspense>
            <EditLessonSheet open={editLessonOpen} onOpenChange={setEditLessonOpen} lesson={selectedLesson} />
            <DeleteLessonDialog open={deleteLessonOpen} onOpenChange={setDeleteLessonOpen} lesson={selectedLesson} />

            <CreateAssignmentSheet
                open={createAssignmentOpen}
                onOpenChange={setCreateAssignmentOpen}
                courseMasterId={id}
                moduleId={selectedModuleIdForAssignment || undefined}
                lessonId={selectedLessonIdForAssignment || undefined}
            />
            <EditAssignmentSheet
                open={editAssignmentOpen}
                onOpenChange={setEditAssignmentOpen}
                assignment={selectedAssignment}
            />
            <CreateQuizSheet
                open={createQuizOpen}
                onOpenChange={setCreateQuizOpen}
                courseMasterId={id}
                moduleId={selectedModuleIdForQuiz || undefined}
                lessonId={selectedLessonIdForQuiz || undefined}
            />
            <EditQuizSheet
                open={editQuizOpen}
                onOpenChange={setEditQuizOpen}
                quiz={selectedQuiz as any}
            />
        </div >
    );
}
