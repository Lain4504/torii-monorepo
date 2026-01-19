import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, Plus, Database, FileQuestion, Target, Layout, Activity, Zap, BrainCircuit, Fingerprint, Clock, Inbox, ShieldAlert } from 'lucide-react';
import { useQuestionPool } from '@/api/services/question-pools.ts';
import { useQuestionsByPool } from '@/api/services/questions.ts';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
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
import { Card } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative">
                    <Database className="size-12 text-primary animate-pulse" />
                    <Activity className="absolute -top-1 -right-1 size-4 text-emerald-500 animate-bounce" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground/80">Accessing Knowledge Node</h2>
                    <p className="text-sm text-muted-foreground/60">Decrypting data streams from central repository...</p>
                </div>
            </div>
        );
    }

    if (poolError || !pool) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                <div className="w-24 h-24 rounded-[3rem] bg-destructive/5 flex items-center justify-center border border-dashed border-destructive/20 relative">
                    <div className="absolute inset-0 bg-destructive/5 blur-3xl animate-pulse" />
                    <ShieldAlert className="size-12 text-destructive/40 relative z-10" />
                </div>
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight text-destructive/60">Node Sync Failed</h2>
                    <p className="text-base text-muted-foreground/60 max-w-md mx-auto">
                        Identified sequence mismatch or repository corruption. <br />
                        {poolError?.message || 'CRITICAL: Knowledge node reference is invalid.'}
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/question-bank/pools')}
                    className="h-14 px-10 rounded-2xl bg-muted/20 hover:bg-muted/30 border border-border/10 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <ArrowLeft className="mr-3 size-4 opacity-40" />
                    Return to Registry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Sticky Sub-Header */}
            <div className="sticky top-0 z-40 -mt-6 pt-6 pb-4 bg-background/40 backdrop-blur-3xl border-b border-border/10 px-2 lg:px-6 mb-8">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="size-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all group"
                        >
                            <Link to="/question-bank/pools">
                                <ArrowLeft className="size-5 opacity-40 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                            </Link>
                        </Button>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Database className="size-4 text-primary opacity-40" />
                                <h1 className="text-xl font-bold tracking-tight text-foreground">{pool.name}</h1>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-black tracking-widest rounded-full px-3">
                                    NODE ACTIVE
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 hidden sm:flex">
                        <div className="flex items-center gap-3 text-right">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Registry Level</span>
                                <span className="text-[12px] font-black italic text-primary">{pool.jlptLevel || 'N/A'}</span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/20">
                                <Target className="size-5 text-primary opacity-60" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-2 lg:px-6 max-w-[1400px] mx-auto space-y-12">
                {/* Main Content Portal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Metadata & Actions */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 p-8 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Fingerprint className="size-32" />
                            </div>

                            <div className="space-y-2 relative">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Repository Signature</p>
                                <h2 className="text-3xl font-bold tracking-tight text-foreground/80 leading-none">{pool.name}</h2>
                                <p className="text-sm text-muted-foreground/60 mt-4 leading-relaxed line-clamp-4">
                                    {pool.description || 'System generated knowledge node. No extensive documentation provided in current registry cycle.'}
                                </p>
                            </div>

                            <div className="space-y-6 relative border-t border-border/10 pt-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-muted/20 flex items-center justify-center">
                                            <FileQuestion className="size-4 text-muted-foreground/40" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Unit Payload</span>
                                    </div>
                                    <span className="text-sm font-bold">{questions?.length || 0} Entities</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-muted/20 flex items-center justify-center">
                                            <Zap className="size-4 text-muted-foreground/40" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Sync Protocol</span>
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[8px] font-black rounded-lg px-2">AUTOMATIC</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-muted/20 flex items-center justify-center">
                                            <Layout className="size-4 text-muted-foreground/40" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Linked Assets</span>
                                    </div>
                                    <span className="text-[10px] font-black italic uppercase tracking-widest">{pool.courseId ? 'COURSE TIED' : 'UNALIGNED'}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowCreateDialog(true)}
                                className="w-full h-16 rounded-[1.5rem] bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all relative group"
                            >
                                <Plus className="mr-3 size-5 group-hover:rotate-90 transition-transform duration-500" />
                                <span className="text-xs font-black uppercase tracking-widest">Append Logic Unit</span>
                                <div className="absolute inset-0 rounded-[1.5rem] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </Button>
                        </Card>

                        {/* Additional Info / Protocol Box */}
                        <div className="p-8 rounded-[2.5rem] border border-border/10 bg-muted/5 space-y-4">
                            <div className="flex items-center gap-3 text-muted-foreground/30 uppercase tracking-[0.3em] font-black text-[9px]">
                                <Clock className="size-3" />
                                Registry Cycle 2024.08
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground/40 italic leading-relaxed">
                                All units appended to this pool will inherit the matrix level default <span className="text-foreground/40">({pool.jlptLevel || 'GLOBAL'})</span>.
                                Cross-registry sync is enabled for active training sessions.
                            </p>
                        </div>
                    </div>

                    {/* Right: Questions Registry */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-2xl bg-primary/5 text-primary border border-primary/10">
                                    <BrainCircuit className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground/80">Questions Registry</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30">Detailed manifest of logic node payload.</p>
                                </div>
                            </div>
                        </div>

                        <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table className="min-w-[800px] border-collapse bg-transparent">
                                    <TableHeader className="bg-muted/10 border-b border-border/20">
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-8">#</TableHead>
                                            <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Prompt Architecture</TableHead>
                                            <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Unit Type</TableHead>
                                            <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-6">Status</TableHead>
                                            <TableHead className="h-14 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-8 text-right">Protocol</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {questionsLoading ? (
                                            Array.from({ length: 5 }).map((_, index) => (
                                                <TableRow key={index} className="border-b border-border/10">
                                                    <TableCell className="px-8 py-6"><Skeleton className="h-4 w-8 bg-muted/20 rounded-xl" /></TableCell>
                                                    <TableCell className="px-6 py-6"><Skeleton className="h-6 w-full max-w-sm bg-muted/20 rounded-xl" /></TableCell>
                                                    <TableCell className="px-6 py-6"><Skeleton className="h-6 w-24 bg-muted/20 rounded-xl" /></TableCell>
                                                    <TableCell className="px-6 py-6"><Skeleton className="h-6 w-20 bg-muted/20 rounded-xl" /></TableCell>
                                                    <TableCell className="px-8 py-6 text-right"><Skeleton className="h-10 w-24 bg-muted/20 rounded-xl ml-auto" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : questions && questions.length > 0 ? (
                                            questions.map((question, index) => (
                                                <TableRow
                                                    key={question.id}
                                                    className="border-b border-border/10 hover:bg-primary/[0.02] transition-all duration-500 group"
                                                >
                                                    <TableCell className="px-8 font-black italic text-muted-foreground/30 tabular-nums text-[10px]">
                                                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                                    </TableCell>
                                                    <TableCell className="px-6">
                                                        <div className="flex flex-col gap-1 cursor-pointer" onClick={() => setViewingQuestion(question)}>
                                                            <div className="font-bold text-[13px] text-foreground/80 group-hover:text-primary transition-colors uppercase tracking-tight truncate max-w-[300px]">{question.questionText}</div>
                                                            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">{question.category || 'GENERAL DOMAIN'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6">
                                                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/10 border border-border/10 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                                            {question.questionType}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6">
                                                        <div className={cn(
                                                            "inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                                            question.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted/10 text-muted-foreground border-border/20"
                                                        )}>
                                                            <div className={cn("size-1 rounded-full mr-2", question.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-current")} />
                                                            {question.status}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 text-right">
                                                        <div className="flex items-center justify-end gap-2 pr-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setViewingQuestion(question)}
                                                                className="h-9 px-4 rounded-xl hover:bg-primary/10 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all"
                                                            >
                                                                Inspect
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveFromPool(question)}
                                                                className="h-9 px-4 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-all"
                                                            >
                                                                Eject
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell colSpan={7} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center p-12 space-y-6">
                                                        <div className="w-20 h-20 rounded-[1.5rem] bg-muted/20 flex items-center justify-center border border-border/40 relative">
                                                            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                                            <Inbox className="size-10 text-muted-foreground/20 relative z-10" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-xl font-bold uppercase tracking-tight text-foreground/40">Logic Gap Detected</h3>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/20">No question entities mapped to this repository node.</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
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
