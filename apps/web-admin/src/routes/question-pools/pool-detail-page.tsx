import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, Plus, Database, FileQuestion } from 'lucide-react';
import { useQuestionPool, useQuestionPools } from '@/api/services/question-pools.ts';
import { useQuestionsByPool } from '@/api/services/questions.ts';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { CreateQuestionDialog } from '@/components/questions/create-question-dialog.tsx';
import { ViewQuestionDialog } from '@/components/questions/view-question-dialog.tsx';
import { DeleteQuestionDialog } from '@/components/questions/delete-question-dialog.tsx';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateQuestion } from '@/api/services/questions.ts';

export default function PoolDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: pool, isLoading: poolLoading, error: poolError } = useQuestionPool(id || '');
    const { data: questions, isLoading: questionsLoading } = useQuestionsByPool(id || '');

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [viewingQuestion, setViewingQuestion] = useState<QuestionResponseDTO | null>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<QuestionResponseDTO | null>(null);

    const updateQuestion = useUpdateQuestion();

    const handleRemoveFromPool = async (question: QuestionResponseDTO) => {
        try {
            await updateQuestion.mutateAsync({
                id: question.id,
                question: { poolId: undefined },
            });
            toast.success('Question removed from pool');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove question from pool');
        }
    };

    if (poolLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (poolError || !pool) {
        return (
            <div className="p-6">
                <div className="text-center text-rose-500 py-8">
                    Error: {poolError?.message || 'Pool not found'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4 flex-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/question-bank/pools')}
                        className="rounded-full"
                        asChild
                    >
                        <Link to="/question-bank/pools">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="space-y-1 sm:space-y-1.5 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-2">
                            <Database className="h-6 w-6" />
                            {pool.name}
                        </h1>
                        {pool.description && (
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                {pool.description}
                            </p>
                        )}
                    </div>
                </div>
                <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full sm:w-auto rounded-full shadow-sm hover:shadow-md transition-all bg-primary min-h-[44px] px-6"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            {/* Pool Info */}
            <div className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow duration-300 rounded-xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Total Questions</p>
                            <p className="text-lg font-semibold">{questions?.length || 0}</p>
                        </div>
                    </div>
                    {pool.jlptLevel && (
                        <div>
                            <p className="text-xs text-muted-foreground">JLPT Level</p>
                            <Badge variant="outline" className="mt-1">
                                {pool.jlptLevel}
                            </Badge>
                        </div>
                    )}
                    {pool.courseId && (
                        <div>
                            <p className="text-xs text-muted-foreground">Course</p>
                            <Badge variant="outline" className="mt-1">
                                Linked
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Questions Table */}
            <div className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow duration-300 rounded-xl p-0 overflow-hidden">
                <div className="p-6 pb-0">
                    <h2 className="text-lg font-semibold">Questions in Pool</h2>
                </div>

                <div className="mt-6">
                    <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/20">
                                    <TableRow className="border-border/40 hover:bg-transparent">
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">#</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Question</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Type</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Category</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Difficulty</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Status</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questionsLoading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index} className="border-border/20">
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : questions && questions.length > 0 ? (
                                        questions.map((question, index) => (
                                            <TableRow
                                                key={question.id}
                                                className="border-border/20 hover:bg-muted/30 transition-colors"
                                            >
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap text-center">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 max-w-[300px] truncate">
                                                    {question.questionText}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap">
                                                    <Badge variant="outline" className="font-normal bg-background/50">
                                                        {question.questionType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap">
                                                    {question.category ? (
                                                        <Badge variant="outline" className="font-normal bg-background/50">
                                                            {question.category}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap">
                                                    {question.difficulty ? (
                                                        <Badge variant="outline" className="font-normal bg-background/50">
                                                            {question.difficulty}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap">
                                                    <Badge variant="outline" className="font-normal bg-background/50">
                                                        {question.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setViewingQuestion(question)}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFromPool(question)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell
                                                colSpan={7}
                                                className="h-24 text-center text-muted-foreground border-none"
                                            >
                                                <div className="flex h-full w-full items-center justify-center p-8">
                                                    <Empty>
                                                        <EmptyHeader>
                                                            <EmptyMedia variant="icon" className="text-muted-foreground/30">
                                                                <FileQuestion />
                                                            </EmptyMedia>
                                                            <EmptyTitle>No questions in this pool</EmptyTitle>
                                                            <EmptyDescription>
                                                                Add questions to this pool to get started.
                                                            </EmptyDescription>
                                                        </EmptyHeader>
                                                    </Empty>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <CreateQuestionDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                defaultPoolId={pool.id}
            />

            <ViewQuestionDialog
                open={!!viewingQuestion}
                onOpenChange={(open) => !open && setViewingQuestion(null)}
                question={viewingQuestion}
            />

            <DeleteQuestionDialog
                open={!!deletingQuestion}
                onOpenChange={(open) => !open && setDeletingQuestion(null)}
                question={deletingQuestion}
            />
        </div>
    );
}

