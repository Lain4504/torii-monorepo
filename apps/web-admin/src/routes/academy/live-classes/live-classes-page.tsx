import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Plus, Search, Eye, Pencil, Rocket } from 'lucide-react';
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
import { dataTableShellClass, dataTableHeaderClass } from '@/lib/ui-shell';


export default function LiveClassesPage() {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<AcademyLiveClass | null>(null);
    const [statusDialogClass, setStatusDialogClass] = useState<AcademyLiveClass | null>(null);

    // Filters
    // Mặc định chỉ hiển thị lớp đang tuyển sinh (tương ứng trạng thái OPENING)
    const [statusFilter, setStatusFilter] = useState<string | undefined>('OPENING');

    const isLecturer = user?.role === UserRole.LECTURER;
    const isStaff = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role);

    const { data: classes, isLoading } = useAcademyLiveClasses({
        q: debouncedSearch,
        instructorId: isLecturer ? user?.id : undefined,
        status: statusFilter || undefined,
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
            { label: "Lớp đang tuyển", value: classes?.filter(c => c.status === 'OPENING').length || 0 },
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
        <div className="flex flex-col gap-8 p-6">
            <PageHeader
                title={isLecturer ? "Lớp của tôi" : "Quản lý Lớp học LIVE"}
                subtitle={isLecturer ? "Quản lý bài giảng, điểm danh và bài tập cho các lớp bạn phụ trách." : "Giám sát và vận hành toàn bộ các lớp học trực tiếp (LIVE)."}
                stats={stats}
                actions={isStaff && (
                    <Button size="lg" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo Lớp mới
                    </Button>
                )}
            />

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo mã hoặc tên lớp..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Select
                            value={statusFilter ?? "all"}
                            onValueChange={(val) => setStatusFilter(val === "all" ? undefined : val)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px] bg-muted/30 p-1 rounded-lg">
                                <SelectValue placeholder="Trạng thái" />
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

                        {statusFilter && statusFilter !== 'OPENING' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter(undefined);
                                }}
                                className="text-muted-foreground hover:text-foreground text-xs h-10"
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </div>

                <div className={dataTableShellClass}>
                    <Table>
                        <TableHeader className={dataTableHeaderClass}>
                            <TableRow>
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead className="w-[120px]">Mã Lớp</TableHead>
                                <TableHead>Tên Lớp</TableHead>
                                <TableHead>Khóa học / Cohort</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Học viên</TableHead>
                                <TableHead className="text-right pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : !classes || classes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        Không tìm thấy lớp học nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classes.map((cls: AcademyLiveClass, index: number) => (
                                    <TableRow key={cls.id}>
                                        <TableCell className="text-center text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                        <TableCell className="font-mono font-bold text-xs text-primary">{cls.code}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-sm">{cls.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {cls.cohort?.name ? (
                                                <Badge variant="outline" className="font-mono text-[10px] bg-background shadow-xs">
                                                    {cls.cohort.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => setStatusDialogClass(cls)}
                                                className="inline-flex"
                                            >
                                                {cls.status === 'ARCHIVED' ? (
                                                    <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-none cursor-pointer">Đã lưu trữ</Badge>
                                                ) : cls.status === 'IN_PROGRESS' ? (
                                                    <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-none cursor-pointer">Đang diễn ra</Badge>
                                                ) : cls.status === 'OPENING' ? (
                                                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none cursor-pointer">Đang tuyển sinh</Badge>
                                                ) : cls.status === 'DRAFT' ? (
                                                    <Badge variant="secondary" className="bg-slate-500/10 text-slate-700 border-none cursor-pointer">Bản nháp</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none cursor-pointer">{getStatusLabel(cls.status)}</Badge>
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground tabular-nums">
                                                <span className="font-medium text-foreground">
                                                    {(cls as any)._count?.enrollments ?? 0}
                                                </span>
                                                <span>
                                                    {cls.maxStudents != null ? `/ ${cls.maxStudents}` : "/ ∞"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2 border-sky-500/30 text-sky-700 bg-transparent hover:bg-sky-50 hover:text-sky-700"
                                                    onClick={() => navigate(`/academy/live-classes/${cls.id}/detail`)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" /> Chi tiết
                                                </Button>
                                                {isStaff && cls.status === 'DRAFT' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-2 border-emerald-500/30 text-emerald-700 bg-transparent hover:bg-emerald-50 hover:text-emerald-700"
                                                            onClick={() => handleEdit(cls)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" /> Chỉnh Sửa
                                                        </Button>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                                                            onClick={() => handlePublish(cls.id)}
                                                            disabled={publishMutation.isPending}
                                                        >
                                                            <Rocket className="h-3.5 w-3.5" /> Công khai
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
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
                        <DialogTitle>Luồng trạng thái lớp học LIVE</DialogTitle>
                        <DialogDescription>
                            Lớp LIVE (trực tiếp): trạng thái phản ánh giai đoạn vận hành của lớp.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="rounded-md border bg-muted/30 p-3 text-sm">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant="secondary">Bản nháp</Badge>
                                <span className="text-muted-foreground">→</span>
                                <Badge variant="secondary">Đang tuyển sinh</Badge>
                                <span className="text-muted-foreground">→</span>
                                <Badge variant="secondary">Đang diễn ra</Badge>
                                <span className="text-muted-foreground">→</span>
                                <Badge variant="secondary">Đã hoàn thành</Badge>
                                <span className="text-muted-foreground">→</span>
                                <Badge variant="secondary">Lưu trữ</Badge>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Thay đổi trạng thái thực hiện trong trang Chi tiết lớp.
                        </p>
                        {statusDialogClass && (
                            <div className="flex items-center gap-2 pt-2">
                                <Badge variant="outline">Hiện tại: {getStatusLabel(statusDialogClass.status)}</Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        navigate(`/academy/live-classes/${statusDialogClass.id}/detail`);
                                        setStatusDialogClass(null);
                                    }}
                                >
                                    <Eye className="h-4 w-4 mr-1" /> Mở Chi tiết
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

