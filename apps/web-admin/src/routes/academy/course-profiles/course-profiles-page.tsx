import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Plus, BookOpen, Search, Pencil, Eye, Copy, Archive, Send } from 'lucide-react';
import {
    useAcademyCourseProfiles,
    type AcademyCourseProfile,
    useArchiveAcademyCourseProfile,
    useSubmitAcademyCourseProfileForApproval,
} from '@/lib/api/services/academy-course-profiles';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { format } from 'date-fns';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { toast } from 'sonner';

import { CourseProfileSheet } from './components/course-profile-sheet';
import { DuplicateCourseDialog } from './components/duplicate-course-dialog';

export default function CourseProfilesPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [tab, setTab] = useState<'all' | 'draft' | 'pending' | 'published' | 'archived'>('all');
    const [sheetOpen, setSheetOpen] = useState(false);
    const [duplicateOpen, setDuplicateOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<AcademyCourseProfile | null>(null);

    const [archiveDialog, setArchiveDialog] = useState<{
        open: boolean;
        id?: string;
        code?: string;
    }>({ open: false });

    const [submitDialog, setSubmitDialog] = useState<{
        open: boolean;
        profileId?: string;
        code?: string;
    }>({ open: false });

    const statusFilter =
        tab === 'all'
            ? undefined
            : tab === 'draft'
                ? 'DRAFT'
                : tab === 'pending'
                    ? 'PENDING_APPROVAL'
                    : tab === 'published'
                        ? 'PUBLISHED'
                        : 'ARCHIVED';

    const { data: profiles, isLoading } = useAcademyCourseProfiles({
        q: debouncedSearch,
        status: statusFilter,
    });

    const archiveMutation = useArchiveAcademyCourseProfile();
    const submitForApprovalMutation = useSubmitAcademyCourseProfileForApproval();
    const isSubmitPending = submitForApprovalMutation.isPending;

    const handleCreate = () => {
        setSelectedProfile(null);
        setSheetOpen(true);
    };

    const handleEdit = (profile: AcademyCourseProfile) => {
        setSelectedProfile(profile);
        setSheetOpen(true);
    };

    const handleDuplicate = (profile: AcademyCourseProfile) => {
        setSelectedProfile(profile);
        setDuplicateOpen(true);
    };

    const handleArchive = (id: string, code: string) => {
        setArchiveDialog({ open: true, id, code });
    };

    return (
        <div className="flex flex-col gap-8 p-6">
            <PageHeader
                title="Hồ sơ khóa học (Products)"
                subtitle="Định nghĩa chương trình học gốc. Tại đây bạn quản lý Modules, Lessons và nhân bản khóa học cho năm học mới."
                actions={
                    <Button size="lg" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo hồ sơ gốc mới
                    </Button>
                }
            />

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo mã N5-2024, N4..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 shadow-sm"
                            />
                        </div>

                        <Select value={tab} onValueChange={(v) => setTab(v as any)}>
                            <SelectTrigger className="w-full sm:w-[240px] bg-muted/30 p-1 rounded-lg">
                                <SelectValue placeholder="Lọc trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="draft">Bản nháp</SelectItem>
                                <SelectItem value="pending">Chờ duyệt</SelectItem>
                                <SelectItem value="published">Đang hoạt động</SelectItem>
                                <SelectItem value="archived">Đã lưu trữ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead className="w-[120px]">Mã Code</TableHead>
                                <TableHead>Tên khóa học (Gốc)</TableHead>
                                <TableHead>Cấp độ</TableHead>
                                <TableHead>Trạng thái</TableHead>
                            <TableHead>Cập nhật</TableHead>
                                <TableHead className="text-right pr-6">Thao tác quản lý</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto mr-4" /></TableCell>
                                    </TableRow>
                                ))
                            ) : profiles?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                                        Không tìm thấy hồ sơ khóa học nào phù hợp.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                profiles?.map((profile, index) => (
                                    <TableRow key={profile.id} className="group hover:bg-muted/5 transition-colors">
                                        <TableCell className="text-center text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                        <TableCell className="font-mono font-bold text-xs text-primary">{profile.code}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                                                    <BookOpen className="size-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{profile.title}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-[10px] uppercase bg-background shadow-xs">{profile.level || 'JLPT'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {(profile as any).status === 'ARCHIVED' ? (
                                                <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-none">Đã lưu trữ</Badge>
                                            ) : (profile as any).status === 'PENDING_APPROVAL' ? (
                                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-none">Chờ duyệt</Badge>
                                            ) : (profile as any).status === 'DRAFT' ? (
                                                <Badge variant="secondary" className="bg-slate-500/10 text-slate-700 border-none">Bản nháp</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">Đang hoạt động</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {profile.updatedAt ? format(new Date(profile.updatedAt), 'dd/MM/yyyy') : '—'}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2 border-blue-500/30 text-blue-700 bg-transparent hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => handleDuplicate(profile)}
                                                    title="Nhân bản cho năm mới"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                    <span>Nhân bản</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2 border-sky-500/30 text-sky-700 bg-transparent hover:bg-sky-50 hover:text-sky-700"
                                                    onClick={() => navigate(`/academy/course-profiles/${profile.id}/detail`)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Chi tiết</span>
                                                </Button>
                                                {((profile as any).status === 'DRAFT' || (profile as any).status === 'PENDING_APPROVAL') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-2 border-emerald-500/30 text-emerald-700 bg-transparent hover:bg-emerald-50 hover:text-emerald-700"
                                                        onClick={() => handleEdit(profile)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span>Chỉnh sửa</span>
                                                    </Button>
                                                )}

                                                {(profile as any).status === 'DRAFT' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-2 border-indigo-500/30 text-indigo-700 bg-transparent hover:bg-indigo-50 hover:text-indigo-700"
                                                        onClick={() => {
                                                            setSubmitDialog({ open: true, profileId: profile.id, code: profile.code });
                                                        }}
                                                        disabled={isSubmitPending}
                                                        title="Gửi duyệt"
                                                    >
                                                        <Send className="h-3.5 w-3.5" />
                                                        <span>Gửi duyệt</span>
                                                    </Button>
                                                )}

                                                {(profile as any).status === 'PENDING_APPROVAL' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled
                                                        className="h-8 gap-2 border-amber-500/30 text-amber-700 bg-transparent opacity-60 cursor-not-allowed"
                                                        title="Đã gửi duyệt"
                                                    >
                                                        <Send className="h-3.5 w-3.5" />
                                                        <span>Đã gửi</span>
                                                    </Button>
                                                )}

                                                {(profile as any).status !== 'ARCHIVED' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-2 border-orange-500/30 text-orange-700 bg-transparent hover:bg-orange-50 hover:text-orange-700"
                                                        onClick={() => handleArchive(profile.id, profile.code)}
                                                        title="Lưu trữ"
                                                    >
                                                        <Archive className="h-3.5 w-3.5" />
                                                        <span>Lưu trữ</span>
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

            <AlertDialog
                open={archiveDialog.open}
                onOpenChange={(open) => {
                    if (!open) setArchiveDialog({ open: false })
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận lưu trữ</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn lưu trữ hồ sơ <span className="font-medium">{archiveDialog.code}</span>? Thao tác
                            này sẽ làm đóng băng giáo trình.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!archiveDialog.id) return
                                try {
                                    await archiveMutation.mutateAsync(archiveDialog.id)
                                    toast.success(
                                        `Hồ sơ ${archiveDialog.code} đã được lưu trữ.`,
                                    )
                                    setArchiveDialog({ open: false })
                                } catch (err: any) {
                                    toast.error(err?.response?.data?.message || err.message || 'Không thể lưu trữ hồ sơ.')
                                }
                            }}
                            disabled={archiveMutation.isPending}
                        >
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={submitDialog.open}
                onOpenChange={(open) => {
                    if (!open) setSubmitDialog({ open: false })
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận gửi duyệt hồ sơ</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn gửi duyệt hồ sơ <span className="font-medium">{submitDialog.code}</span>?
                            Sau khi gửi duyệt, curriculum sẽ bị khóa để tránh thay đổi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!submitDialog.profileId) return
                                try {
                                    await submitForApprovalMutation.mutateAsync(submitDialog.profileId)
                                    toast.success(`Đã gửi duyệt hồ sơ ${submitDialog.code}`)
                                    setSubmitDialog({ open: false })
                                } catch (err: any) {
                                    toast.error(err?.response?.data?.message || err.message || 'Không thể gửi duyệt hồ sơ.')
                                }
                            }}
                            disabled={submitForApprovalMutation.isPending}
                        >
                            Xác nhận gửi duyệt
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CourseProfileSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                profile={selectedProfile}
                onSuccessCreate={(id) => {
                    navigate(`/academy/course-profiles/${id}/detail?tab=curriculum`);
                    setSheetOpen(false);
                }}
            />

            <DuplicateCourseDialog
                open={duplicateOpen}
                onOpenChange={setDuplicateOpen}
                profile={selectedProfile}
            />
        </div>
    );
}
