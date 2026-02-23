import Link from 'next/link'
import { type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Separator } from '@workspace/ui/components/separator'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

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
        <div className="min-h-screen w-full relative flex flex-col lg:flex-row font-sans overflow-x-hidden">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                style={{ backgroundImage: "url('/mascot.png')" }}
            />

            {/* Content Layer */}
            <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row">
                {/* Left Panel - Branding & Intro */}
                <div className="hidden lg:flex flex-col justify-between p-12 lg:p-20 flex-1">
                    <ToriiLogo />
                    <div className="max-w-xl animate-in fade-in slide-in-from-left duration-700">
                        {leftPanel}
                    </div>
                    <div className="text-sm font-semibold text-foreground/60">
                        © {new Date().getFullYear()} Torii Nihongo
                    </div>
                </div>

                {/* Right Panel - Auth Form */}
                <div className="flex items-center justify-center p-6 lg:p-12 flex-1">
                    <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom lg:slide-in-from-right duration-700">
                        {/* Mobile logo only visible on small screens */}
                        <div className="lg:hidden flex justify-center mb-10">
                            <ToriiLogo size="sm" />
                        </div>

                        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/95 backdrop-blur-sm overflow-hidden rounded-2xl">
                            <CardHeader className="space-y-2 pt-8 px-8">
                                <CardTitle className="text-3xl font-extrabold text-center tracking-tight">
                                    {title}
                                </CardTitle>
                                {description && (
                                    <CardDescription className="text-center text-base font-medium">
                                        {description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="p-8">
                                {children}
                            </CardContent>
                            {footerText && (
                                <CardFooter className="flex flex-col gap-6 bg-muted/50 py-6 px-8 border-t">
                                    <div className="text-center w-full">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {footerText}
                                        </p>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>

                        {/* Home Link positioned below the card */}
                        {showHomeLink && (
                            <div className="mt-8 flex justify-center">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground transition-all duration-200 group"
                                >
                                    <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                                    Quay về trang chủ
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
