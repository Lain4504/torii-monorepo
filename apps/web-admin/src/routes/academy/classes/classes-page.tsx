import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Plus, Search, Filter, MoreHorizontal, GraduationCap, Video, Users } from 'lucide-react';
import { useAcademyClasses, type AcademyClass } from '@/lib/api/services/academy-classes';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { Input } from '@workspace/ui/components/input';
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
import { UserRole } from "@workspace/schemas";
import { cn } from "@workspace/ui/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ClassDialog } from '@/components/academy/class-dialog';

export default function ClassesPage() {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<AcademyClass | null>(null);

    const isLecturer = user?.role === UserRole.LECTURER;
    const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF_LMS;

    const { data: classes, isLoading } = useAcademyClasses({
        q: debouncedSearch,
        instructorId: (isLecturer ? user?.id : undefined) as any, // Cast to any to bypass stale lint error
    });

    const handleCreate = () => {
        setSelectedClass(null);
        setSheetOpen(true);
    };

    const handleEdit = (cls: AcademyClass) => {
        setSelectedClass(cls);
        setSheetOpen(true);
    };

    const stats = useMemo(() => [
        { label: "Lớp đang chạy", value: classes?.filter(c => c.status === 'ONGOING').length || 0 },
        { label: "Tổng số học viên", value: "---" }
    ], [classes]);

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title={isLecturer ? "Lớp của tôi" : "Quản lý Lớp học"}
                subtitle={isLecturer ? "Quản lý bài giảng, điểm danh và bài tập cho các lớp bạn phụ trách." : "Giám sát và vận hành toàn bộ các lớp học LIVE và VOD."}
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
                            className="pl-9"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Bộ lọc
                    </Button>
                </div>

                <div className="rounded-md border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Mã Lớp</TableHead>
                                <TableHead>Tên Lớp</TableHead>
                                <TableHead>Loại hình</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Học viên</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
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
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Không tìm thấy lớp học nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classes?.map((cls: AcademyClass) => (
                                    <TableRow key={cls.id}>
                                        <TableCell className="font-mono font-medium">{cls.code}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{cls.name}</div>
                                            <div className="text-xs text-muted-foreground">ID: {cls.id.split('-')[0]}...</div>
                                        </TableCell>
                                        <TableCell>
                                            {cls.mode === 'LIVE' ? (
                                                <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                                                    <Video className="size-3 mr-1" /> LIVE
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
                                                    <GraduationCap className="size-3 mr-1" /> VOD
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                cls.status === 'PUBLISHED' && "border-green-500/50 text-green-500",
                                                cls.status === 'DRAFT' && "border-yellow-500/50 text-yellow-500",
                                                cls.status === 'ONGOING' && "border-blue-500/50 text-blue-500"
                                            )}>
                                                {cls.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Users className="size-3" />
                                                <span>--</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/academy/classes/${cls.id}/detail`)}
                                                        >
                                                            Xem chi tiết
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(cls)}>
                                                            Quản lý & Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/academy/classes/${cls.id}/detail`)}
                                                        >
                                                            Quản lý Học viên
                                                        </DropdownMenuItem>
                                                        {cls.mode === 'LIVE' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => navigate(`/academy/classes/${cls.id}/detail?tab=schedule`)}
                                                                >
                                                                    Lịch học & Điểm danh
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => navigate(`/academy/classes/${cls.id}/detail?tab=assignments`)}
                                                                >
                                                                    Bài tập & Chấm điểm
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {isStaff && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    disabled
                                                                >
                                                                    Xóa lớp
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ClassDialog
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                academyClass={selectedClass ?? undefined}
            />
        </div>
    );
}

