"use client"

import Link from "next/link"
import { PlayCircle } from "lucide-react"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { useState } from "react"
import { CourseExpirationModal } from "@/components/courses/course-expiration-modal"
import { useMyCourses } from "../../apis/services/learning-progress-api"
import { SidebarGroup, SidebarGroupLabel, useSidebar } from "@workspace/ui/components/sidebar"

export function NavLearning() {
    const { data: courses, isLoading } = useMyCourses()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const [showExpiredModal, setShowExpiredModal] = useState(false)

    const activeCourse = courses?.[0]
    const isExpired = activeCourse?.expiresAt && new Date(activeCourse.expiresAt) < new Date()

    if (isLoading || !activeCourse || isCollapsed) return null

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-3 px-4">
                Đang học
            </SidebarGroupLabel>
            <div className="px-4">
                <div
                    onClick={() => {
                        if (isExpired) {
                            setShowExpiredModal(true)
                        } else {
                            window.location.href = `/courses/${activeCourse.slug}/learn`
                        }
                    }}
                    className={cn(
                        "group block p-4 rounded-3xl bg-primary/[0.03] hover:bg-primary/[0.08] border border-primary/10 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer",
                        isExpired && "border-destructive/20 bg-destructive/5"
                    )}
                >
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="text-xs font-sans font-bold text-foreground leading-snug group-hover:text-primary transition-colors italic line-clamp-2">
                            {activeCourse.title}
                        </h4>
                        <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm",
                            isExpired ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white"
                        )}>
                            <PlayCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <span>{isExpired ? 'Hết hạn' : 'Tiến độ'}</span>
                            <span>{activeCourse.progress}%</span>
                        </div>
                        <Progress value={activeCourse.progress} className={cn("h-1", isExpired ? "bg-muted [&>div]:bg-muted-foreground" : "bg-primary/5")} />
                    </div>
                </div>
            </div>
            <CourseExpirationModal
                isOpen={showExpiredModal}
                onClose={() => setShowExpiredModal(false)}
                courseTitle={activeCourse.title}
                courseSlug={activeCourse.slug}
            />
        </SidebarGroup>
    )
}
