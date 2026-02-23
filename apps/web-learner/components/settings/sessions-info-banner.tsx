'use client'

import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { ShieldCheck } from 'lucide-react';

export function SessionsInfoBanner() {
    return (
        <div className="p-5 border-b">
            <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Quản lý bảo mật</AlertTitle>
                <AlertDescription>
                    Bạn có thể đăng xuất khỏi các thiết bị khác nếu thấy nghi ngờ. Phiên này hiển thị mọi thiết bị hiện đang truy cập tài khoản của bạn.
                </AlertDescription>
            </Alert>
        </div>
    );
}
