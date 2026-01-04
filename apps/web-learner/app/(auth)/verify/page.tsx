'use client';

import { Suspense } from 'react';
import { VerificationContent } from '@/components/auth/verification-content';
import { Loader2 } from 'lucide-react';

export default function VerifyPage() {
    return (
        <div className="container relative flex min-h-screen flex-col items-center justify-center grow bg-muted/30 px-4">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                <div className="rounded-2xl border bg-card p-8 shadow-xl">
                    <div className="flex flex-col space-y-2 text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">
                            Torii Nihongo
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Xác thực tài khoản để bắt đầu hành trình của bạn
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                                <p className="mt-4 text-sm text-muted-foreground italic">Đang tải...</p>
                            </div>
                        }
                    >
                        <VerificationContent />
                    </Suspense>
                </div>

                <p className="px-8 text-center text-xs text-muted-foreground text-balance">
                    Bằng việc xác thực, bạn đồng ý với{' '}
                    <a href="/terms" className="underline underline-offset-4 hover:text-primary">Điều khoản dịch vụ</a>
                    {' '}và{' '}
                    <a href="/privacy" className="underline underline-offset-4 hover:text-primary">Chính sách bảo mật</a>
                    .
                </p>
            </div>
        </div>
    );
}
