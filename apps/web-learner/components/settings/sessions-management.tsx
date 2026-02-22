'use client'

import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from '@workspace/ui/components/empty';
import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { useSessions, useRevokeSession, useRevokeOtherSessions } from '@/apis/services/session-api';
import { toast } from '@workspace/ui/components/sonner';

// Child components
import { SessionsInfoBanner } from './sessions-info-banner';
import { SessionItem } from './session-item';
import { RevokeSessionDialog } from './revoke-session-dialog';

export function SessionsManagement() {
    const { data: sessions, isLoading } = useSessions();
    const revokeMutation = useRevokeSession();
    const revokeOtherMutation = useRevokeOtherSessions();

    // Dialog state
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isRevokeOtherOpen, setIsRevokeOtherOpen] = useState(false);

    const handleRevokeSingle = async () => {
        if (!selectedSessionId) return;
        try {
            await revokeMutation.mutateAsync(selectedSessionId);
            toast.success('Đã đăng xuất khỏi thiết bị này');
            setSelectedSessionId(null);
        } catch (error) {
            toast.error('Không thể đăng xuất phiên này');
        }
    };

    const handleRevokeOther = async () => {
        try {
            await revokeOtherMutation.mutateAsync();
            toast.success('Đã đăng xuất khỏi tất cả các thiết bị khác');
            setIsRevokeOtherOpen(false);
        } catch (error) {
            toast.error('Không thể thực hiện yêu cầu');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <Spinner className="size-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Phiên đăng nhập
            </h3>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <SessionsInfoBanner />

                {/* Sessions List */}
                <div className="divide-y divide-border">
                    {sessions?.map((session) => (
                        <SessionItem
                            key={session.id}
                            session={session}
                            onRevoke={(id) => setSelectedSessionId(id)}
                            isRevoking={revokeMutation.isPending && selectedSessionId === session.id}
                        />
                    ))}

                    {sessions?.length === 0 && (
                        <Empty className="border-none">
                            <EmptyContent>
                                <EmptyTitle>Không tìm thấy phiên</EmptyTitle>
                                <EmptyDescription>Không có dữ liệu phiên hoạt động.</EmptyDescription>
                            </EmptyContent>
                        </Empty>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-5 bg-muted/20">
                    <Button
                        variant="ghost"
                        onClick={() => setIsRevokeOtherOpen(true)}
                        disabled={revokeOtherMutation.isPending || (sessions?.length || 0) <= 1}
                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive h-10 font-bold text-xs uppercase tracking-wider transition-all duration-200"
                    >
                        {revokeOtherMutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <Spinner className="size-3" />
                                Đang xử lý...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <LogOut className="size-3.5" />
                                Đăng xuất tất cả các thiết bị khác
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Confirmation Dialogs */}
            <RevokeSessionDialog
                open={!!selectedSessionId}
                onOpenChange={(open) => !open && setSelectedSessionId(null)}
                onConfirm={handleRevokeSingle}
                isPending={revokeMutation.isPending}
                title="Xác nhận đăng xuất"
                description="Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này không? Hành động này không thể hoàn tác."
            />

            <RevokeSessionDialog
                open={isRevokeOtherOpen}
                onOpenChange={setIsRevokeOtherOpen}
                onConfirm={handleRevokeOther}
                isPending={revokeOtherMutation.isPending}
                title="Đăng xuất các thiết bị khác"
                description="Tất cả các phiên đăng nhập trên các thiết bị khác sẽ bị chấm dứt. Bạn sẽ chỉ còn giữ phiên hiện tại."
            />
        </div>
    );
}