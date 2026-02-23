import Link from 'next/link'
import { Facebook, Youtube, Instagram, Mail, MapPin } from 'lucide-react'
import { Separator } from '@workspace/ui/components/separator'

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
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="size-7 rounded-md bg-primary flex items-center justify-center">
                                <svg className="size-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M3 10h18" strokeLinecap="round" />
                                    <path d="M5 10v8" strokeLinecap="round" />
                                    <path d="M19 10v8" strokeLinecap="round" />
                                    <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="font-bold text-base tracking-tight">
                                Torii <span className="text-primary">Nihongo</span>
                            </span>
                        </Link>

                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Nền tảng học tiếng Nhật hiện đại ứng dụng AI và cộng đồng năng động, giúp bạn chinh phục JLPT nhanh chóng.
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="size-3.5 shrink-0" />
                                Thủ Đức, TP. Hồ Chí Minh
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="size-3.5 shrink-0" />
                                hello@torii-nihongo.vn
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {socials.map((s) => (
                                <Link
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="size-8 rounded-md flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                    <s.icon className="size-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:col-span-3 gap-8">
                        {Object.entries(footerLinks).map(([key, section]) => (
                            <div key={key} className="space-y-3">
                                <h3 className="text-sm font-semibold">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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

                <Separator className="my-8" />

                {/* Bottom */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {year} Torii Nihongo. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Quyền riêng tư</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Điều khoản</Link>
                        <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
