import { Input } from '@workspace/ui/components/input';
import { Layers, Layout, Target, Zap, Activity } from 'lucide-react';
import { cn } from "@workspace/ui/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { QuestionType, QuestionStatus, QuestionCategory, QuestionDifficultyLevel, QuestionJlptLevel } from '@workspace/schemas';
import { useQuestionPools } from '@/api/services/question-pools.ts';

interface QuestionsPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    questionTypeFilter: string;
    onQuestionTypeFilterChange: (value: string) => void;
    categoryFilter: string;
    onCategoryFilterChange: (value: string) => void;
    jlptLevelFilter: string;
    onJlptLevelFilterChange: (value: string) => void;
    difficultyFilter: string;
    onDifficultyFilterChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    poolIdFilter?: string;
    onPoolIdFilterChange?: (value: string) => void;
}

export function QuestionsPrimaryToolbar({
    search,
    onSearchChange,
    questionTypeFilter,
    onQuestionTypeFilterChange,
    categoryFilter,
    onCategoryFilterChange,
    jlptLevelFilter,
    onJlptLevelFilterChange,
    difficultyFilter,
    onDifficultyFilterChange,
    statusFilter,
    onStatusFilterChange,
    poolIdFilter,
    onPoolIdFilterChange,
}: QuestionsPrimaryToolbarProps) {
    const { data: poolsData } = useQuestionPools({ page: 1, limit: 100 });

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="relative group">
                <Input
                    placeholder="ENTER LOGIC PROMPT OR ASSET IDENTIFIER..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-12 pl-6 rounded-2xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all text-[11px] font-black uppercase tracking-[0.15em] placeholder:text-muted-foreground/20"
                />
            </div>

            {/* Matrix Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Question Type Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { value: 'all', label: 'All Units' },
                        { value: QuestionType.MULTIPLE_CHOICE, label: 'MCQ Unit' },
                        { value: QuestionType.TRUE_FALSE, label: 'Polar Logic' },
                        { value: QuestionType.FILL_BLANK, label: 'Gaps Sync' },
                        { value: QuestionType.MATCHING, label: 'Node Pair' },
                        { value: QuestionType.ESSAY, label: 'Free Form' },
                    ].map((type) => (
                        <button
                            key={type.value}
                            onClick={() => onQuestionTypeFilterChange(type.value === 'all' ? '' : type.value)}
                            className={cn(
                                "rounded-full h-9 px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                                "rounded-full h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                                (type.value === 'all' && !questionTypeFilter) || questionTypeFilter === type.value
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-muted/10 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                <Select
                    value={categoryFilter || 'all'}
                    onValueChange={(value) =>
                        onCategoryFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-12 min-w-[140px] px-4 rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-[9px] font-black uppercase tracking-widest focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Layers className="size-3.5 opacity-30" />
                            <SelectValue placeholder="CATEGORY" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2">
                        <SelectItem value="all" className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL DOMAINS</SelectItem>
                        <SelectItem value={QuestionCategory.VOCAB} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">VOCABULARY</SelectItem>
                        <SelectItem value={QuestionCategory.GRAMMAR} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">GRAMMAR</SelectItem>
                        <SelectItem value={QuestionCategory.READING} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">READING</SelectItem>
                        <SelectItem value={QuestionCategory.LISTENING} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">LISTENING</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={jlptLevelFilter || 'all'}
                    onValueChange={(value) =>
                        onJlptLevelFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-12 min-w-[100px] px-4 rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-[9px] font-black uppercase tracking-widest focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Target className="size-3.5 opacity-30" />
                            <SelectValue placeholder="MATRIX" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2">
                        <SelectItem value="all" className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL MATRIX</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N5} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N5</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N4} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N4</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N3} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N3</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N2} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N2</SelectItem>
                        <SelectItem value={QuestionJlptLevel.N1} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">N1</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={difficultyFilter || 'all'}
                    onValueChange={(value) =>
                        onDifficultyFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-12 min-w-[130px] px-4 rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-[9px] font-black uppercase tracking-widest focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Activity className="size-3.5 opacity-30" />
                            <SelectValue placeholder="STRESS" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2">
                        <SelectItem value="all" className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL STRESS LEVELS</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.EASY} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer text-emerald-500">LOW STRESS</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.MEDIUM} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer text-amber-500">OPTIMAL STRESS</SelectItem>
                        <SelectItem value={QuestionDifficultyLevel.HARD} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer text-rose-500">MAX STRESS</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) =>
                        onStatusFilterChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="h-12 min-w-[130px] px-4 rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-[9px] font-black uppercase tracking-widest focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                            <Zap className="size-3.5 opacity-30" />
                            <SelectValue placeholder="STATUS" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2">
                        <SelectItem value="all" className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL REGISTRY</SelectItem>
                        <SelectItem value={QuestionStatus.ACTIVE} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">ACTIVE NODE</SelectItem>
                        <SelectItem value={QuestionStatus.INACTIVE} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">STASIS NODE</SelectItem>
                        <SelectItem value={QuestionStatus.REVIEW} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">AUDIT QUEUE</SelectItem>
                        <SelectItem value={QuestionStatus.ARCHIVED} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">COLD STORAGE</SelectItem>
                    </SelectContent>
                </Select>

                {onPoolIdFilterChange && (
                    <Select
                        value={poolIdFilter || 'all'}
                        onValueChange={(value) =>
                            onPoolIdFilterChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="h-12 min-w-[160px] px-4 rounded-xl border-border/20 bg-background/50 hover:bg-background/80 transition-all text-[9px] font-black uppercase tracking-widest focus:ring-primary/20">
                            <div className="flex items-center gap-2">
                                <Layout className="size-3.5 opacity-30" />
                                <SelectValue placeholder="POOL" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2 max-h-[300px]">
                            <SelectItem value="all" className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer italic">ALL POOLS</SelectItem>
                            {poolsData?.data.map((pool) => (
                                <SelectItem key={pool.id} value={pool.id} className="rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                    {pool.name.toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}
