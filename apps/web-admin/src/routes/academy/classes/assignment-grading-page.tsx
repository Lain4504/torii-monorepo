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
import {
    useAcademyClassAssessment,
    useAcademyClassAssessmentAttempts
} from '@/lib/api/services/academy-class-assessments';
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

export default function AssignmentGradingPage() {
    const { assessmentId } = useParams<{ classId: string; assessmentId: string }>();
    const { data: assessment, isLoading: isAssessmentLoading } = useAcademyClassAssessment(assessmentId);
    const { data: attempts, isLoading: isAttemptsLoading } = useAcademyClassAssessmentAttempts(assessmentId);
    const [search, setSearch] = useState('');

    if (isAssessmentLoading || isAttemptsLoading) {
        return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
    }

    if (!assessment) return <div>Không tìm thấy bài tập.</div>;

    const filteredAttempts = attempts?.filter(a =>
        a.user?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        a.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Link to="/academy/classes" className="hover:underline text-muted-foreground transition-colors">Lớp học</Link>
                        <ChevronRight className="size-4" />
                        <span>Chấm điểm: {assessment.titleOverride || assessment.kind}</span>
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
                    <p className="text-2xl font-bold text-blue-500">{attempts?.length || 0}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Đã chấm</p>
                    <p className="text-2xl font-bold text-green-500">{attempts?.filter(a => a.status === 'GRADED' || a.status === 'COMPLETED').length || 0}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Chưa chấm</p>
                    <p className="text-2xl font-bold text-yellow-500">{attempts?.filter(a => a.status === 'SUBMITTED').length || 0}</p>
                </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm sinh viên..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

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
                        {filteredAttempts?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    Không có bài nộp nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAttempts?.map((attempt) => (
                                <TableRow key={attempt.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-secondary flex items-center justify-center">
                                                <User className="size-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{attempt.user?.displayName || 'N/A'}</span>
                                                <span className="text-xs text-muted-foreground">{attempt.user?.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {attempt.submittedAt ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm">{formatDate(attempt.submittedAt)}</span>
                                                <span className="text-xs text-muted-foreground">{formatDateTime(attempt.submittedAt, "HH:mm")}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">Chưa nộp</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {attempt.status === 'SUBMITTED' && (
                                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                <Clock className="size-3 mr-1" /> Chờ chấm
                                            </Badge>
                                        )}
                                        {attempt.status === 'GRADED' || attempt.status === 'COMPLETED' ? (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                <CheckCircle2 className="size-3 mr-1" /> Đã chấm
                                            </Badge>
                                        ) : attempt.status === 'IN_PROGRESS' ? (
                                            <Badge variant="outline">Đang làm</Badge>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-lg">
                                            {attempt.rawScore !== null ? attempt.rawScore : '--'}
                                            <span className="text-sm font-normal text-muted-foreground ml-1">/ {attempt.maxScore || 10}</span>
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
            </div>
        </div>
    );
}
