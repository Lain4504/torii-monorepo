import Link from 'next/link'
import { Facebook, Youtube, Instagram, Mail, MapPin, Sparkles } from 'lucide-react'
import { Separator } from '@workspace/ui/components/separator'
import { Button } from '@workspace/ui/components/button'

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

    return (
        <footer className="border-t bg-background pt-16 pb-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="size-5 text-primary-foreground" />
                            </div>
                            <span className="font-black text-lg tracking-tighter">
                                Torii <span className="text-primary">Nihongo</span>
                            </span>
                        </Link>

                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-medium">
                            Nền tảng học tiếng Nhật hiện đại ứng dụng trí tuệ nhân tạo (AI) và cộng đồng năng động, giúp bạn chinh phục JLPT nhanh chóng và hiệu quả.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <div className="size-7 rounded-lg bg-muted flex items-center justify-center">
                                    <MapPin className="size-3.5" />
                                </div>
                                Thủ Đức, TP. Hồ Chí Minh
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <div className="size-7 rounded-lg bg-muted flex items-center justify-center">
                                    <Mail className="size-3.5" />
                                </div>
                                hello@torii-nihongo.vn
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            {socials.map((s) => (
                                <Button
                                    key={s.label}
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="size-10 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                >
                                    <Link href={s.href} aria-label={s.label}>
                                        <s.icon className="size-5" />
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:col-span-3 gap-8">
                        {Object.entries(footerLinks).map(([key, section]) => (
                            <div key={key} className="space-y-5">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{section.title}</h3>
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
                        <p className="font-bold text-muted-foreground/60">
                            © {year} <span className="text-foreground">Torii Nihongo</span>. Thiết kế cho cộng đồng tự học.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-muted-foreground hover:text-foreground font-bold transition-colors">Quyền riêng tư</Link>
                            <Link href="/terms" className="text-muted-foreground hover:text-foreground font-bold transition-colors">Điều khoản</Link>
                            <Link href="/cookies" className="text-muted-foreground hover:text-foreground font-bold transition-colors">Cookies</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
