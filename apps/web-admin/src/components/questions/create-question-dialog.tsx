import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2, Plus, X, BrainCircuit, Type, FileText, CheckCircle2, AlignLeft } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateQuestion } from '@/api/services/questions.ts';
import { useQuestionPools } from '@/api/services/question-pools.ts';
import {
    QuestionType,
    QuestionCategory,
    QuestionDifficultyLevel,
    QuestionJlptLevel,
    questionCreateDTOSchema,
    type QuestionCreateDTO,
} from '@workspace/schemas';
import type { z } from 'zod';


type CreateQuestionFormData = z.input<typeof questionCreateDTOSchema>;

interface CreateQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultPoolId?: string;
}

export function CreateQuestionDialog({ open, onOpenChange, defaultPoolId }: CreateQuestionDialogProps) {
    const createQuestion = useCreateQuestion();
    const { data: poolsData } = useQuestionPools({ page: 1, limit: 100 });
    const [options, setOptions] = useState<Record<string, string>>({ A: '', B: '' });
    const [optionKeys, setOptionKeys] = useState<string[]>(['A', 'B']);

    const {
        control,
        handleSubmit,
        reset,
        watch,
    } = useForm<CreateQuestionFormData>({
        resolver: zodResolver(questionCreateDTOSchema),
        defaultValues: {
            questionText: '',
            questionType: QuestionType.MULTIPLE_CHOICE,
            jlptLevel: QuestionJlptLevel.N5,
            category: QuestionCategory.VOCAB,
            difficulty: QuestionDifficultyLevel.MEDIUM,
            correctAnswer: '',
            explanation: '',
            tags: [],
            poolId: defaultPoolId || undefined,
        },
    });

    const questionType = watch('questionType');

    useEffect(() => {
        if (open && defaultPoolId) {
            reset({
                questionText: '',
                questionType: QuestionType.MULTIPLE_CHOICE,
                jlptLevel: QuestionJlptLevel.N5,
                category: QuestionCategory.VOCAB,
                difficulty: QuestionDifficultyLevel.MEDIUM,
                correctAnswer: '',
                explanation: '',
                tags: [],
                poolId: defaultPoolId,
            });
        }
    }, [open, defaultPoolId, reset]);

    const addOption = () => {
        const nextKey = String.fromCharCode(65 + optionKeys.length);
        setOptionKeys([...optionKeys, nextKey]);
        setOptions({ ...options, [nextKey]: '' });
    };

    const removeOption = (key: string) => {
        if (optionKeys.length <= 2) {
            toast.error('Requirement Unmet', { description: 'Minimum of 2 options required for multiple choice.' });
            return;
        }
        setOptionKeys(optionKeys.filter(k => k !== key));
        const newOptions = { ...options };
        delete newOptions[key];
        setOptions(newOptions);
    };

    const onSubmit = async (data: CreateQuestionFormData) => {
        try {
            const submitData: QuestionCreateDTO = {
                ...data,
                options: questionType === QuestionType.MULTIPLE_CHOICE ? options : undefined,
            };

            await createQuestion.mutateAsync(submitData);
            toast.success('Question Encoded', {
                description: 'New assessment item successfully added to the database.',
            });
            reset();
            setOptions({ A: '', B: '' });
            setOptionKeys(['A', 'B']);
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Encoding Failed', {
                description: error.response?.data?.message || 'System unable to save question data.',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl border-none shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[2rem] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-8 pb-6 bg-muted/5 border-b border-border/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative z-10">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-2">
                            Question <span className="text-primary not-italic">Encoder</span>
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">
                            Define new assessment parameters and evaluation metrics
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    <Controller
                        name="questionText"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Question Prompt *</FieldLabel>
                                <div className="relative">
                                    <Textarea
                                        {...field}
                                        placeholder="ENTER ASSESSMENT QUERY..."
                                        className="min-h-[120px] rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                    />
                                    <FileText className="absolute right-4 top-4 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                                </div>
                                {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <Controller
                            name="questionType"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Interaction Type *</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                            <SelectItem value={QuestionType.MULTIPLE_CHOICE} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Multiple Choice</SelectItem>
                                            <SelectItem value={QuestionType.TRUE_FALSE} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">True/False</SelectItem>
                                            <SelectItem value={QuestionType.FILL_BLANK} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Fill Blank</SelectItem>
                                            <SelectItem value={QuestionType.MATCHING} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Matching</SelectItem>
                                            <SelectItem value={QuestionType.ESSAY} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Essay</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="category"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Domain Category</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                            <SelectItem value={QuestionCategory.VOCAB} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Vocabulary</SelectItem>
                                            <SelectItem value={QuestionCategory.GRAMMAR} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Grammar</SelectItem>
                                            <SelectItem value={QuestionCategory.READING} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Reading</SelectItem>
                                            <SelectItem value={QuestionCategory.LISTENING} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Listening</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Controller
                            name="jlptLevel"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Proficiency Level</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                            <SelectItem value={QuestionJlptLevel.N5} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">N5 (Beginner)</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N4} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">N4</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N3} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">N3</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N2} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">N2</SelectItem>
                                            <SelectItem value={QuestionJlptLevel.N1} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">N1 (Advanced)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="difficulty"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Complexity Index</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                            <SelectItem value={QuestionDifficultyLevel.EASY} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Low</SelectItem>
                                            <SelectItem value={QuestionDifficultyLevel.MEDIUM} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Medium</SelectItem>
                                            <SelectItem value={QuestionDifficultyLevel.HARD} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    </div>

                    <Controller
                        name="poolId"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Source Collection (Optional)</FieldLabel>
                                <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                    <SelectTrigger className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all">
                                        <SelectValue placeholder="SELECT POOL" />
                                    </SelectTrigger>
                                    <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                        <SelectItem value="none" className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">Unassigned</SelectItem>
                                        {poolsData?.data.map((pool) => (
                                            <SelectItem key={pool.id} value={pool.id} className="rounded-xl font-bold uppercase text-xs py-3 cursor-pointer focus:bg-primary/10">
                                                {pool.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    {questionType === QuestionType.MULTIPLE_CHOICE && (
                        <div className="space-y-4 p-6 rounded-3xl bg-muted/5 border border-border/10">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                <div className="h-px flex-1 bg-border/20" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center flex items-center gap-2">
                                    <AlignLeft className="h-3 w-3" />
                                    Variable Options
                                </h4>
                                <div className="h-px flex-1 bg-border/20" />
                            </div>

                            <div className="space-y-3">
                                {optionKeys.map((key) => (
                                    <div key={key} className="flex gap-3">
                                        <div className="flex items-center justify-center w-12 h-14 rounded-2xl bg-background/50 border border-border/20 font-black text-xs text-muted-foreground">
                                            {key}
                                        </div>
                                        <Input
                                            value={options[key] || ''}
                                            onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                            placeholder={`OPTION MARKER ${key}`}
                                            className="h-14 px-5 rounded-2xl bg-background/50 border-border/20 hover:bg-background/80 focus:ring-primary/20 text-sm font-bold uppercase transition-all flex-1"
                                        />
                                        {optionKeys.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOption(key)}
                                                className="h-14 w-12 rounded-2xl hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addOption}
                                    className="w-full h-12 rounded-xl border-dashed border-border/40 hover:bg-muted/10 hover:border-border/60 text-[11px] font-black uppercase tracking-widest"
                                >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Append Option Variant
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <Controller
                            name="correctAnswer"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Key Validation Value *</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            placeholder={questionType === QuestionType.MULTIPLE_CHOICE ? "E.G., A" : "ENTER EXPECTED ANSWER"}
                                            className="h-14 px-5 rounded-2xl bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 focus-visible:ring-emerald-500/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                        />
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/30 pointer-events-none" />
                                    </div>
                                    {questionType === QuestionType.MULTIPLE_CHOICE && (
                                        <p className="text-[10px] font-bold text-muted-foreground/50 ml-2 mt-1 uppercase tracking-wide">
                                            Must match one of the option keys above
                                        </p>
                                    )}
                                    {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="explanation"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Logic / Rationale</FieldLabel>
                                    <div className="relative">
                                        <Textarea
                                            {...field}
                                            placeholder="ELUCIDATE THE CORRECT ANSWER..."
                                            className="min-h-[100px] rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                        />
                                        <BrainCircuit className="absolute right-4 top-4 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                                    </div>
                                    {fieldState.error && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                reset();
                                setOptions({ A: '', B: '' });
                                setOptionKeys(['A', 'B']);
                                onOpenChange(false);
                            }}
                            className="rounded-xl h-12 px-6 hover:bg-muted/20 text-[11px] font-black uppercase tracking-widest"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={createQuestion.isPending}
                            className="rounded-xl h-12 px-8 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                        >
                            {createQuestion.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Encoding...
                                </>
                            ) : (
                                <>
                                    <Type className="mr-2 h-4 w-4" />
                                    Create Item
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
