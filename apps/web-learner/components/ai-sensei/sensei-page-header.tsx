"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { QuotaIndicator } from "./quota-indicator"
import { cn } from "@workspace/ui/lib/utils"

interface SenseiPageHeaderProps {
    title: string
    description: string
    icon: LucideIcon
    children?: React.ReactNode
    className?: string
}

export function SenseiPageHeader({
    title,
    description,
    icon: Icon,
    children,
    className
}: SenseiPageHeaderProps) {
    return (
        <div className={cn("flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-8 mt-2", className)}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-2xl shrink-0">
                        <Icon className="size-6 text-primary fill-primary/20" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-muted-foreground font-medium text-sm">{description}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                {children}
            </div>
        </div>
    )
}
