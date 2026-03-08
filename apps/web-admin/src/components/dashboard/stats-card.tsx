import { Card, CardHeader, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export interface StatsCardProps {
    title: string;
    value: string | number;
    sub: string;
    icon: React.ElementType;
    trend?: string;
    highlight?: boolean;
}

export function StatsCard({ title, value, sub, icon: Icon, trend, highlight }: StatsCardProps) {
    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300",
            highlight && "ring-1 ring-primary/20"
        )}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">{title}</p>
                </div>
                <div className={cn("p-2.5 rounded-lg bg-muted/50 text-muted-foreground/50 group-hover:bg-primary/5 group-hover:text-primary transition-colors duration-300")}>
                    <Icon className="size-4.5" />
                </div>
            </CardHeader>

            <CardContent className="pb-6">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
                    {trend && (
                        <Badge variant="secondary" className="text-[10px]">
                            <ArrowUpRight className="size-3" />
                            {trend}
                        </Badge>
                    )}
                </div>
                <p className="text-xs font-medium text-muted-foreground/60 mt-1">
                    {sub}
                </p>
            </CardContent>
        </Card>
    )
}
