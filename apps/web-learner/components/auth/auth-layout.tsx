import Link from 'next/link'
import { type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Separator } from '@workspace/ui/components/separator'

interface AuthLayoutProps {
    /** Nội dung panel bên trái (desktop only) */
    leftPanel: ReactNode
    /** Tiêu đề trang */
    title: string
    /** Mô tả ngắn dưới tiêu đề */
    description?: string
    /** Form hoặc content chính */
    children: ReactNode
    /** Footer text - phần "Đã có tài khoản?" */
    footerText?: ReactNode
    /** Hiển thị link quay về trang chủ */
    showHomeLink?: boolean
}

/** Logo dùng chung */
export function ToriiLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
    const iconSize = size === 'sm' ? 'size-8' : 'size-10'
    const svgSize = size === 'sm' ? 'size-5' : 'size-6'
    const textSize = size === 'sm' ? 'text-lg' : 'text-xl'

    return (
        <Link href="/" className="flex items-center gap-3 group transition-opacity hover:opacity-90">
            <div className={`${iconSize} bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20`}>
                <svg className={`${svgSize} text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 10h18" strokeLinecap="round" />
                    <path d="M5 10v8" strokeLinecap="round" />
                    <path d="M19 10v8" strokeLinecap="round" />
                    <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                </svg>
            </div>
            <span className={`${textSize} font-bold tracking-tight`}>
                Torii <span className="text-primary">Nihongo</span>
            </span>
        </Link>
    )
}

export function AuthLayout({
    leftPanel,
    title,
    description,
    children,
    footerText,
    showHomeLink = true,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background font-sans">
            {/* Left Panel */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-muted/30 border-r">
                <ToriiLogo />
                <div className="max-w-md">{leftPanel}</div>
                <div className="text-xs text-muted-foreground font-medium">
                    © {new Date().getFullYear()} Torii Nihongo
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-[400px] space-y-6">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <ToriiLogo size="sm" />
                    </div>

                    {/* Heading */}
                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Main content */}
                    {children}

                    {/* Footer */}
                    {(footerText || showHomeLink) && (
                        <div className="space-y-6 pt-4">
                            {footerText && (
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <Separator />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">
                                            {footerText}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {showHomeLink && (
                                <div className="flex justify-center">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                                    >
                                        <ChevronLeft className="size-4" />
                                        Quay về trang chủ
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
