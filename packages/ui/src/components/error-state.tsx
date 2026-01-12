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
            {/* Zen Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[140px] animate-pulse duration-[10s]" />
                <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[120px] animate-pulse duration-[8s]" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Error Code */}
                <div className="relative inline-block">
                    <span className="text-[12rem] md:text-[18rem] font-serif font-bold text-foreground/5 leading-none select-none tracking-tighter italic">
                        {code}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center group">
                        <div className="p-4 rounded-full bg-background/40 backdrop-blur-3xl border border-border/10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                            <div className="size-16 flex items-center justify-center text-primary animate-pulse">
                                <Sparkles className="size-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Narrative */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                        System Protocol Error
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold italic text-foreground tracking-tight leading-tight">
                        {title}
                    </h1>
                    <p className="text-sm md:text-md text-muted-foreground/60 italic font-medium max-w-lg mx-auto leading-relaxed">
                        "{description}"
                    </p>
                </div>

                {/* AI Insight */}
                <div className="p-8 rounded-[2.5rem] border border-border/10 bg-background/40 backdrop-blur-3xl space-y-4 max-w-md mx-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 italic">
                        Cognitive Insight
                    </p>
                    <p className="text-xs font-medium text-foreground italic">
                        {activeVariant.suggestion}
                    </p>
                    <div className="pt-4 border-t border-border/5">
                        <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.15em]">
                            {activeVariant.quote}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    {showBack && (
                        <Button
                            variant="ghost"
                            size="lg"
                            className="px-8 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-border/10 hover:bg-primary/5 hover:text-primary transition-all group"
                            onClick={onBack}
                        >
                            <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
                            Retrace Steps
                        </Button>
                    )}

                    {onAction ? (
                        <Button
                            size="lg"
                            className="px-8 h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                            onClick={onAction}
                        >
                            <RefreshCcw className="mr-2 size-4" />
                            {actionLabel || "Retry Connection"}
                        </Button>
                    ) : (
                        showHome && (
                            <Button
                                size="lg"
                                className="px-10 h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all group"
                                onClick={onHome}
                            >
                                <Home className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                                Return to Center
                            </Button>
                        )
                    )}
                </div>
            </div>

            <div className="mt-24 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic">
                Torii Neural Intelligence Platform • Error Log: {code}
            </div>
        </div>
    )
}
