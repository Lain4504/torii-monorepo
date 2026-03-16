import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Plus, BookOpen, Search, Pencil, Eye, LayoutTemplate } from 'lucide-react';
import { useAcademyCourseProfiles, type AcademyCourseProfile } from '@/lib/api/services/academy-course-profiles';
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

import { CourseProfileDialog } from './components/course-profile-dialog';

export default function CourseProfilesPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<AcademyCourseProfile | null>(null);

    const { data: profiles, isLoading } = useAcademyCourseProfiles({
        q: debouncedSearch,
    });

    const handleCreate = () => {
        setSelectedProfile(null);
        setDialogOpen(true);
    };

    const handleEdit = (profile: AcademyCourseProfile) => {
        setSelectedProfile(profile);
        setDialogOpen(true);
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Kho hồ sơ khóa học"
                subtitle="Quản lý định nghĩa cốt lõi của các khóa học, cấp độ và lộ trình học thuật."
                actions={
                    <Button size="lg" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo Profile mới
                    </Button>
                }
            />

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo mã hoặc tiêu đề..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="rounded-md border bg-card overflow-hidden text-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12">STT</TableHead>
                                <TableHead className="w-[150px]">Mã Code</TableHead>
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Cấp độ</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : profiles?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Không tìm thấy Course Profile nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                profiles?.map((profile, index) => (
                                    <TableRow key={profile.id} className="group">
                                        <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                        <TableCell className="font-mono font-bold text-xs">{profile.code}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <BookOpen className="size-4 text-primary" />
                                                </div>
                                                <span className="font-medium">{profile.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-[10px] uppercase">Level {profile.level || '?'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(profile.createdAt), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5"
                                                    onClick={() => navigate(`/academy/syllabuses/${profile.id}`)}
                                                >
                                                    <LayoutTemplate className="h-4 w-4" /> Syllabus
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5"
                                                    onClick={() => navigate(`/academy/course-profiles/${profile.id}/detail`)}
                                                >
                                                    <Eye className="h-4 w-4" /> Chi tiết
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 text-primary border-primary/40"
                                                    onClick={() => handleEdit(profile)}
                                                >
                                                    <Pencil className="h-4 w-4" /> Chỉnh sửa
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CourseProfileDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                profile={selectedProfile}
            />
        </div>
    );
}
