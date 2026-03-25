'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { useCreateRecoveryPlan, useNextActions, useProgressOverview } from '@/lib/api/services/learning-path-api';

function isRecovering(status?: string) {
  return String(status ?? '').toLowerCase() === 'recovering';
}

function isAtRisk(status?: string) {
  return String(status ?? '').toLowerCase() === 'at-risk';
}

export function RecoveryModePanel() {
  const { data: progress, isLoading } = useProgressOverview();
  const status = progress?.status as string | undefined;
  const recovering = isRecovering(status);
  const atRisk = isAtRisk(status);

  const nextActionsQuery = useNextActions(recovering);
  const createMutation = useCreateRecoveryPlan();

  if (isLoading) {
    return null;
  }

  return (
    <section className="bg-card p-5 rounded-3xl border border-border shadow-sm" data-purpose="recovery-mode">
      {recovering ? (
        <Alert>
          <AlertTitle>Recovery Mode</AlertTitle>
          <AlertDescription>
            Hoàn thành các hành động ngắn để quay lại on-track.
          </AlertDescription>
        </Alert>
      ) : atRisk ? (
        <Alert>
          <AlertTitle>Nguy cơ chệch nhịp</AlertTitle>
          <AlertDescription>
            Bạn đang ở trạng thái at-risk. Bật Recovery Mode để hệ thống tạo kế hoạch 3 ngày.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertTitle>Tình trạng ổn định</AlertTitle>
          <AlertDescription>
            Bạn hiện không cần recovery. Tiếp tục làm Today Focus.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-4 text-xs text-muted-foreground space-y-2">
        {recovering ? (
          <>
            <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Daily actions</p>
            {nextActionsQuery.isLoading ? (
              <p>Đang tải hành động...</p>
            ) : (nextActionsQuery.data?.actions ?? []).length === 0 ? (
              <p>Không có hành động pending cho hôm nay.</p>
            ) : (
              <div className="space-y-2">
                {(nextActionsQuery.data?.actions ?? []).map((a: any) => (
                  <div
                    key={a.action_id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{a.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {a.priority ? String(a.priority).toUpperCase() : 'MUST'} • {a.estimated_minutes ?? 0} phút
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : atRisk ? (
          <Button
            className="w-full font-bold"
            onClick={() => createMutation.mutate({ recovery_window_days: 3, inactive_days: 3 })}
            disabled={createMutation.isPending}
          >
            Bật Recovery Mode (3 ngày)
          </Button>
        ) : null}
      </div>
    </section>
  );
}

