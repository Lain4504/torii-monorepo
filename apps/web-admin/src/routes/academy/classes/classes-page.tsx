import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Plus, Search, Eye, Pencil } from 'lucide-react';
import {
  useAcademyClasses,
  type AcademyClass,
} from '@/lib/api/services/academy-classes';
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
import { useSubmitClassForApproval } from '@/lib/api/services/academy-classes';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { SendIcon } from "lucide-react"
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
import { ClassSheet } from '@/components/academy/class-sheet';


export default function ClassesPage() {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<AcademyClass | null>(null);
    const [statusDialogClass, setStatusDialogClass] = useState<AcademyClass | null>(null);
    const [submitDialog, setSubmitDialog] = useState<{ open: boolean; cls: AcademyClass | null }>({ open: false, cls: null });
    
    // Filters
    const [mode, setMode] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const submitForApprovalMutation = useSubmitClassForApproval();

    const isLecturer = user?.role === UserRole.LECTURER;
    const isStaff = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role);

    const { data: classes, isLoading } = useAcademyClasses({
        q: debouncedSearch,
        instructorId: (isLecturer ? user?.id : undefined) as any,
        mode: mode || undefined,
        status: statusFilter || undefined,
    });

    const handleCreate = () => {
        setSelectedClass(null);
        setSheetOpen(true);
    };

    const handleEdit = (cls: AcademyClass) => {
        setSelectedClass(cls);
        setSheetOpen(true);
    };

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            DRAFT: "Bản nháp",
            PENDING_APPROVAL: "Chờ duyệt",
            PUBLISHED: "Đã xuất bản",
            OPENING: "Đang tuyển sinh",
            ONGOING: "Đang diễn ra",
            COMPLETED: "Đã hoàn thành",
            ARCHIVED: "Lưu trữ",
        };
        return map[status] ?? status;
    };

    const stats = useMemo(() => [
        { label: "Lớp đang chạy", value: classes?.filter(c => c.status === 'ONGOING').length || 0 },
        { label: "Tổng số học viên", value: "---" }
    ], [classes]);

    const vodStatuses = [
        { value: 'DRAFT', label: 'Bản nháp' },
        { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
        { value: 'PUBLISHED', label: 'Đã xuất bản' },
        { value: 'ARCHIVED', label: 'Lưu trữ' },
    ];

    const liveStatuses = [
        { value: 'DRAFT', label: 'Bản nháp' },
        { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
        { value: 'OPENING', label: 'Đang tuyển sinh' },
        { value: 'ONGOING', label: 'Đang diễn ra' },
        { value: 'COMPLETED', label: 'Đã hoàn thành' },
        { value: 'ARCHIVED', label: 'Lưu trữ' },
    ];

    const currentStatusOptions = mode === 'VOD' ? vodStatuses : mode === 'LIVE' ? liveStatuses : [];

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title={isLecturer ? "Lớp của tôi" : "Quản lý Lớp học"}
                subtitle={isLecturer ? "Quản lý bài giảng, điểm danh và bài tập cho các lớp bạn phụ trách." : "Giám sát và vận hành toàn bộ các lớp học trực tiếp (LIVE) và tự học (VOD)."}
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
                        <Select value={mode || "all"} onValueChange={(val) => {
                            setMode(val === "all" ? undefined : val);
                            setStatusFilter(undefined); // Reset status when mode changes
                        }}>
                            <SelectTrigger className="w-[180px] h-10">
                                <SelectValue placeholder="Loại hình lớp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại hình</SelectItem>
                                <SelectItem value="LIVE">LIVE (Trực tiếp)</SelectItem>
                                <SelectItem value="VOD">VOD (Tự học)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select 
                            value={statusFilter || "all"} 
                            onValueChange={(val) => setStatusFilter(val === "all" ? undefined : val)}
                            disabled={!mode}
                        >
                            <SelectTrigger className="w-[180px] h-10">
                                <SelectValue placeholder={!mode ? "Chọn loại hình trước" : "Trạng thái"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                {currentStatusOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(mode || statusFilter) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setMode(undefined);
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
                                <TableHead>Kỳ học / Term</TableHead>
                                <TableHead>Loại hình</TableHead>
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
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : classes?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        Không tìm thấy lớp học nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classes?.map((cls: AcademyClass, index: number) => (
                                    <TableRow key={cls.id}>
                                        <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                        <TableCell className="font-mono font-medium">{cls.code}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{cls.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {(cls as any).term?.termCode ? (
                                                <Badge variant="outline" className="font-mono text-[10px]">
                                                    {(cls as any).term.termCode}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {cls.mode === 'LIVE' ? (
                                                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                    LIVE
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                    VOD
                                                </Badge>
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
                                            <div className="flex items-center gap-1 text-muted-foreground italic">
                                                <span>--</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isStaff && (cls.status === 'DRAFT' || cls.status === 'REJECTED') && (
                                                    (() => {
                                                        const liveScheduleCount = cls.mode === 'LIVE' ? (cls._count?.liveSchedules ?? 0) : 0
                                                        const isLiveMissingSchedule = cls.mode === 'LIVE' && liveScheduleCount === 0
                                                        return (
                                                    <Button 
                                                        variant="default" 
                                                        size="sm" 
                                                        className="h-8 gap-1.5 bg-primary hover:bg-primary/90"
                                                        title={isLiveMissingSchedule ? "LIVE cần ít nhất 1 lịch học tuần trước khi gửi duyệt" : undefined}
                                                        onClick={() => setSubmitDialog({ open: true, cls })}
                                                        disabled={submitForApprovalMutation.isPending || isLiveMissingSchedule}
                                                    >
                                                        <SendIcon className="h-3.5 w-3.5" /> Gửi duyệt
                                                    </Button>
                                                        )
                                                    })()
                                                )}
                                                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => navigate(`/academy/classes/${cls.id}/detail`)}>
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
            <ClassSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                academyClass={selectedClass ?? undefined}
                initialMode="LIVE"
            />

            {/* Dialog hiển thị luồng trạng thái theo loại lớp */}
            <Dialog open={!!statusDialogClass} onOpenChange={(open) => !open && setStatusDialogClass(null)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Luồng trạng thái lớp học</DialogTitle>
                        <DialogDescription>
                            {statusDialogClass?.mode === "VOD"
                                ? "Lớp VOD (tự học): trạng thái chỉ tiến lên, không lùi."
                                : "Lớp LIVE (trực tiếp): trạng thái chỉ tiến lên, không lùi."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {statusDialogClass?.mode === "VOD" ? (
                            <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                <p className="font-medium text-muted-foreground mb-2">
                                    VOD: Bản nháp → Chờ duyệt → Xuất bản → Lưu trữ
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge variant="secondary">Bản nháp</Badge>
                                    <span className="text-muted-foreground">→</span>
                                    <Badge variant="secondary">Chờ duyệt</Badge>
                                    <span className="text-muted-foreground">→</span>
                                    <Badge variant="secondary">Đã xuất bản</Badge>
                                    <span className="text-muted-foreground">→</span>
                                    <Badge variant="secondary">Lưu trữ</Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                <p className="font-medium text-muted-foreground mb-2">LIVE: Bản nháp → Chờ duyệt → Đang tuyển sinh → Đang diễn ra → Đã hoàn thành → Lưu trữ</p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge variant="secondary">Bản nháp</Badge>
                                    <span className="text-muted-foreground">→</span>
                                    <Badge variant="secondary">Chờ duyệt</Badge>
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
                        )}
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
                                        navigate(`/academy/classes/${statusDialogClass.id}/detail`);
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

            {/* Confirmation Dialogs */}
            <AlertDialog open={submitDialog.open} onOpenChange={(open) => setSubmitDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Gửi duyệt lớp học?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Lớp học <strong>{submitDialog.cls?.name}</strong> sẽ được gửi cho quản lý cấp cao để kiểm duyệt nội dung và lịch trình. Bạn không thể chỉnh sửa trong khi chờ duyệt.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!submitDialog.cls) return;
                                try {
                                    await submitForApprovalMutation.mutateAsync(submitDialog.cls.id);
                                    toast.success("Đã gửi duyệt lớp học thành công");
                                    setSubmitDialog({ open: false, cls: null });
                                } catch (error: any) {
                                    toast.error(error.userMessage || "Có lỗi xảy ra khi gửi duyệt");
                                }
                            }}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Xác nhận gửi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

