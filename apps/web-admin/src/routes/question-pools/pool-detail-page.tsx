import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    ChevronLeft,
    AlertCircle,
    Search,
    Filter,
} from 'lucide-react';
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { useQuestionPool } from '@/api/services/question-pools';
import { useQuestionsByPool } from '@/api/services/questions';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { PageHeader } from '@/components/common/page-header';
import { QuestionsTable } from '@/components/question-pools/questions-table.tsx';
import { QuestionFormSheet } from '@/components/questions/question-form-sheet';
import { QuestionDetailSheet } from '@/components/questions/question-detail-sheet';
import { DeleteQuestionDialog } from '@/components/questions/delete-question-dialog.tsx';

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

    const filteredQuestions = useMemo(() => {
        return questions.filter(q =>
            q.questionText.toLowerCase().includes(search.toLowerCase())
        );
    }, [questions, search]);

    if (isLoadingPool) {
        return <PageLoading text="Đang tải dữ liệu bộ câu hỏi..." className="min-h-[60vh]" />;
    }

    if (!pool) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500 max-w-lg mx-auto px-6">
                <div className="p-6 rounded-3xl bg-destructive/5 border border-destructive/20">
                    <AlertCircle className="size-12 text-destructive/60 mx-auto" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-sans font-bold italic tracking-tight uppercase">Không tìm thấy bộ đề</h2>
                    <p className="text-xs font-medium text-muted-foreground">Bộ đề bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
                </div>
                <Button variant="outline" className="h-10 px-6 rounded-xl" onClick={() => navigate('/question-bank')}>
                    <ChevronLeft className="mr-2 size-3.5" />
                    Quay về danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-muted-foreground hover:text-foreground gap-2 transition-colors hover:bg-transparent -ml-2 w-fit"
                    onClick={() => navigate('/question-bank')}
                >
                    <ChevronLeft className="size-4" />
                    <span className="text-xs font-sans font-bold italic uppercase tracking-wider">Quay lại danh sách</span>
                </Button>

                <PageHeader
                    title={pool.name}
                    subtitle={pool.description || "Danh sách tổng hợp các câu hỏi tri thức thuộc bộ đề này."}
                    stats={[
                        { label: "Tổng số câu hỏi", value: questions.length },
                        { label: "Cấp độ", value: pool.jlptLevel || 'GLOBAL' },
                        { label: "Lần cuối cập nhật", value: new Date(pool.updatedAt).toLocaleDateString('vi-VN') },
                    ]}
                    actions={
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
                        >
                            Thêm Câu Hỏi Mới
                            <Plus className="ml-2 size-4" />
                        </Button>
                    }
                />
            </div>

            <div className="space-y-4">
                <Card className="bg-card p-4 rounded-xl border-border shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                                placeholder="Tìm kiếm nội dung câu hỏi trong bộ đề..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 pl-9 rounded-lg border-border bg-background focus-visible:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <Button variant="outline" className="h-10 px-4 rounded-lg flex gap-2 text-xs font-bold uppercase tracking-wider">
                            <Filter className="size-4 opacity-40" />
                            Lọc nâng cao
                        </Button>
                    </div>
                </Card>

                <Card className="bg-card p-0 rounded-xl border-border overflow-hidden shadow-sm">
                    <QuestionsTable
                        data={filteredQuestions}
                        isLoading={isLoadingQuestions}
                        onView={setViewingQuestion}
                        onEdit={setEditingQuestion}
                        onDelete={setDeletingQuestion}
                    />
                </Card>
            </div>

            {/* Sheets & Dialogs */}
            <QuestionFormSheet
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                defaultPoolId={id || ''}
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
