'use client';

import { useState, useEffect } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import {
    Banner,
    BannerAction,
    BannerIcon,
    BannerTitle
} from '@workspace/ui/components/ui/shadcn-io/banner';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { authApi } from '@/api/services/auth-api';
import { toast } from '@workspace/ui/components/sonner';
import { UserStatus } from '@workspace/schemas';

export function VerificationBanner() {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Only show if authenticated but status is pending (needs verification)
    if (!isAuthenticated || !user || user.status !== UserStatus.PENDING) {
        return null;
    }

    const handleResend = async () => {
        if (!user.email) return;

        setResendLoading(true);
        try {
            await authApi.resendVerification(user.email);
            setResendCooldown(60);
            toast.success('Email xác thực đã được gửi!', {
                description: 'Vui lòng kiểm tra hộp thư và click vào link để xác thực tài khoản.',
            });
        } catch (error: any) {
            toast.error(error.message || 'Gửi lại email thất bại. Vui lòng thử lại sau.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <Banner className="bg-amber-600 text-white border-none">
            <BannerIcon icon={Mail} className="bg-amber-500/30 border-amber-400/30" />
            <BannerTitle className="font-medium">
                Tài khoản của bạn chưa được xác thực.
                Vui lòng kiểm tra email <span className="font-bold underline">{user.email}</span> và click vào link xác thực.
            </BannerTitle>
            <div className="flex items-center gap-2">
                <BannerAction
                    onClick={handleResend}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-white border-white/20 hover:bg-white/10"
                >
                    {resendLoading ? (
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    ) : null}
                    {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại email'}
                </BannerAction>
            </div>
        </Banner>
    );
}
