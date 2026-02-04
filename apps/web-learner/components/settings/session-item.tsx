'use client'

import { Monitor, Smartphone, MapPin } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { SessionResponse } from '@/apis/services/session-api';

interface SessionItemProps {
    session: SessionResponse;
    onRevoke: (id: string) => void;
    isRevoking: boolean;
}

export function SessionItem({ session, onRevoke, isRevoking }: SessionItemProps) {
    const isMobile = session.deviceInfo?.includes('Mobile') ||
        session.userAgent?.includes('Android') ||
        session.userAgent?.includes('iPhone');

    return (
        <div className="p-5 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors">
            <div className="flex gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 shadow-sm border border-primary/20">
                    {isMobile ? (
                        <Smartphone className="size-5" />
                    ) : (
                        <Monitor className="size-5" />
                    )}
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">
                            {session.deviceInfo || 'Thiết bị không xác định'}
                        </p>
                        {session.isCurrent && (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 border border-emerald-500/20">
                                Phiên hiện tại
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <MapPin className="size-3" />
                            {session.ipAddress}
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 font-medium italic">
                            Hoạt động: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: vi })}
                        </p>
                    </div>
                </div>
            </div>

            {!session.isCurrent && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRevoke(session.id)}
                    disabled={isRevoking}
                    className="rounded-xl text-[11px] font-bold h-8 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
                >
                    {isRevoking ? 'Đang xử lý...' : 'Đăng xuất'}
                </Button>
            )}
        </div>
    );
}
