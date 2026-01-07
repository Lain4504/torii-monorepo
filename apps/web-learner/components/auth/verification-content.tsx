'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch } from '@/hooks/hooks';
import { fetchProfile } from '@/store/slices/authSlice';

import { apiClient } from '@/api/api-client';

export function VerificationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Link xác thực không hợp lệ');
            return;
        }

        // Verify magic link token
        const verifyToken = async () => {
            try {
                const response = await apiClient.post('/api/auth/verify-email', { token });
                const data = response.data;

                if (data.success) {
                    setStatus('success');
                    setMessage('Email đã được xác thực thành công!');

                    // Refresh user profile to update status
                    await dispatch(fetchProfile());

                    // Redirect to home after 2 seconds
                    setTimeout(() => {
                        router.push('/');
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Link xác thực không hợp lệ hoặc đã hết hạn');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.');
            }
        };

        verifyToken();
    }, [searchParams, dispatch, router]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h3 className="text-xl font-medium">Đang xác thực...</h3>
                <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
                <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                    <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                        Xác thực thành công!
                    </h3>
                    <p className="text-muted-foreground">{message}</p>
                    <p className="text-sm text-muted-foreground">
                        Đang chuyển hướng về trang chủ...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-red-800 dark:text-red-200">
                    Xác thực thất bại
                </h3>
                <p className="text-muted-foreground">{message}</p>
            </div>
            <Button
                onClick={() => router.push('/')}
                className="w-full"
            >
                Về trang chủ
            </Button>
        </div>
    );
}
