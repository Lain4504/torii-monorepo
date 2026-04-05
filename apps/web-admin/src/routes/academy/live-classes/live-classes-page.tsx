import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Plus, Search, Eye, Pencil, Rocket, CalendarSync } from 'lucide-react';
import {
    useAcademyLiveClasses,
    usePublishClassDirectly,
    type AcademyLiveClass,
} from '@/lib/api/services/academy-live-classes';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useAppSelector } from "@/hooks/hooks";
import { selectUser } from "@/store/slices/auth-slice";
import { UserRole, isStaffBranchRole } from "@workspace/schemas";
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { LiveClassSheet } from '@/components/academy/live-class-sheet';
import {
    dataTableShellClass,
    dataTableHeaderClass,
    listPageFiltersRowClass,
    listPageSearchIconClass,
    listPageSearchInputClass,
    listPageSearchWrapClass,
    listPageToolbarRootClass,
} from '@/lib/ui-shell';


export default function LiveClassesPage() {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<AcademyLiveClass | null>(null);
    const [statusDialogClass, setStatusDialogClass] = useState<AcademyLiveClass | null>(null);

    // Filters
    // Mặc định hiển thị tất cả (undefined) thay vì chỉ OPENING để Admin thấy được lớp mới tạo (DRAFT)
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const isLecturer = user?.role === UserRole.LECTURER;
    const isStaff = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role);

    const { data: classes, isLoading } = useAcademyLiveClasses({
        q: debouncedSearch,
        instructorId: isLecturer ? user?.id : undefined,
        status: statusFilter,
    } as any);

    const publishMutation = usePublishClassDirectly();

    const handlePublish = async (id: string) => {
        try {
            await publishMutation.mutateAsync(id);
            toast.success("Lớp học đã được công khai thành công");
        } catch (error: any) {
            toast.error(error?.userMessage || "Lỗi khi công khai lớp học");
        }
    };

    const handleCreate = () => {
        setSelectedClass(null);
        setSheetOpen(true);
    };

    const handleEdit = (cls: AcademyLiveClass) => {
        setSelectedClass(cls);
        setSheetOpen(true);
    };

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            DRAFT: "Bản nháp",
            OPENING: "Đang tuyển sinh",
            IN_PROGRESS: "Đang diễn ra",
            COMPLETED: "Đã hoàn thành",
            ARCHIVED: "Lưu trữ",
        };
        return map[status] ?? status;
    };

    const stats = useMemo(() => {
        const enrollmentCount = classes?.reduce((acc, curr) => acc + (curr._count?.enrollments || 0), 0) || 0;
        return [
            { label: "Đang tuyển sinh", value: classes?.filter(c => c.status === 'OPENING').length || 0 },
            { label: "Tổng số học viên", value: enrollmentCount }
        ];
    }, [classes]);

    const liveStatuses = [
        { value: 'DRAFT', label: 'Bản nháp' },
        { value: 'OPENING', label: 'Đang tuyển sinh' },
        { value: 'IN_PROGRESS', label: 'Đang diễn ra' },
        { value: 'COMPLETED', label: 'Đã hoàn thành' },
        { value: 'ARCHIVED', label: 'Lưu trữ' },
    ];

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title={isLecturer ? "Lớp của tôi" : "Quản lý Lớp học LIVE"}
                subtitle={isLecturer ? "Quản lý bài giảng, điểm danh và bài tập cho các lớp bạn phụ trách." : "Giám sát và vận hành toàn bộ các lớp học trực tiếp (LIVE)."}
                stats={stats}
                actions={isStaff && (
                    <div className="flex gap-4">
                        <Button variant="outline" size="lg" className="h-10 gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => navigate('/academy/live-classes/reschedule-requests')}>
                            <CalendarSync className="h-4 w-4" />
                            Duyệt dời lịch
                        </Button>
                        <Button size="lg" className="h-10 gap-2 shadow-sm" onClick={handleCreate}>
                            <Plus className="h-4 w-4" />
                            Tạo Lớp mới
                        </Button>
                    </div>
                )}
            />

            <div className="space-y-4">
                <div className={listPageToolbarRootClass}>
                    <div className={listPageSearchWrapClass}>
                        <Search className={listPageSearchIconClass} />
                        <Input
                            placeholder="Tìm kiếm theo mã hoặc tên lớp..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={listPageSearchInputClass}
                        />
                    </div>

                    <div className={listPageFiltersRowClass}>
                        <Select
                            value={statusFilter ?? "all"}
                            onValueChange={(val) => setStatusFilter(val === "all" ? undefined : val)}
                        >
                            <SelectTrigger className="h-10 w-full md:w-[220px] bg-muted/30 p-1 rounded-lg">
                                <SelectValue placeholder="Lọc trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                {liveStatuses.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {statusFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter(undefined)}
                                className="h-10 px-4 text-muted-foreground hover:text-foreground text-xs"
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </div>

                <div className={dataTableShellClass}>
                    <Table>
                        <TableHeader className={dataTableHeaderClass}>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead className="w-[100px]">Banner</TableHead>
                                <TableHead className="w-[120px]">Mã Lớp</TableHead>
                                <TableHead>Tên Lớp học</TableHead>
                                <TableHead className="w-[180px]">Đợt học (Cohort)</TableHead>
                                <TableHead className="w-[150px]">Trạng thái</TableHead>
                                <TableHead className="w-[100px]">Học viên</TableHead>
                                <TableHead className="text-right pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-16 rounded" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : !classes || classes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                        Không tìm thấy lớp học nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classes.map((cls: AcademyLiveClass, index: number) => {
                                    const isCohortPending = cls.cohort?.status === 'PENDING_APPROVAL';
                                    const effectiveThumbnail = cls.thumbnailUrl || cls.cohort?.courseProfile?.thumbnailUrl;

                                    return (
                                        <TableRow key={cls.id} className="group hover:bg-muted/5 transition-colors">
                                            <TableCell className="text-center text-muted-foreground tabular-nums text-xs">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-10 w-16 rounded-md border bg-muted/50 overflow-hidden shadow-xs flex-shrink-0">
                                                    {effectiveThumbnail ? (
                                                        <img src={effectiveThumbnail} alt={cls.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground italic">No img</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-xs text-primary tabular-nums">
                                                {cls.code}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{cls.name}</span>
                                                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                                                        {cls.cohort?.courseProfile?.title || "Chưa gán hồ sơ"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {cls.cohort?.name ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-medium text-slate-700">{cls.cohort.name}</span>
                                                        <span className="text-[10px] text-muted-foreground italic tabular-nums">
                                                            {cls.cohort.startDate ? new Date(cls.cohort.startDate).toLocaleDateString('vi-VN') : '—'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground italic text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    type="button"
                                                    onClick={() => setStatusDialogClass(cls)}
                                                    className="inline-flex transition-transform hover:scale-105 active:scale-95"
                                                >
                                                    {isCohortPending && cls.status === 'DRAFT' ? (
                                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-none animate-pulse">Chờ duyệt (Cohort)</Badge>
                                                    ) : cls.status === 'ARCHIVED' ? (
                                                        <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-none">Đã lưu trữ</Badge>
                                                    ) : cls.status === 'IN_PROGRESS' ? (
                                                        <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-none">Đang diễn ra</Badge>
                                                    ) : cls.status === 'OPENING' ? (
                                                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">Đang tuyển sinh</Badge>
                                                    ) : cls.status === 'DRAFT' ? (
                                                        <Badge variant="secondary" className="bg-slate-500/10 text-slate-700 border-none">Bản nháp</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none">{getStatusLabel(cls.status)}</Badge>
                                                    )}
                                                </button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground tabular-nums font-medium">
                                                    <span className="text-foreground">
                                                        {(cls as any)._count?.enrollments ?? 0}
                                                    </span>
                                                    <span className="opacity-40">
                                                        / {cls.maxStudents != null ? cls.maxStudents : "∞"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 border-sky-500/40 text-sky-700 bg-transparent hover:bg-sky-50 font-medium"
                                                        onClick={() => navigate(`/academy/live-classes/${cls.id}/detail`)}
                                                    >
                                                        <Eye className="h-4 w-4" /> Chi tiết
                                                    </Button>
                                                    {isStaff && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 gap-1.5 border-emerald-500/40 text-emerald-700 bg-transparent hover:bg-emerald-50 font-medium"
                                                                onClick={() => handleEdit(cls)}
                                                            >
                                                                <Pencil className="h-4 w-4" /> Sửa
                                                            </Button>
                                                            {cls.status === 'DRAFT' && !isCohortPending && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 gap-1.5 border-indigo-500/40 text-indigo-700 bg-transparent hover:bg-indigo-50 font-medium shadow-sm"
                                                                    onClick={() => handlePublish(cls.id)}
                                                                    disabled={publishMutation.isPending}
                                                                >
                                                                    <Rocket className="h-4 w-4" /> Xuất bản
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <LiveClassSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                academyClass={selectedClass}
            />

            {/* Dialog hiển thị luồng trạng thái */}
            <Dialog open={!!statusDialogClass} onOpenChange={(open) => !open && setStatusDialogClass(null)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Luồng trạng thái lớp học LIVE
                        </DialogTitle>
                        <DialogDescription>
                            Lớp LIVE (trực tiếp): trạng thái phản ánh giai đoạn vận hành của lớp.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="rounded-xl border bg-muted/30 p-4 text-sm shadow-inner overflow-hidden relative">
                            <div className="flex flex-wrap items-center gap-2 justify-center">
                                <Badge variant="secondary" className="shadow-xs border-none">DRAFT</Badge>
                                <span className="text-muted-foreground opacity-40">→</span>
                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 shadow-xs border-none">OPENING</Badge>
                                <span className="text-muted-foreground opacity-40">→</span>
                                <Badge variant="default" className="bg-blue-500/10 text-blue-600 shadow-xs border-none">IN_PROGRESS</Badge>
                                <span className="text-muted-foreground opacity-40">→</span>
                                <Badge variant="outline" className="shadow-xs">COMPLETED</Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Rocket className="size-3" />
                                Thay đổi trạng thái thực hiện trong trang Chi tiết lớp hoặc click "Xuất bản".
                            </p>
                            {statusDialogClass && (
                                <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hiện tại</span>
                                        <span className="text-sm font-semibold">{getStatusLabel(statusDialogClass.status)}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        onClick={() => {
                                            navigate(`/academy/live-classes/${statusDialogClass.id}/detail`);
                                            setStatusDialogClass(null);
                                        }}
                                    >
                                        <Eye className="h-4 w-4 mr-1.5" /> Mở Chi tiết
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

