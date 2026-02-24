"use client"

import * as React from "react"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { Item, ItemGroup } from "@workspace/ui/components/item"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react"

// --- Quiz Container ---
export function QuizContainer({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("w-full max-w-4xl mx-auto py-6 md:py-8 px-4 md:px-6", className)}>
            <div className="space-y-8">
                {children}
            </div>
        </div>
    )
}

// --- Quiz Header ---
export function QuizHeader({
    title,
    description,
    actions
}: {
    title: string,
    description?: string,
    actions?: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-1">
            <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground text-xs font-medium">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}

// --- Quiz Progress ---
export function QuizProgress({ current, total, label = "Progress" }: { current: number, total: number, label?: string }) {
    const progress = total > 0 ? (current / total) * 100 : 0
    return (
        <div className="space-y-2 mb-8">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <span>{label}</span>
                <span className="text-primary">{current} / {total}</span>
            </div>
            <Progress value={progress} className="h-1" />
        </div>
    )
}

// --- Quiz Question ---
export function QuizQuestion({
    question,
    level,
    category,
    index
}: {
    question: string,
    level?: string,
    category?: string,
    index?: number
}) {
    return (
        <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
                {level && <Badge variant="secondary" className="font-bold text-[9px] h-5 px-1.5">{level}</Badge>}
                {category && <Badge variant="outline" className="font-bold text-[9px] h-5 px-1.5">{category}</Badge>}
            </div>
            <h2 className="text-lg md:text-xl font-bold leading-snug tracking-tight">
                {index !== undefined && <span className="text-muted-foreground/40 mr-2">{index}.</span>}
                {question}
            </h2>
        </div>
    )
}

// --- Quiz Option ---
export function QuizOption({
    value,
    label,
    index,
    isSelected,
    isCorrect,
    isWrong,
    disabled,
    onSelect
}: {
    value: string,
    label: string,
    index: number,
    isSelected?: boolean,
    isCorrect?: boolean,
    isWrong?: boolean,
    disabled?: boolean,
    onSelect?: (value: string) => void
}) {
    const letter = String.fromCharCode(65 + index)

    return (
        <Button
            variant="outline"
            disabled={disabled}
            onClick={() => onSelect?.(value)}
            className={cn(
                "h-auto p-3 justify-start text-left font-medium transition-all rounded-lg border shadow-none",
                isSelected && "border-primary bg-primary/5 text-primary ring-0",
                isCorrect && "border-emerald-500/50 bg-emerald-50 text-emerald-700",
                isWrong && "border-destructive/50 bg-destructive/5 text-destructive",
                disabled && !isCorrect && !isWrong && "opacity-60"
            )}
        >
            <div className={cn(
                "mr-3 flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold shrink-0",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                isCorrect && "bg-emerald-500 text-white",
                isWrong && "bg-destructive text-white"
            )}>
                {letter}
            </div>
            <span className="flex-1 text-sm">{label}</span>
        </Button>
    )
}

// --- Quiz Navigation ---
export function QuizNavigation({
    onBack,
    onNext,
    backDisabled,
    nextDisabled,
    nextLabel = "Next Question",
    isLast
}: {
    onBack?: () => void,
    onNext?: () => void,
    backDisabled?: boolean,
    nextDisabled?: boolean,
    nextLabel?: string,
    isLast?: boolean
}) {
    return (
        <div className="flex items-center justify-between mt-12 pt-8 border-t">
            <Button
                variant="ghost"
                onClick={onBack}
                disabled={backDisabled}
                className="font-bold uppercase tracking-widest text-[10px]"
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Quay lại
            </Button>
            <Button
                onClick={onNext}
                disabled={nextDisabled}
                className="px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            >
                {isLast ? "Hoàn thành" : nextLabel}
                {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
        </div>
    )
}

// --- Quiz Result Summary ---
export function QuizResultSummary({
    percentage,
    stats,
    onRetry,
    onAction,
    title = "Analysis Report",
    badge = "Performance"
}: {
    percentage: number,
    stats: { label: string, value: number | string, icon: any }[],
    onRetry?: () => void,
    onAction?: { label: string, onClick: () => void },
    title?: string,
    badge?: string
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{badge}</div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {onRetry && (
                        <Button variant="outline" size="sm" onClick={onRetry} className="h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            <RotateCcw className="mr-2 h-3 w-3" /> Thử lại
                        </Button>
                    )}
                    {onAction && (
                        <Button size="sm" onClick={onAction.onClick} className="h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            {onAction.label}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border rounded-xl overflow-hidden bg-muted/20">
                <div className="p-6 flex flex-col items-center justify-center bg-primary/5 border-b md:border-b-0 md:border-r">
                    <div className="text-4xl font-black text-primary">{Math.round(percentage)}%</div>
                    <div className="text-[9px] font-bold uppercase tracking-tighter opacity-60">Accuracy</div>
                </div>
                {stats.map((stat, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-background rounded-lg border shadow-sm shrink-0">
                            <stat.icon className="h-4 w-4 text-primary/70" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">{stat.value}</div>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Quiz Review Item ---
export function QuizReviewItem({
    index,
    question,
    userAnswer,
    correctAnswer,
    isCorrect,
    explanation
}: {
    index: number,
    question: string,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    explanation?: string
}) {
    return (
        <Item variant="default" className="p-3 border-none bg-transparent hover:bg-muted/50 items-start gap-4">
            <div className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold",
                isCorrect ? "bg-emerald-500 text-white" : "bg-destructive text-white"
            )}>
                {index}
            </div>
            <div className="flex-1 space-y-1.5">
                <p className="font-semibold text-sm leading-snug">{question}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Đáp án:</span>
                        <span className={cn(isCorrect ? "text-emerald-600" : "text-destructive", "font-bold")}>
                            {userAnswer || "(Trống)"}
                        </span>
                    </div>
                    {!isCorrect && (
                        <div className="flex items-center gap-1.5 border-l pl-4">
                            <span className="text-muted-foreground">Đúng:</span>
                            <span className="font-bold text-emerald-600">{correctAnswer}</span>
                        </div>
                    )}
                </div>
                {explanation && (
                    <p className="text-[11px] text-muted-foreground/70 border-l-2 pl-3 py-0.5 font-medium">
                        {explanation}
                    </p>
                )}
            </div>
        </Item>
    )
}

// --- Quiz Result View ---
export function QuizResultView({
    percentage,
    stats,
    questions,
    onRetry,
    onSecondaryAction,
    title,
    badge
}: {
    percentage: number,
    stats: { label: string, value: number | string, icon: any }[],
    questions: {
        id: string,
        text: string,
        userSelection?: string,
        correctAnswer: string,
        isCorrect: boolean,
        explanation?: string
    }[],
    onRetry?: () => void,
    onSecondaryAction?: { label: string, onClick: () => void },
    title?: string,
    badge?: string
}) {
    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <QuizResultSummary
                percentage={percentage}
                stats={stats}
                onRetry={onRetry}
                onAction={onSecondaryAction}
                title={title}
                badge={badge}
            />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight">Chi tiết bài làm</h2>
                    <Separator className="flex-1" />
                </div>

                <ItemGroup className="gap-3">
                    {questions.map((q, i) => (
                        <QuizReviewItem
                            key={q.id || i}
                            index={i + 1}
                            question={q.text}
                            userAnswer={q.userSelection || ""}
                            correctAnswer={q.correctAnswer}
                            isCorrect={q.isCorrect}
                            explanation={q.explanation}
                        />
                    ))}
                </ItemGroup>
            </div>
        </div>
    )
}
