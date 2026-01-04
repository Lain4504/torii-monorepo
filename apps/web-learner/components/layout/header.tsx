'use client';

import Link from 'next/link';
import { useAppSelector } from '@/hooks/hooks';
import { Button } from '@workspace/ui/components/button';
import { VerificationBanner } from './verification-banner';

export function Header() {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    return (
        <div className="flex flex-col w-full">
            <VerificationBanner />
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6 md:gap-10">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="inline-block font-bold text-xl text-primary">Torii Nihongo</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-2">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium hidden sm:inline-block">
                                        Chào, {user?.displayName}
                                    </span>
                                    <Button variant="ghost" asChild>
                                        <Link href="/profile">Hồ sơ</Link>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">Đăng nhập</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/register">Đăng ký</Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
        </div>
    );
}
