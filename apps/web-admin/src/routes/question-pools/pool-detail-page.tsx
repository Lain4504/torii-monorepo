import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    ChevronLeft,
    AlertCircle,
    Search,
} from 'lucide-react';
import { Input } from "@workspace/ui/components/input";
import { useQuestionPool } from '@/api/services/question-pools';
import { useQuestionsByPool } from '@/api/services/questions';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { PageHeader } from '@/components/common/page-header';
import { PoolQuestionsTable } from '@/components/question-pools/pool-questions-table';
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

    return (
        <div className="flex flex-col gap-8 pb-20">
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit -ml-2 text-muted-foreground"
                    onClick={() => navigate('/question-bank')}
                >
                    <ChevronLeft className="mr-2 size-4" />
                    Quay lại danh sách
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
                        >
                            <Plus className="mr-2 size-4" />
                            Thêm Câu Hỏi Mới
                        </Button>
                    }
                />
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                        <Input
                            placeholder="Tìm kiếm nội dung câu hỏi trong bộ đề..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Card>
                    <PoolQuestionsTable
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
