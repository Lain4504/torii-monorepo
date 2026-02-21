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
    const iconSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
    const svgSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
    const textSize = size === 'sm' ? 'text-lg' : 'text-xl'

    return (
        <Link href="/" className="flex items-center gap-3">
            <div className={`${iconSize} bg-primary flex items-center justify-center rounded-xl`}>
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
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            {/* Left Panel */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-muted/30 border-r border-border">
                <ToriiLogo />
                <div className="max-w-md">{leftPanel}</div>
                <div className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Torii Nihongo
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-sm space-y-6">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center">
                        <ToriiLogo size="sm" />
                    </div>

                    {/* Heading */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>

                    {/* Main content */}
                    {children}

                    {/* Footer */}
                    {(footerText || showHomeLink) && (
                        <div className="space-y-4">
                            {footerText && (
                                <>
                                    <Separator />
                                    <p className="text-sm text-center text-muted-foreground">
                                        {footerText}
                                    </p>
                                </>
                            )}
                            {showHomeLink && (
                                <div className="flex justify-center">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
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
