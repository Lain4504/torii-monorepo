import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Plus, BookOpen, Search, Pencil, Eye, Copy, Archive } from 'lucide-react';
import { useAcademyCourseProfiles, type AcademyCourseProfile, useArchiveAcademyCourseProfile } from '@/lib/api/services/academy-course-profiles';
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
import { format } from 'date-fns';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { toast } from 'sonner';

import { CourseProfileSheet } from './components/course-profile-sheet';
import { DuplicateCourseDialog } from './components/duplicate-course-dialog';

export default function CourseProfilesPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [duplicateOpen, setDuplicateOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<AcademyCourseProfile | null>(null);

    const { data: profiles, isLoading } = useAcademyCourseProfiles({
        q: debouncedSearch,
    });

    const archiveMutation = useArchiveAcademyCourseProfile();

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

    const handleArchive = async (id: string, code: string) => {
        if (!confirm(`Bạn có chắc muốn lưu trữ khóa học ${code}? Thao tác này sẽ làm đóng băng giáo trình.`)) return;
        
        try {
            await archiveMutation.mutateAsync(id);
            toast.success(`Hồ sơ ${code} đã được lưu trữ.`);
        } catch (err: any) {
            toast.error(err.message || "Không thể lưu trữ hồ sơ.");
        }
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
                                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto mr-4" /></TableCell>
                                    </TableRow>
                                ))
                            ) : profiles?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
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
                                                    <span className="text-[10px] text-muted-foreground">Tạo ngày: {format(new Date(profile.createdAt), 'dd/MM/yyyy')}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-[10px] uppercase bg-background shadow-xs">{profile.level || 'JLPT'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {(profile as any).status === 'ARCHIVED' ? (
                                                <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-none">Đã lưu trữ</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">Đang sử dụng</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-1.5 hover:bg-primary/5 hover:text-primary"
                                                    onClick={() => handleDuplicate(profile)}
                                                    title="Nhân bản cho năm mới"
                                                >
                                                    <Copy className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Nhân bản</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-1.5 font-bold"
                                                    onClick={() => navigate(`/academy/course-profiles/${profile.id}/detail`)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Chi tiết</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-1.5 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleEdit(profile)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                {(profile as any).status !== 'ARCHIVED' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-orange-600 hover:bg-orange-50"
                                                        onClick={() => handleArchive(profile.id, profile.code)}
                                                        title="Lưu trữ"
                                                    >
                                                        <Archive className="h-3.5 w-3.5" />
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

            <CourseProfileSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                profile={selectedProfile}
            />

            <DuplicateCourseDialog
                open={duplicateOpen}
                onOpenChange={setDuplicateOpen}
                profile={selectedProfile}
            />
        </div>
    );
}
