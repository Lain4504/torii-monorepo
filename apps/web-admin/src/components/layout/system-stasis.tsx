import type { LucideIcon } from 'lucide-react';
import { Sparkles, Zap } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface SystemStasisProps {
    title: string;
    description: string;
    icon: LucideIcon;
    statusText?: string;
    className?: string;
}

export function SystemStasis({
    title,
    description,
    icon: Icon,
    statusText = "System Status",
    className
}: SystemStasisProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-700", className)}>
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
                <div className="w-24 h-24 rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-primary/20 flex items-center justify-center relative z-10 shadow-xl group-hover:scale-105 transition-transform duration-700">
                    <Icon className="size-10 text-primary transition-transform duration-700" />
                    <div className="absolute -top-1.5 -right-1.5 p-1.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                        <Zap className="size-3 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="text-center space-y-4 relative px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                    <Sparkles className="size-3" />
                    {statusText}
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
                        {title.split(' ').map((word, i) => (
                            <span key={i} className={cn(i % 2 === 1 ? "text-primary" : "")}>{word} </span>
                        ))}
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground/60 max-w-lg mx-auto leading-relaxed pt-2">
                        {description}
                    </p>
                </div>

                <div className="hidden sm:flex items-center justify-center gap-8 pt-8 opacity-30">
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="size-1 rounded-full bg-foreground" />
                        <span className="text-[9px] font-medium tracking-wide uppercase">Torii System</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="size-1 rounded-full bg-foreground" />
                        <span className="text-[9px] font-medium tracking-wide uppercase">Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
