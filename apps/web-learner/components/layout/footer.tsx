'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Facebook, Youtube, Instagram, Mail, MapPin } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

const footerLinks = {
    courses: {
        title: 'Khóa học',
        links: [
            { name: 'JLPT N5', href: '/courses?level=N5' },
            { name: 'JLPT N4', href: '/courses?level=N4' },
            { name: 'JLPT N3', href: '/courses?level=N3' },
            { name: 'JLPT N2', href: '/courses?level=N2' },
            { name: 'JLPT N1', href: '/courses?level=N1' },
        ],
    },
    features: {
        title: 'Tính năng',
        links: [
            { name: 'Lớp học trực tuyến', href: '/live-classes' },
            { name: 'Trợ lý AI Sensei', href: '/ai-sensei' },
            { name: 'Thẻ ghi nhớ', href: '/flashcards' },
            { name: 'Cộng đồng', href: '/community' },
        ],
    },
    company: {
        title: 'Về Torii',
        links: [
            { name: 'Giới thiệu', href: '/about' },
            { name: 'Giảng viên', href: '/instructors' },
            { name: 'Liên hệ', href: '/contact' },
            { name: 'Chính sách bảo mật', href: '/privacy' },
            { name: 'Điều khoản', href: '/terms' },
        ],
    },
}

const socials = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Instagram, href: '#', label: 'Instagram' },
]

export function Footer() {
    const year = new Date().getFullYear()
    const pathname = usePathname()
    const isHome = pathname === '/'

    return (
        <footer className={cn(
            "pt-24 pb-12 transition-all duration-500 relative overflow-hidden",
            isHome
                ? "bg-[var(--background)] border-t border-[var(--primary)]/20 text-[var(--foreground)]"
                : "bg-background border-t"
        )}>
            {isHome && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.64_0.13_175_/_0.08),transparent_50%)] pointer-events-none"></div>
            )}
            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-3 transition-all duration-300 group">
                            <div className="relative size-10 transition-transform duration-300 group-hover:scale-110">
                                <Image
                                    src="/logo.png"
                                    alt="Torii Nihongo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className={cn(
                                    "text-xl font-black tracking-tighter uppercase italic transition-colors",
                                    isHome ? "text-foreground" : "text-foreground"
                                )}>
                                    Torii
                                </span>
                                <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                                    Nihongo
                                </span>
                            </div>
                        </Link>

                        <p className={cn(
                            "text-sm leading-relaxed max-w-sm",
                            isHome ? "text-[#80cbc4] [font-family:'Noto_Serif_JP',serif] text-sm opacity-70 italic" : "text-muted-foreground font-medium"
                        )}>
                            {isHome
                                ? "Khai phóng tiềm năng ngôn ngữ qua sự giao thoa giữa nghệ thuật truyền thống và công nghệ tương lai."
                                : "Nền tảng học tiếng Nhật hiện đại ứng dụng trí tuệ nhân tạo (AI) và cộng đồng năng động, giúp bạn chinh phục JLPT nhanh chóng và hiệu quả."}
                        </p>

                        <div className="space-y-4">
                            <div className={cn("flex items-center gap-4 text-sm font-medium", isHome ? "text-[var(--foreground)]/80" : "text-muted-foreground")}>
                                <div className={cn("size-8 rounded-sm flex items-center justify-center transition-all", isHome ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20" : "bg-muted")}>
                                    <MapPin className="size-4" />
                                </div>
                                <span className={cn(isHome && "[font-family:'Space_Grotesk',sans-serif] uppercase tracking-widest text-[10px] font-bold")}>Thủ Đức, TP. Hồ Chí Minh</span>
                            </div>
                            <div className={cn("flex items-center gap-4 text-sm font-medium", isHome ? "text-[var(--foreground)]/80" : "text-muted-foreground")}>
                                <div className={cn("size-8 rounded-sm flex items-center justify-center transition-all", isHome ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20" : "bg-muted")}>
                                    <Mail className="size-4" />
                                </div>
                                <span className={cn(isHome && "[font-family:'Space_Grotesk',sans-serif] uppercase tracking-widest text-[10px] font-bold")}>hello@torii-nihongo.vn</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            {socials.map((s) => (
                                <Button
                                    key={s.label}
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className={cn(
                                        "size-11 transition-all rounded-sm",
                                        isHome
                                            ? "bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white shadow-lg shadow-black/20"
                                            : "bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                    )}
                                >
                                    <Link href={s.href} aria-label={s.label}>
                                        <s.icon className="size-5" />
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:col-span-3 gap-12">
                        {Object.entries(footerLinks).map(([key, section]) => (
                            <div key={key} className="space-y-6">
                                <h3 className={cn(
                                    "text-[10px] font-bold uppercase tracking-[0.3em]",
                                    isHome ? "text-[var(--primary)] [font-family:'Space_Grotesk',sans-serif]" : "text-muted-foreground/60"
                                )}>
                                    {isHome ? section.title : section.title}
                                </h3>
                                <ul className="space-y-4">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className={cn(
                                                    "text-sm font-medium transition-all flex items-center group",
                                                    isHome
                                                        ? "text-[var(--foreground)]/60 hover:text-[var(--primary)] [font-family:'Noto_Serif_JP',serif]"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {isHome && <span className="w-0 group-hover:w-3 h-px bg-[var(--primary)] mr-0 group-hover:mr-3 transition-all duration-300"></span>}
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cn("mt-24 pt-12", isHome ? "border-t border-[var(--primary)]/10" : "border-t")}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-sm">
                        <p className={cn(
                            "font-bold text-muted-foreground/60",
                            isHome && "[font-family:'Space_Grotesk',sans-serif] uppercase tracking-[0.4em] text-[9px] text-[var(--primary)]/50"
                        )}>
                            © {year} <span className={cn(isHome ? "text-[var(--primary)]" : "text-foreground")}>Torii Nihongo</span>. {isHome ? "EST_2024." : "Thiết kế cho cộng đồng tự học."}
                        </p>
                        <div className={cn("flex items-center gap-8", isHome && "[font-family:'Space_Grotesk',sans-serif] text-[10px] text-[#80cbc4]/50 font-bold uppercase tracking-widest")}>
                            <Link href="/privacy" className={cn("transition-all", isHome ? "hover:text-[var(--primary)]" : "text-muted-foreground hover:text-foreground")}>Quyền riêng tư</Link>
                            <Link href="/terms" className={cn("transition-all", isHome ? "hover:text-[var(--primary)]" : "text-muted-foreground hover:text-foreground")}>Điều khoản</Link>
                            <Link href="/cookies" className={cn("transition-all", isHome ? "hover:text-[var(--primary)]" : "text-muted-foreground hover:text-foreground")}>Cookies</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
