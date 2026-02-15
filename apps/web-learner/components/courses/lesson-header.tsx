'use client';

import {
    ArrowLeft,
    CheckCircle2,
    Layout,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

interface LessonHeaderProps {
    courseTitle: string;
    lessonTitle: string;
    progress: number;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    isCompleted?: boolean;
}

export function LessonHeader({ courseTitle, lessonTitle, progress, sidebarOpen, onToggleSidebar, isCompleted }: LessonHeaderProps) {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <Link href={`/dashboard/my-courses`}>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50 cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
                            {courseTitle}
                        </p>
                        <h1 className="text-xl font-sans font-bold text-foreground truncate max-w-[200px] sm:max-w-md mt-0.5 uppercase italic tracking-tight">
                            {lessonTitle}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isCompleted && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10 animate-in fade-in zoom-in-95 duration-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Đã học xong</span>
                        </div>
                    )}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{progress}% hoàn thành</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleSidebar}
                        className={cn("rounded-xl hover:bg-muted/50 cursor-pointer transition-all", sidebarOpen && "bg-primary/5 text-primary")}
                    >
                        <Layout className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
