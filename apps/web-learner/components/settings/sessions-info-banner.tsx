'use client'

import { AlertCircle } from 'lucide-react';

export function SessionsInfoBanner() {
    return (
        <div className="p-5 bg-blue-500/5 border-b border-border">
            <div className="flex gap-3">
                <AlertCircle className="size-5 text-blue-600 shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground"> Quản lý bảo mật </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Bạn có thể đăng xuất khỏi các thiết bị khác nếu thấy nghi ngờ. Phiên này hiển thị mọi thiết bị hiện đang truy cập tài khoản của bạn.
                    </p>
                </div>
            </div>
        </div>
    );
}
