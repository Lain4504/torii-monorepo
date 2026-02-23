'use client'

import { Monitor, Smartphone, MapPin } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@workspace/ui/components/badge';
import type { SessionResponse } from '@/lib/api/services/session-api';

interface SessionItemProps {
    session: SessionResponse;
    onRevoke: (id: string) => void;
    isRevoking: boolean;
}

import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@workspace/ui/components/item'

export function SessionItem({ session, onRevoke, isRevoking }: SessionItemProps) {
    const isMobile = session.deviceInfo?.includes('Mobile') ||
        session.userAgent?.includes('Android') ||
        session.userAgent?.includes('iPhone');

    return (
        <Item>
            <ItemMedia>
                {isMobile ? (
                    <Smartphone className="size-5" />
                ) : (
                    <Monitor className="size-5" />
                )}
            </ItemMedia>
            <ItemContent>
                <div className="flex items-center gap-2">
                    <ItemTitle>
                        {session.deviceInfo || 'Thiết bị không xác định'}
                    </ItemTitle>
                    {session.isCurrent && (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase tracking-wide">
                            Phiên hiện tại
                        </Badge>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <ItemDescription className="flex items-center gap-1.5">
                        <MapPin className="size-3" />
                        {session.ipAddress}
                    </ItemDescription>
                    <p className="text-[11px] text-muted-foreground/60 font-medium italic">
                        Hoạt động: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                </div>
            </ItemContent>
            {!session.isCurrent && (
                <ItemActions>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRevoke(session.id)}
                        disabled={isRevoking}
                    >
                        {isRevoking ? 'Đang xử lý...' : 'Đăng xuất'}
                    </Button>
                </ItemActions>
            )}
        </Item>
    );
}
