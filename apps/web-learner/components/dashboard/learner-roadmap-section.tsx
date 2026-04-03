'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, ListTodo, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { useAcademyRoadmap, useUpdateRoadmapTask } from '@/lib/api/services/academy-roadmap-api';
import type { AcademyRoadmapTaskModel } from '@workspace/schemas';

function TaskRow({
    task,
    learnHref,
    onComplete,
    completing,
}: {
    task: AcademyRoadmapTaskModel;
    learnHref: string | null | undefined;
    onComplete: (id: string) => void;
    completing: boolean;
}) {
    const done = task.status === 'COMPLETED';
    const lessonId = (task.metadata as { lessonId?: string } | undefined)?.lessonId;
    const href =
        learnHref && lessonId
            ? `${learnHref}${learnHref.includes('?') ? '&' : '?'}lesson=${lessonId}`
            : learnHref || '#';

    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="mt-0.5 shrink-0">
                {done ? (
                    <CheckCircle2 className="size-5 text-primary" />
                ) : (
                    <Circle className="size-5 text-muted-foreground" />
                )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-semibold leading-snug">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                    {task.estimatedMinutes ? `~${task.estimatedMinutes} phút` : ''}
                    {task.taskType === 'LIVE_SESSION' ? ' · Buổi live' : ''}
                    {task.taskType === 'LESSON' ? ' · Bài học' : ''}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                    {learnHref && !done && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                            <Link href={href}>Vào học</Link>
                        </Button>
                    )}
                    {!done && (
                        <Button
                            size="sm"
                            className="h-8 text-xs"
                            disabled={completing}
                            onClick={() => onComplete(task.id)}
                        >
                            {completing ? <Loader2 className="size-3.5 animate-spin" /> : 'Đánh dấu xong'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export function LearnerRoadmapSection({ hasEnrollment }: { hasEnrollment: boolean }) {
    const { data: roadmap, isLoading, isError } = useAcademyRoadmap(hasEnrollment);
    const updateTask = useUpdateRoadmapTask();

    if (!hasEnrollment) return null;
    if (isLoading) {
        return (
            <Card className="border-border/60">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ListTodo className="size-5" />
                        Lộ trình hôm nay
                    </CardTitle>
                    <CardDescription>Đang tải gợi ý học tập…</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
                </CardContent>
            </Card>
        );
    }
    if (isError || !roadmap || !roadmap.weekPlan?.length) {
        return null;
    }

    const learnHref = roadmap.learnHref ?? undefined;

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ListTodo className="size-5 text-primary" />
                    Lộ trình hôm nay
                </CardTitle>
                <CardDescription>
                    Tuần {roadmap.currentWeek} · Phiên bản kế hoạch #{roadmap.version}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {roadmap.todayFocus.map((task) => (
                    <TaskRow
                        key={task.id}
                        task={task}
                        learnHref={learnHref}
                        completing={updateTask.isPending}
                        onComplete={(id) =>
                            updateTask.mutate({ taskId: id, body: { status: 'COMPLETED' } })
                        }
                    />
                ))}
                {roadmap.nextBestAction && roadmap.nextBestAction.id !== roadmap.todayFocus[0]?.id && (
                    <p className="text-xs text-muted-foreground">
                        Gợi ý tiếp theo:{' '}
                        <span className="font-medium text-foreground">{roadmap.nextBestAction.title}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
