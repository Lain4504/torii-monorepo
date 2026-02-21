import type { ReactNode } from 'react';
import { cn } from "@workspace/ui/lib/utils";

interface PageHeaderProps {
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    stats?: Array<{
        label: string;
        value: string | number;
    }>;
    className?: string;
}

export function PageHeader({ title, subtitle, actions, stats, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 px-1", className)}>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4">
                {stats && stats.length > 0 && (
                    <div className="hidden lg:flex items-center gap-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex flex-col items-end px-4",
                                    index < stats.length - 1 && "border-r border-border/40"
                                )}
                            >
                                <span className="text-xs text-muted-foreground">
                                    {stat.label}
                                </span>
                                <span className="text-xl font-semibold text-foreground tabular-nums">
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                {actions}
            </div>
        </div>
    );
}
