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
    statusText = "Node In Stasis",
    className
}: SystemStasisProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[60vh] gap-10 animate-in fade-in duration-700", className)}>
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
                <div className="w-32 h-32 rounded-[3.5rem] bg-background/40 backdrop-blur-3xl border border-primary/20 flex items-center justify-center relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                    <Icon className="size-12 text-primary group-hover:rotate-12 transition-transform duration-700" />
                    <div className="absolute -top-2 -right-2 p-2 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                        <Zap className="size-4 animate-pulse" />
                    </div>
                </div>
                {/* Orbital Rings */}
                <div className="absolute inset-x-[-40px] inset-y-[-40px] border border-primary/5 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-x-[-80px] inset-y-[-80px] border border-primary/5 rounded-full animate-[spin_15s_linear_infinite] opacity-50" />
            </div>

            <div className="text-center space-y-6 relative">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    <Sparkles className="size-3" />
                    {statusText}
                </div>

                <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter uppercase italic text-foreground/80 leading-none">
                        {title.split(' ').map((word, i) => (
                            <span key={i} className={i % 2 === 1 ? "text-primary not-italic" : ""}>{word} </span>
                        ))}
                    </h2>
                    <p className="text-[12px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic max-w-lg mx-auto leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-10 pt-10 opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-1 rounded-full bg-foreground" />
                        <span className="text-[8px] font-black tracking-widest uppercase">Protocol V2.0</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-1 rounded-full bg-foreground" />
                        <span className="text-[8px] font-black tracking-widest uppercase">Lain Identity</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-1 rounded-full bg-foreground" />
                        <span className="text-[8px] font-black tracking-widest uppercase">Encryption On</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
