import * as React from "react"
import { ArrowLeft, Home, RefreshCcw, Sparkles } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
    code?: string | number
    title?: string
    description?: string
    actionLabel?: string
    onAction?: () => void
    onBack?: () => void
    onHome?: () => void
    showHome?: boolean
    showBack?: boolean
    variant?: "404" | "403" | "500" | "default"
}

export function ErrorState({
    code = "404",
    title = "Page Not Found",
    description = "The path you seek has drifted into the void. It is part of the transient nature of all things.",
    actionLabel,
    onAction,
    onBack,
    onHome,
    showHome = true,
    showBack = true,
    variant = "404",
    className,
    ...props
}: ErrorStateProps) {

    const variants = {
        "404": {
            quote: "Wabi-sabi: Finding beauty in the lost and the incomplete.",
            suggestion: "Our Neural Core suggests returning to the path of knowledge."
        },
        "403": {
            quote: "The gate is closed to those who do not carry the sacred key.",
            suggestion: "Authentication protocol mismatch. Verify your credentials."
        },
        "500": {
            quote: "Even the strongest stone may crack under the pressure of the mountain.",
            suggestion: "System anomaly detected. Synchronization is being restored."
        },
        "default": {
            quote: "An unexpected ripple in the digital stream.",
            suggestion: "Return to center and try again."
        }
    }

    const activeVariant = variants[variant] || variants.default

    return (
        <div
            className={cn(
                "relative min-h-[80vh] w-full flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-primary/20",
                className
            )}
            {...props}
        >
            {/* Zen Ambient Background - Cleaner & Softer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-pulse duration-[10s]" />
                <div className="absolute bottom-[20%] right-[20%] w-[25%] h-[25%] bg-accent/10 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Error Code */}
                <div className="relative inline-block">
                    <span className="text-[10rem] md:text-[14rem] font-serif font-bold text-foreground/5 leading-none select-none tracking-tighter italic">
                        {code}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center group">
                        <div className="p-4 rounded-full bg-background/60 backdrop-blur-3xl border border-border/20 shadow-xl group-hover:scale-110 transition-transform duration-700">
                            <div className="size-16 flex items-center justify-center text-primary animate-pulse">
                                <Sparkles className="size-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Narrative */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-background border border-border/20 shadow-sm text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                        {variant === "404" ? "Path Not Found" : "System Notification"}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold italic text-foreground tracking-tight leading-tight">
                        {title}
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground/80 font-medium max-w-lg mx-auto leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* AI Insight */}
                <div className="p-8 rounded-3xl border border-border/40 bg-background/40 backdrop-blur-sm space-y-4 max-w-md mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <div className="relative">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/60 mb-2">
                            Zen Insight
                        </p>
                        <p className="text-sm font-medium text-foreground italic">
                            "{activeVariant.suggestion}"
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    {showBack && (
                        <Button
                            variant="ghost"
                            size="lg"
                            className="px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted/40 transition-all group"
                            onClick={onBack}
                        >
                            <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
                            Go Back
                        </Button>
                    )}

                    {onAction ? (
                        <Button
                            size="lg"
                            className="px-8 h-12 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            onClick={onAction}
                        >
                            <RefreshCcw className="mr-2 size-4" />
                            {actionLabel}
                        </Button>
                    ) : (
                        showHome && (
                            <Button
                                size="lg"
                                className="px-10 h-12 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                                onClick={onHome}
                            >
                                <Home className="mr-2 size-4" />
                                Return Home
                            </Button>
                        )
                    )}
                </div>
            </div>

            <div className="mt-16 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/10">
                Torii Platform • {code}
            </div>
        </div>
    )
}
