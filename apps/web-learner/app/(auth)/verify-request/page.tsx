'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';

export default function VerifyRequestPage() {
    return (
        <div className="container relative flex min-h-screen flex-col items-center justify-center grow bg-muted/30 px-4">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                <div className="rounded-2xl border bg-card p-8 shadow-xl text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-primary">
                        Kiểm tra email của bạn
                    </h1>

                    <p className="mb-6 text-muted-foreground">
                        Chúng tôi đã gửi một liên kết xác thực đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến (và cả thư mục Spam) để hoàn tất đăng ký.
                    </p>

                    <div className="space-y-4">
                        <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700">
                            <Link href="/login">
                                Quay lại Đăng nhập
                            </Link>
                        </Button>

                        <p className="text-xs text-muted-foreground">
                            Không nhận được email? <Link href="/resend-verification" className="text-primary hover:underline">Gửi lại</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    Được bảo vệ bởi Torii Nihongo. <Link href="/privacy" className="underline hover:text-primary">Chính sách bảo mật</Link>
                </p>
            </div>
        </div>
    );
}
