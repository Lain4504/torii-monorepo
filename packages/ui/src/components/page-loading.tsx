import { cn } from "@workspace/ui/lib/utils"

interface PageLoadingProps {
    text?: string
    className?: string
}

export function PageLoading({ text = "Initializing System...", className }: PageLoadingProps) {
    return (
        <div className={cn("flex items-center justify-center min-h-[60vh] h-full w-full bg-background", className)}>
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
                <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">
                    {text}
                </div>
            </div>
        </div>
    )
}
