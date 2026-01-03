'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { authApi } from '@/api/services/auth-api';
import { useAppDispatch } from '@/hooks/hooks';
import { verifyEmail } from '@/store/slices/authSlice';

export function VerificationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Use a ref to prevent double-firing in Strict Mode
    const processedRef = useRef(false);

    const email = searchParams.get('email');
    const otp = searchParams.get('otp');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Đang xác thực...');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        if (processedRef.current) return;

        if (!email || !otp) {
            setStatus('error');
            setMessage('Thông tin xác thực không hợp lệ. Vui lòng kiểm tra lại đường dẫn.');
            return;
        }

        processedRef.current = true;

        const handleVerification = async () => {
            // In App Router, dispatch needs to be typed correctly or used with a typed hook
            // Assuming verifyEmail returns a standard Toolkit action result
            const resultAction = await dispatch(verifyEmail({ email, otp }));

            if (verifyEmail.fulfilled.match(resultAction)) {
                setStatus('success');
                setMessage('Xác thực email thành công! Bạn có thể bắt đầu học ngay bây giờ.');
            } else {
                setStatus('error');
                // resultAction.payload is typed as string | undefined in rejectWithValue scenarios usually
                const errorMessage = typeof resultAction.payload === 'string'
                    ? resultAction.payload
                    : 'Mã xác thực không hợp lệ hoặc đã hết hạn.';
                setMessage(errorMessage);
            }
        };

        handleVerification();
    }, [email, otp, dispatch]);

    const handleResend = async () => {
        if (!email) return;

        setResendLoading(true);
        try {
            await authApi.resendVerification(email);
            setResendCooldown(60);
            // Optionally show a toast here
        } catch (error: any) {
            console.error(error);
            // Optionally show error toast
        } finally {
            setResendLoading(false);
        }
    };

    if (status === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground">{message}</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-medium">Xác thực thành công</h3>
                    <p className="text-muted-foreground">{message}</p>
                </div>
                <Button asChild className="w-full">
                    <Link href="/login">Đăng nhập</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-medium">Xác thực thất bại</h3>
                <p className="text-muted-foreground text-red-600 dark:text-red-400">{message}</p>
            </div>

            <div className="flex w-full flex-col space-y-2">
                <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={resendLoading || resendCooldown > 0}
                    className="w-full"
                >
                    {resendLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang gửi lại...
                        </>
                    ) : resendCooldown > 0 ? (
                        `Gửi lại sau ${resendCooldown}s`
                    ) : (
                        'Gửi lại mã xác thực'
                    )}
                </Button>
                <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">Quay lại đăng nhập</Link>
                </Button>
            </div>
        </div>
    );
}
