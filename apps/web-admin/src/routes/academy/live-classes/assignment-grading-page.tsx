import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import {
    ChevronRight,
    FileEdit,
    Download,
    Search,
    User,
    Clock,
    CheckCircle2,
} from 'lucide-react';
import { useAcademyClassAssignment } from '@/lib/api/services/academy-class-assignments';
import { useAcademyAssignmentSubmissions } from '@/lib/api/services/academy-assignment-submissions';
import type { AcademyAssignmentSubmission } from '@/lib/api/services/academy-assignment-submissions';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { Input } from '@workspace/ui/components/input';
import { formatDate, formatDateTime } from "@/lib/format-utils"
import { listPageSearchWrapClass } from "@/lib/ui-shell"

function submissionToRow(s: AcademyAssignmentSubmission) {
    const grade = s.score ?? s.grade;
    const num = typeof grade === 'number' ? grade : (grade != null ? Number(grade) : null);
    return {
        id: s.id,
        user: s.user,
        submittedAt: s.submittedAt,
        status: s.status ?? 'SUBMITTED',
        rawScore: num ?? null,
        maxScore: 10,
    };
}

export default function AssignmentGradingPage() {
    const { assessmentId } = useParams<{ classId: string; assessmentId: string }>();
    const [search, setSearch] = useState('');

    const classAssignmentQuery = useAcademyClassAssignment(assessmentId);
    const classAssignment = classAssignmentQuery.data;

    const submissionsQuery = useAcademyAssignmentSubmissions(
        { classAssessmentId: assessmentId! },
        { enabled: !!classAssignment && !classAssignmentQuery.isError }
    );

    const isLoading = classAssignmentQuery.isLoading && !classAssignment;

    if (isLoading) {
        return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
    }

    if (!classAssignment || classAssignmentQuery.isError) {
        return <div className="p-8">Không tìm thấy bài tập.</div>;
    }

    const title = classAssignment?.assignment?.title ?? classAssignment?.titleOverride ?? 'Bài tập';
    const rows = (submissionsQuery.data ?? []).map(submissionToRow);
    const isLoadingRows = submissionsQuery.isLoading;

    const filteredRows = rows.filter(r =>
        r.user?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    const submittedCount = rows.filter(r => r.submittedAt).length;
    const gradedCount = rows.filter(r => r.status === 'GRADED' || r.status === 'COMPLETED').length;
    const pendingCount = rows.filter(r => r.status === 'SUBMITTED').length;

    return (
        <div className="space-y-6">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Link to="/academy/live-classes" className="hover:underline text-muted-foreground transition-colors">Lớp học</Link>
                        <ChevronRight className="size-4" />
                        <span>Chấm điểm: {title}</span>
                    </div>
                }
                subtitle={`Quản lý và chấm điểm bài nộp của sinh viên cho bài tập này.`}
                actions={
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Xuất bảng điểm (CSV)
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Tổng sinh viên</p>
                    <p className="text-2xl font-bold">--</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Đã nộp</p>
                    <p className="text-2xl font-bold text-blue-500">{submittedCount}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Đã chấm</p>
                    <p className="text-2xl font-bold text-green-500">{gradedCount}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Chưa chấm</p>
                    <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <div className={listPageSearchWrapClass}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm sinh viên..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {isLoadingRows ? (
                    <div className="p-8"><Skeleton className="h-48 w-full" /></div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Sinh viên</TableHead>
                                <TableHead>Ngày nộp</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Điểm số</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Không có bài nộp nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows.map((row) => (
                                    <TableRow key={row.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-secondary flex items-center justify-center">
                                                    <User className="size-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{row.user?.displayName || 'N/A'}</span>
                                                    <span className="text-xs text-muted-foreground">{row.user?.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {row.submittedAt ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{formatDate(row.submittedAt)}</span>
                                                    <span className="text-xs text-muted-foreground">{formatDateTime(row.submittedAt, "HH:mm")}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Chưa nộp</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {row.status === 'SUBMITTED' && (
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                    <Clock className="size-3 mr-1" /> Chờ chấm
                                                </Badge>
                                            )}
                                            {(row.status === 'GRADED' || row.status === 'COMPLETED') ? (
                                                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                    <CheckCircle2 className="size-3 mr-1" /> Đã chấm
                                                </Badge>
                                            ) : null}
                                            {row.status === 'IN_PROGRESS' ? (
                                                <Badge variant="outline">Đang làm</Badge>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-lg">
                                                {row.rawScore !== null ? row.rawScore : '--'}
                                                <span className="text-sm font-normal text-muted-foreground ml-1">/ {row.maxScore}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                                                    <FileEdit className="size-4" /> Chấm điểm
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                                                    <Download className="size-4" /> Tải bài làm
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
