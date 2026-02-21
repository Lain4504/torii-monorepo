import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    ChevronLeft,
    AlertCircle,
    Layers,
    Video,
    CalendarCheck2,
    Edit,
    Trash,
    MoreHorizontal,
    PlayCircle,
    StopCircle,
    Settings,
    FileText,
    PenTool
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
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
import { useCourse } from '@/api/services/courses';
import { useCourseModules } from '@/api/services/modules';
import { useModulesLessons } from '@/api/services/lesson';
import {
    useLiveSessions,
    useDeleteLiveSession,
    useStartLiveSession,
    useEndLiveSession,
    liveSessionsApi
} from '@/api/services/live-sessions';
import type { ModuleResponseDTO, LessonResponseDTO, AssignmentResponseDTO } from '@workspace/schemas';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from '@workspace/ui/components/sonner';
import {
    useAssignments,
    useDeleteAssignment,
    usePublishAssignment
} from '@/api/services/assignments';
import { CreateModuleSheet } from '@/components/modules/create-module-sheet.tsx';
import { EditModuleSheet } from '@/components/modules/edit-module-sheet.tsx';
const CreateLessonSheet = lazy(() => import('@/components/lessons/create-lesson-sheet.tsx').then(m => ({ default: m.CreateLessonSheet })));
import { EditLessonSheet } from '@/components/lessons/edit-lesson-sheet.tsx';
import { DeleteModuleDialog } from '@/components/modules/delete-module-dialog';
import { DeleteLessonDialog } from '@/components/lessons/delete-lesson-dialog';
import { TeachingScheduleSheet } from '@/components/courses/teaching-schedule-sheet';
import { AssignmentsTable } from '@/components/assignments/assignments-table';
import { CreateAssignmentSheet } from '@/components/assignments/create-assignment-sheet';
import { EditAssignmentSheet } from '@/components/assignments/edit-assignment-sheet';
import { cn } from '@workspace/ui/lib/utils';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { PageHeader } from '@/components/common/page-header';
import { SmartPagination } from '@/components/common/smart-pagination';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: modulesData } = useCourseModules(id || '');
    const { data: liveSessions } = useLiveSessions(id || '');

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
    const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);

    // Assignment States
    const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
    const [selectedModuleIdForAssignment, setSelectedModuleIdForAssignment] = useState<string | null>(null);
    const [selectedLessonIdForAssignment, setSelectedLessonIdForAssignment] = useState<string | null>(null);
    const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponseDTO | null>(null);
    const [assignmentPage, setAssignmentPage] = useState(1);

    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    const modules = modulesData || [];
    const lessonQueries = useModulesLessons(modules);

    const deleteLiveSessionMutation = useDeleteLiveSession();
    const startMutation = useStartLiveSession();
    const endMutation = useEndLiveSession();

    // Assignment Hooks
    const { data: assignmentsData, isLoading: isLoadingAssignments } = useAssignments({
        courseId: id,
        page: assignmentPage,
        limit: 50,
    });
    const publishAssignmentMutation = usePublishAssignment();
    const deleteAssignmentMutation = useDeleteAssignment();

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const handleDeleteLiveSession = async (sessionId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa buổi học này?')) return;
        try {
            await deleteLiveSessionMutation.mutateAsync({ id: sessionId, courseId: course!.id });
            toast.success('Đã xóa buổi học');
        } catch (error) {
            toast.error('Không thể xóa buổi học');
        }
    };

    const handleStartLiveSession = async (sessionId: string) => {
        try {
            await startMutation.mutateAsync(sessionId);
            toast.success('Đã bắt đầu buổi học');
        } catch (error) {
            toast.error('Không thể bắt đầu buổi học');
        }
    };

    const handleEndLiveSession = async (sessionId: string) => {
        try {
            await endMutation.mutateAsync(sessionId);
            toast.info('Đã kết thúc buổi học');
        } catch (error) {
            toast.error('Không thể kết thúc buổi học');
        }
    };

    const handleJoinLiveSession = async (sessionId: string) => {
        try {
            const joinData = await liveSessionsApi.join(sessionId);
            const meetUrl = import.meta.env.VITE_MEET_URL || 'https://meet.torii.com';
            window.open(`${meetUrl}?access_token=${joinData.token}`, '_blank');
            toast.success('Đang tham gia buổi học');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tham gia buổi học');
        }
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
        navigate(`/assignments/${assignment.id}/submissions`);
    };

    if (isLoadingCourse) {
        return <PageLoading text="Đang tải dữ liệu khóa học..." className="min-h-[60vh]" />;
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500 max-w-lg mx-auto px-6">
                <div className="p-6 rounded-3xl bg-destructive/5 border border-destructive/20">
                    <AlertCircle className="size-12 text-destructive/60 mx-auto" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-sans font-bold italic tracking-tight uppercase">Không tìm thấy khóa học</h2>
                    <p className="text-xs font-medium text-muted-foreground">Khóa học bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
                </div>
                <Button variant="outline" className="h-10 px-6 rounded-xl" onClick={() => navigate('/courses')}>
                    <ChevronLeft className="mr-2 size-3.5" />
                    Quay về danh sách
                </Button>
            </div>
        );
    }

    const sortedSessions = liveSessions?.sort((a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    ) || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
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

                <PageHeader
                    title={course.title}
                    subtitle={course.shortDescription || "Chưa có mô tả ngắn cho khóa học này."}
                    stats={[
                        { label: "Học phần", value: modules.length },
                        { label: "Cấp độ", value: course.jlptLevel || 'N/A' },
                        { label: "Buổi học live", value: liveSessions?.length || 0 },
                    ]}
                    actions={
                        <Button
                            onClick={() => setCreateModuleOpen(true)}
                            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
                        >
                            Thêm Học Phần
                            <Plus className="ml-2 size-4" />
                        </Button>
                    }
                />
            </div>

            <Tabs defaultValue="curriculum" className="space-y-6">
                <TabsList className="h-12 p-1.5 rounded-2xl bg-muted/30 border border-border/40">
                    <TabsTrigger value="curriculum" className="rounded-xl h-9 px-6 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Layers className="size-4 mr-2" />
                        Chương Trình
                    </TabsTrigger>
                    {course?.type === 'live' && (
                        <TabsTrigger value="live-schedule" className="rounded-xl h-9 px-6 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <CalendarCheck2 className="size-4 mr-2" />
                            Lịch học Live
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="assignments" className="rounded-xl h-9 px-6 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <PenTool className="size-4 mr-2" />
                        Bài Tập
                    </TabsTrigger>
                </TabsList>

                {/* Curriculum Tab */}
                <TabsContent value="curriculum" className="space-y-4">
                    {modules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 border-2 border-dashed border-border/40 rounded-3xl bg-muted/5">
                            <div className="p-6 rounded-full bg-muted/10">
                                <Layers className="size-16 text-muted-foreground/20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-sans font-bold italic text-muted-foreground/50 uppercase tracking-tight">Chưa có nội dung</h3>
                                <p className="text-sm text-muted-foreground/40 max-w-sm mx-auto">Khóa học này chưa có học phần nào. Hãy bắt đầu xây dựng chương trình học ngay.</p>
                            </div>
                            <Button onClick={() => setCreateModuleOpen(true)} variant="outline" className="h-11 px-8 rounded-xl">
                                Tạo Học Phần Mới
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
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
                                                                <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                                                                    <MoreHorizontal className="size-4" />
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
                                                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                                                                        <MoreHorizontal className="size-4" />
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
                        </div>
                    )}
                </TabsContent>

                {/* Live Schedule Tab - only for live courses */}
                {course?.type === 'live' && (
                    <TabsContent value="live-schedule" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Quản lý lịch dạy live và thời khóa biểu cố định</p>
                            <Button
                                onClick={() => setIsScheduleSheetOpen(true)}
                                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 transition-all"
                            >
                                <Settings className="mr-2 size-4" />
                                Quản lý lịch cố định
                            </Button>
                        </div>

                        {sortedSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 border-2 border-dashed border-border/40 rounded-3xl bg-muted/5">
                                <div className="p-6 rounded-full bg-muted/10">
                                    <Video className="size-16 text-muted-foreground/20" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-sans font-bold italic text-muted-foreground/50 uppercase tracking-tight">Chưa có lịch dạy nào</h3>
                                    <p className="text-sm text-muted-foreground/40 max-w-sm mx-auto">Hãy bắt đầu bằng cách thiết lập lịch cố định hàng tuần cho khóa học này.</p>
                                </div>
                                <Button onClick={() => setIsScheduleSheetOpen(true)} variant="outline" className="h-11 px-8 rounded-xl">
                                    Thiết lập lịch cố định
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader className="bg-muted/30 border-b border-border">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-12">#</TableHead>
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Trạng thái</TableHead>
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Tiêu đề</TableHead>
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Thời gian</TableHead>
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Thời lượng</TableHead>
                                            <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Giảng viên</TableHead>
                                            <TableHead className="text-right h-11 text-xs font-semibold text-muted-foreground px-4">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedSessions.map((session, idx) => (
                                            <TableRow key={session.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-xs text-muted-foreground border-r border-border/30">{idx + 1}</TableCell>
                                                <TableCell className="border-r border-border/30">
                                                    <div className="flex items-center gap-2">
                                                        {session.status === 'live' && (
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                            </span>
                                                        )}
                                                        <Badge
                                                            variant={session.status === 'scheduled' ? "outline" : session.status === 'live' ? "destructive" : "secondary"}
                                                            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg"
                                                        >
                                                            {session.status === 'scheduled' ? "Sắp diễn ra" : session.status === 'live' ? "Đang live" : "Hoàn thành"}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border-r border-border/30">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-sm">{session.title}</p>
                                                        <p className="text-[10px] text-muted-foreground font-mono">ID: {session.id.slice(0, 8)}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border-r border-border/30">
                                                    <div className="text-sm">
                                                        <p className="font-medium">{format(new Date(session.scheduledAt), 'HH:mm', { locale: vi })}</p>
                                                        <p className="text-xs text-muted-foreground">{format(new Date(session.scheduledAt), 'EEEE, dd/MM/yyyy', { locale: vi })}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border-r border-border/30">
                                                    <span className="text-sm font-medium">{session.duration} phút</span>
                                                </TableCell>
                                                <TableCell className="border-r border-border/30">
                                                    <span className="text-sm">{session.lecturer?.displayName || 'Chưa chỉ định'}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {session.status === 'live' && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="rounded-lg h-8 px-3 text-[10px] font-bold uppercase tracking-widest gap-1.5"
                                                                onClick={() => handleJoinLiveSession(session.id)}
                                                            >
                                                                <Video className="size-3" />
                                                                Vào dạy
                                                            </Button>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                                                                    <MoreHorizontal className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-xl border-border/40 shadow-xl min-w-[160px] p-1.5">
                                                                {session.status === 'scheduled' && (
                                                                    <DropdownMenuItem onClick={() => handleStartLiveSession(session.id)} className="rounded-lg text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 gap-2 py-2">
                                                                        <PlayCircle className="size-3.5" /> <span className="font-bold text-xs uppercase">Bắt đầu</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {session.status === 'live' && (
                                                                    <DropdownMenuItem onClick={() => handleEndLiveSession(session.id)} className="rounded-lg text-orange-600 focus:text-orange-700 focus:bg-orange-50 gap-2 py-2">
                                                                        <StopCircle className="size-3.5" /> <span className="font-bold text-xs uppercase">Kết thúc</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => handleDeleteLiveSession(session.id)} className="rounded-lg text-destructive focus:bg-destructive/10 gap-2 py-2">
                                                                    <Trash className="size-3.5" /> <span className="font-bold text-xs uppercase">Xóa</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
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
                            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 transition-all"
                        >
                            <Plus className="mr-2 size-4" />
                            Thêm bài tập mới
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
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
                        </div>

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
            </Tabs>

            {/* Dialogs & Sheets */}
            <CreateModuleSheet open={createModuleOpen} onOpenChange={setCreateModuleOpen} courseId={id || ''} />
            <EditModuleSheet open={editModuleOpen} onOpenChange={setEditModuleOpen} module={selectedModule} />
            <DeleteModuleDialog open={deleteModuleOpen} onOpenChange={setDeleteModuleOpen} module={selectedModule} />

            <Suspense fallback={<div>Loading...</div>}>
                <CreateLessonSheet open={createLessonOpen} onOpenChange={setCreateLessonOpen} moduleId={selectedModuleIdForLesson || ''} />
            </Suspense>
            <EditLessonSheet open={editLessonOpen} onOpenChange={setEditLessonOpen} lesson={selectedLesson} />
            <DeleteLessonDialog open={deleteLessonOpen} onOpenChange={setDeleteLessonOpen} lesson={selectedLesson} />

            <TeachingScheduleSheet open={isScheduleSheetOpen} onOpenChange={setIsScheduleSheetOpen} course={course} />

            <CreateAssignmentSheet
                open={createAssignmentOpen}
                onOpenChange={setCreateAssignmentOpen}
                courseId={id}
                moduleId={selectedModuleIdForAssignment || undefined}
                lessonId={selectedLessonIdForAssignment || undefined}
            />
            <EditAssignmentSheet
                open={editAssignmentOpen}
                onOpenChange={setEditAssignmentOpen}
                assignment={selectedAssignment}
            />
        </div>
    );
}
