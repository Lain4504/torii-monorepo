'use client';

import React from 'react';
import { useRoadmapCurrent, useCompleteRoadmapTask } from '@/lib/api/services/learning-path-api';
import { Button } from '@workspace/ui/components/button';
import { CheckCircle2, Clock3, Target } from 'lucide-react';

function sortPriority(tasks: Array<any>) {
  const rank = (p: string) => {
    const s = String(p ?? '').toLowerCase();
    if (s === 'must') return 0;
    if (s === 'should') return 1;
    return 2; // could / unknown
  };
  return tasks.slice().sort((a, b) => rank(a.priority) - rank(b.priority));
}

export function TodayFocus() {
  const { data, isLoading } = useRoadmapCurrent();
  const completeMutation = useCompleteRoadmapTask();

  const roadmapId = data?.roadmapId ?? null;
  const currentWeek = data?.weeklyPlan?.[0] ?? null;
  const tasks = currentWeek ? sortPriority(currentWeek.tasks ?? []).slice(0, 3) : [];

  return (
    <section className="bg-card p-5 rounded-3xl border border-border shadow-sm" data-purpose="today-focus">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold">Today Focus</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Roadmap v2
        </span>
      </div>

      {isLoading ? (
        <div className="text-xs text-muted-foreground">Đang tải lộ trình...</div>
      ) : !roadmapId || !currentWeek || tasks.length === 0 ? (
        <div className="text-xs text-muted-foreground space-y-2">
          <p>Chưa có dữ liệu lộ trình v2 cho hôm nay.</p>
          <p>(Skeleton) Widget sẽ lấy tasks theo tuần từ backend planning layer.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Target className="size-3" />
            <span>Tuần {currentWeek.week_index}</span>
            <span>•</span>
            <span>{currentWeek.objective}</span>
          </div>

          <div className="space-y-3">
            {tasks.map((t) => {
              const isDone = String(t.status ?? '').toUpperCase() === 'COMPLETED';
              return (
                <div
                  key={t.task_id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      {isDone ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <Clock3 className="size-4 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{t.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {t.priority ? String(t.priority).toUpperCase() : 'MUST'} • {t.estimated_minutes} phút
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isDone ? 'secondary' : 'primary'}
                    disabled={isDone || completeMutation.isPending}
                    onClick={() =>
                      completeMutation.mutate({
                        roadmapId,
                        taskId: t.task_id,
                        actualMinutes: t.estimated_minutes,
                      })
                    }
                    className="font-bold"
                  >
                    {isDone ? 'Done' : 'Hoàn thành'}
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

