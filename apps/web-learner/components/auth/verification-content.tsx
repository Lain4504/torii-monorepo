'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useTimeout } from '@workspace/ui/hooks/use-timeout';
import { useAppDispatch } from '@/hooks/hooks';
import { fetchProfile } from '@/store/slices/authSlice';
import { Spinner } from '@workspace/ui/components/spinner';
import { apiClient } from '@/api/api-client';
import { cn } from '@workspace/ui/lib/utils';

export function VerificationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [redirectDelay, setRedirectDelay] = useState<number | null>(null);

    useTimeout(() => {
        router.push('/');
    }, redirectDelay);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Link xác thực không hợp lệ');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await apiClient.post('/api/auth/verify-email', { token });
                const data = response.data;

                if (data.success) {
                    setStatus('success');
                    setMessage('Email đã được xác thực thành công!');

                    await dispatch(fetchProfile());
                    setRedirectDelay(3000);
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
            <div className="flex flex-col items-center justify-center space-y-8 py-16 text-center animate-in fade-in duration-500">
                <Spinner className="h-14 w-14 text-primary" />
                <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tight italic">Đang <span className="text-primary not-italic">Xác thực...</span></h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">Establishing security tunnel</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center space-y-10 py-12 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                    <div className="relative w-24 h-24 rounded-[1.5rem] bg-white shadow-xl shadow-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck className="h-12 w-12 text-emerald-500" />
                        <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-amber-500" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-tight italic text-foreground">
                        Kích hoạt <span className="text-emerald-500 not-italic italic">Thành công!</span>
                    </h3>
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 max-w-sm">
                        <p className="text-[11px] font-bold text-muted-foreground/80 leading-relaxed italic italic">
                            Chào mừng bạn đến với cộng đồng Torii Nihongo. Tài khoản của bạn đã được xác minh toàn diện.
                        </p>
                    </div>
                    <div className="pt-6 border-t border-border/20 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Redirecting to HQ in 3s
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    return (
        <div className="flex flex-col items-center justify-center space-y-10 py-12 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="relative group">
                <div className="absolute inset-0 bg-destructive/10 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 rounded-[1.5rem] bg-white shadow-xl shadow-destructive/5 flex items-center justify-center border border-destructive/10">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tight italic text-foreground">
                    Xác thực <span className="text-destructive not-italic italic">Thất bại</span>
                </h3>
                <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 max-w-sm">
                    <p className="text-[11px] font-bold text-muted-foreground/80 leading-relaxed italic italic">
                        {message}
                    </p>
                </div>
                <div className="pt-6 border-t border-border/20">
                    <Button
                        onClick={() => router.push('/')}
                        className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 group"
                    >
                        Trở về trang chủ
                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
