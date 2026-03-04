import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    ChevronLeft,
    AlertCircle,
    Search,
    Pencil,
    Layers,
    CheckCircle2,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { Input } from "@workspace/ui/components/input";
import { useQuestionPool } from '@/lib/api/services/question-pools';
import {
    useQuestionsByPool,
    useApproveQuestion,
    useDeactivateQuestion,
    useRejectQuestion,
    useSendForReviewQuestion,
} from '@/lib/api/services/questions';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { PoolQuestionsTable } from '@/components/question-pools/pool-questions-table';
import { QuestionFormSheet } from '@/components/questions/question-form-sheet';
import { QuestionDetailSheet } from '@/components/questions/question-detail-sheet';
import { DeleteQuestionDialog } from '@/components/questions/delete-question-dialog';
import { EditQuestionPoolDialog } from '@/components/question-pools/edit-question-pool-sheet';
import { Badge } from '@workspace/ui/components/badge';
import { toast } from '@workspace/ui/components/sonner';

export default function PoolDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: pool, isLoading: isLoadingPool } = useQuestionPool(id || '');
    const { data: questions = [], isLoading: isLoadingQuestions } = useQuestionsByPool(id || '');

    const [search, setSearch] = useState('');
    const [viewingQuestion, setViewingQuestion] = useState<QuestionResponseDTO | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<QuestionResponseDTO | null>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<QuestionResponseDTO | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditPoolDialogOpen, setIsEditPoolDialogOpen] = useState(false);

    // Status workflow mutations
    const approveMutation = useApproveQuestion();
    const deactivateMutation = useDeactivateQuestion();
    const rejectMutation = useRejectQuestion();
    const sendForReviewMutation = useSendForReviewQuestion();

    const filteredQuestions = useMemo(() => {
        return questions.filter(q =>
            q.questionText.toLowerCase().includes(search.toLowerCase())
        );
    }, [questions, search]);

    const handleApprove = async (question: QuestionResponseDTO) => {
        try {
            await approveMutation.mutateAsync(question.id);
            toast.success('Câu hỏi đã được phê duyệt');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Phê duyệt thất bại');
        }
    };

    const handleReject = async (question: QuestionResponseDTO) => {
        try {
            await rejectMutation.mutateAsync(question.id);
            toast.success('Đã từ chối câu hỏi');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Từ chối thất bại');
        }
    };

    const handleDeactivate = async (question: QuestionResponseDTO) => {
        try {
            await deactivateMutation.mutateAsync(question.id);
            toast.success('Câu hỏi đã ngưng hoạt động');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Ngưng hoạt động thất bại');
        }
    };

    const handleSendForReview = async (question: QuestionResponseDTO) => {
        try {
            await sendForReviewMutation.mutateAsync(question.id);
            toast.success('Đã gửi câu hỏi để xét duyệt');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Gửi xét duyệt thất bại');
        }
    };

    if (isLoadingPool) {
        return <PageLoading text="Đang tải dữ liệu bộ câu hỏi..." className="min-h-[60vh]" />;
    }

    if (!pool) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="size-12 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
                    <AlertCircle className="size-6" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Không tìm thấy bộ đề</h2>
                    <p className="text-sm text-muted-foreground">Bộ đề bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/question-bank')}>
                    <ChevronLeft className="mr-2 size-4" />
                    Quay về danh sách
                </Button>
            </div>
        );
    }

    // Stats breakdown
    const activeCount = questions.filter(q => q.status === 'active').length;
    const reviewCount = questions.filter(q => q.status === 'review').length;
    const inactiveCount = questions.filter(q => q.status === 'inactive').length;

    return (
        <div className="flex flex-col gap-8 pb-20">
            <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 text-muted-foreground"
                onClick={() => navigate('/question-bank')}
            >
                <ChevronLeft className="mr-2 size-4" />
                Quay lại danh sách
            </Button>

            {/* Card chi tiết kho đề */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                <Layers className="size-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                                    {pool.name}
                                </CardTitle>
                                <CardDescription className="text-sm font-medium max-w-2xl leading-relaxed">
                                    {pool.description || "Danh sách tổng hợp các câu hỏi tri thức thuộc bộ đề này."}
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="h-6 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                                {pool.jlptLevel || 'GLOBAL'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Button
                            variant="outline"
                            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setIsEditPoolDialogOpen(true)}
                        >
                            <Pencil className="mr-2 size-3.5 opacity-60" />
                            Sửa thông tin
                        </Button>
                        <Button
                            className="h-9 px-6 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <Plus className="mr-2 size-4" />
                            Thêm câu hỏi
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/40 border border-border/40 p-4 rounded-xl flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                                <Layers className="size-3" />
                                Tổng số câu
                            </span>
                            <span className="text-2xl font-black tracking-tight">{questions.length}</span>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80 flex items-center gap-2">
                                <CheckCircle2 className="size-3" />
                                Đang hoạt động
                            </span>
                            <span className="text-2xl font-black tracking-tight text-emerald-600">{activeCount}</span>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/80 flex items-center gap-2">
                                <AlertTriangle className="size-3" />
                                Chờ xét duyệt
                            </span>
                            <span className="text-2xl font-black tracking-tight text-amber-600">{reviewCount}</span>
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500/80 flex items-center gap-2">
                                <XCircle className="size-3" />
                                Ngừng bán/Dừng
                            </span>
                            <span className="text-2xl font-black tracking-tight text-rose-600">{inactiveCount}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card danh sách câu hỏi */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold">Câu hỏi trong kho đề</CardTitle>
                        <CardDescription>
                            Quản lý các câu hỏi thuộc kho đề này. Bạn có thể thêm mới, chỉnh sửa hoặc thay đổi trạng thái câu hỏi.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                            <Input
                                placeholder="Tìm kiếm nội dung câu hỏi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            className="md:w-auto w-full text-[11px] font-black uppercase tracking-[0.16em]"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <Plus className="mr-2 size-4" />
                            Thêm câu hỏi
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <PoolQuestionsTable
                        data={filteredQuestions}
                        isLoading={isLoadingQuestions}
                        onView={setViewingQuestion}
                        onEdit={setEditingQuestion}
                        onDelete={setDeletingQuestion}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDeactivate={handleDeactivate}
                        onSendForReview={handleSendForReview}
                    />
                </CardContent>
            </Card>

            {/* Sheets & Dialogs */}
            <QuestionFormSheet
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                defaultPoolId={id || ''}
            />

            <EditQuestionPoolDialog
                open={isEditPoolDialogOpen}
                onOpenChange={setIsEditPoolDialogOpen}
                pool={pool}
            />

            <QuestionDetailSheet
                open={!!viewingQuestion}
                onOpenChange={(open) => !open && setViewingQuestion(null)}
                question={viewingQuestion}
            />

            <QuestionFormSheet
                open={!!editingQuestion}
                onOpenChange={(open) => !open && setEditingQuestion(null)}
                question={editingQuestion}
            />

            <DeleteQuestionDialog
                open={!!deletingQuestion}
                onOpenChange={(open) => !open && setDeletingQuestion(null)}
                question={deletingQuestion}
            />
        </div>
    );
}
