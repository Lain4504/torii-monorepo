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
            japanese: "空",
            subtitle: "Path Not Found",
            suggestion: "Return to the path of knowledge and seek another way."
        },
        "403": {
            japanese: "門",
            subtitle: "Access Denied",
            suggestion: "The gate is closed. Verification of your character is required."
        },
        "500": {
            japanese: "壊",
            subtitle: "Server Anomaly",
            suggestion: "A ripple in the neural flow. We are restoring balance."
        },
        "default": {
            japanese: "無",
            subtitle: "Unseen Error",
            suggestion: "An unexpected event has occurred. Centering the system..."
        }
    }

    const activeVariant = variants[variant] || variants.default

    return (
        <div
            className={cn(
                "relative min-h-[85vh] w-full flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-primary/20 bg-background",
                className
            )}
            {...props}
        >
            {/* Minimal Zen Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[15%] left-[10%] w-[35%] h-[35%] bg-primary/[0.03] rounded-full blur-[100px] animate-pulse duration-[8s]" />
                <div className="absolute bottom-[15%] right-[10%] w-[30%] h-[30%] bg-accent/[0.04] rounded-full blur-[80px] animate-pulse duration-[12s]" />

                {/* Large Background Japanese Character */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18rem] md:text-[22rem] font-serif font-black text-foreground/[0.015] select-none pointer-events-none">
                    {activeVariant.japanese}
                </div>
            </div>

            <div className="relative z-10 max-w-2xl space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Error Code & Indicator */}
                <div className="relative group">
                    <div className="absolute -inset-6 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <span className="text-[9rem] md:text-[12rem] font-serif font-black text-primary/[0.03] leading-none select-none tracking-tighter italic">
                        {code}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-20 rounded-full bg-background/40 backdrop-blur-md border border-border/20 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                            <Sparkles className="size-8 text-primary animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Narrative Section */}
                <div className="space-y-6">
                    <div className="inline-flex flex-col items-center">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60 mb-3 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                            {activeVariant.subtitle}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold italic text-foreground tracking-tight leading-none mb-4">
                            {title}
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground/60 font-medium max-w-md mx-auto leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>

                {/* AI Zen Insight */}
                <div className="relative max-w-sm mx-auto px-6 py-5 rounded-[1.5rem] border border-border/30 bg-background/40 backdrop-blur-xl group hover:border-primary/20 transition-colors duration-500">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-background border border-border/30 rounded-full">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/80">Insight</span>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-foreground/80 tracking-tight italic leading-relaxed">
                        "{activeVariant.suggestion}"
                    </p>
                </div>

                {/* Action Buttons - Compact (h-12) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    {showBack && (
                        <Button
                            variant="outline"
                            className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border-border/50 hover:bg-muted transition-all active:scale-95 group"
                            onClick={onBack}
                        >
                            <ArrowLeft className="mr-2.5 size-3.5 group-hover:-translate-x-1 transition-transform" />
                            Go Back
                        </Button>
                    )}

                    {onAction ? (
                        <Button
                            className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl bg-primary text-white shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95"
                            onClick={onAction}
                        >
                            <RefreshCcw className="mr-2.5 size-3.5" />
                            {actionLabel}
                        </Button>
                    ) : (
                        showHome && (
                            <Button
                                className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl bg-primary text-white shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95"
                                onClick={onHome}
                            >
                                <Home className="mr-2.5 size-3.5" />
                                Return Home
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Footer Tag */}
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/15">
                    Torii Architecture • Node {code}
                </span>
            </div>
        </div>
    )
}
