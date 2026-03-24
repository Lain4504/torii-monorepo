import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Plus, Search, Eye, Pencil } from 'lucide-react';
import {
  useAcademyLiveClasses,
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

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { LiveClassSheet } from '@/components/academy/live-class-sheet';


export default function LiveClassesPage() {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<AcademyLiveClass | null>(null);
    const [statusDialogClass, setStatusDialogClass] = useState<AcademyLiveClass | null>(null);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const isLecturer = user?.role === UserRole.LECTURER;
    const isStaff = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role);

    const { data: classes, isLoading } = useAcademyLiveClasses({
        q: debouncedSearch,
        instructorId: isLecturer ? user?.id : undefined,
        status: statusFilter || undefined,
    });

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
            ONGOING: "Đang diễn ra",
            COMPLETED: "Đã hoàn thành",
            CANCELLED: "Đã hủy",
            ARCHIVED: "Lưu trữ",
        };
        return map[status] ?? status;
    };

    const stats = useMemo(() => [
        { label: "Lớp đang chạy", value: classes?.filter(c => c.status === 'ONGOING').length || 0 },
        { label: "Tổng số học viên", value: "---" }
    ], [classes]);

    const liveStatuses = [
        { value: 'DRAFT', label: 'Bản nháp' },
        { value: 'OPENING', label: 'Đang tuyển sinh' },
        { value: 'ONGOING', label: 'Đang diễn ra' },
        { value: 'COMPLETED', label: 'Đã hoàn thành' },
        { value: 'CANCELLED', label: 'Đã hủy' },
        { value: 'ARCHIVED', label: 'Lưu trữ' },
    ];

    return (
        <div className="flex flex-col gap-8">
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
                            className="pl-9 h-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Select 
                            value={statusFilter || "all"} 
                            onValueChange={(val) => setStatusFilter(val === "all" ? undefined : val)}
                        >
                            <SelectTrigger className="w-[180px] h-10">
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

                        {statusFilter && (
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

                <div className="rounded-md border bg-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-12">STT</TableHead>
                                <TableHead className="w-[120px]">Mã Lớp</TableHead>
                                <TableHead>Tên Lớp</TableHead>
                                <TableHead>Khóa học / Cohort</TableHead>
                                <TableHead className="w-[180px]">Trạng thái</TableHead>
                                <TableHead>Học viên</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
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
                                        <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                        <TableCell className="font-mono font-medium">{cls.code}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{cls.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {cls.cohort?.name ? (
                                                <Badge variant="outline" className="font-mono text-[10px]">
                                                    {cls.cohort.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => setStatusDialogClass(cls)}
                                                className="inline-flex"
                                            >
                                                <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">
                                                    {getStatusLabel(cls.status)}
                                                </Badge>
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap items-center gap-1 text-sm">
                                                <span className="tabular-nums font-medium">
                                                    {(cls as any)._count?.enrollments ?? 0}
                                                    {cls.maxStudents != null ? ` / ${cls.maxStudents}` : " (∞)"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => navigate(`/academy/live-classes/${cls.id}/detail`)}>
                                                    <Eye className="h-4 w-4" /> Chi tiết
                                                </Button>
                                                {isStaff && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-primary border-primary/40"
                                                        onClick={() => handleEdit(cls)}
                                                    >
                                                        <Pencil className="h-4 w-4" /> Sửa
                                                    </Button>
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

