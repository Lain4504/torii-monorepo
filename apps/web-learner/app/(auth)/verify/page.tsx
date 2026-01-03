'use client';

import { Suspense } from 'react';
import { VerificationContent } from './verification-content';

export default function VerifyPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Xác thực tài khoản
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Đang xử lý yêu cầu xác thực email của bạn...
                    </p>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <VerificationContent />
                </Suspense>
            </div>
        </div>
    );
}
