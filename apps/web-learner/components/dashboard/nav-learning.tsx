"use client"

import Link from "next/link"
import { PlayCircle } from "lucide-react"
import { Progress } from "@workspace/ui/components/progress"
import { useMyCourses } from "../../apis/services/learning-progress-api"
import { SidebarGroup, SidebarGroupLabel, useSidebar } from "@workspace/ui/components/sidebar"

export function NavLearning() {
    const { data: courses, isLoading } = useMyCourses()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    const activeCourse = courses?.[0]

    if (isLoading || !activeCourse || isCollapsed) return null

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-3 px-4">
                Đang học
            </SidebarGroupLabel>
            <div className="px-4">
                <Link
                    href={`/courses/${activeCourse.slug}/learn`}
                    className="group block p-4 rounded-3xl bg-primary/[0.03] hover:bg-primary/[0.08] border border-primary/10 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="text-xs font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors italic line-clamp-2">
                            {activeCourse.title}
                        </h4>
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <PlayCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <span>Tiến độ</span>
                            <span>{activeCourse.progress}%</span>
                        </div>
                        <Progress value={activeCourse.progress} className="h-1 bg-primary/5" />
                    </div>
                </Link>
            </div>
        </SidebarGroup>
    )
}
