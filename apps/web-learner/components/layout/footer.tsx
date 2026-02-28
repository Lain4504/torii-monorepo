'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Facebook, Youtube, Instagram, Mail, MapPin, Phone, Github, Linkedin, Send } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Separator } from '@workspace/ui/components/separator'
import { cn } from '@workspace/ui/lib/utils'

const footerLinks = {
    courses: {
        title: 'Lộ trình học',
        links: [
            { name: 'Khóa học N5 - N4', href: '/courses?level=N5' },
            { name: 'Khóa học N3', href: '/courses?level=N3' },
            { name: 'Khóa học N2', href: '/courses?level=N2' },
            { name: 'Khóa học N1', href: '/courses?level=N1' },
            { name: 'Luyện thi JLPT', href: '/courses' },
        ],
    },
    features: {
        title: 'Khám phá',
        links: [
            { name: 'Lớp học Live trực tuyến', href: '/live-classes' },
            { name: 'Hệ thống AI Sensei', href: '/ai-sensei' },
            { name: 'Kho tài liệu VOD', href: '/courses' },
            { name: 'Cộng đồng học viên', href: '/blog' },
            { name: 'Kiểm tra trình độ', href: '/placement-test' },
        ],
    },
    company: {
        title: 'Về Torii',
        links: [
            { name: 'Câu chuyện thương hiệu', href: '/about' },
            { name: 'Đội ngũ giảng viên', href: '/instructors' },
            { name: 'Chương trình đối tác', href: '/partners' },
            { name: 'Chính sách bảo mật', href: '/privacy' },
            { name: 'Điều khoản dịch vụ', href: '/terms' },
        ],
    },
}

const socials = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export function Footer() {
    const year = new Date().getFullYear()
    const pathname = usePathname()
    const isHome = pathname === '/'

    return (
        <footer className="bg-background border-t border-border pt-24 pb-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
                    {/* Brand & Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href="/" className="flex items-center gap-3 transition-all duration-300 group">
                            <div className="relative size-12 transition-transform duration-300 group-hover:scale-110">
                                <Image
                                    src="/logo.png"
                                    alt="Torii Nihongo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-2xl font-black tracking-tight uppercase italic text-foreground">
                                    Torii
                                </span>
                                <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                                    Nihongo
                                </span>
                            </div>
                        </Link>

                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm font-medium">
                            Nền tảng học tiếng Nhật thế hệ mới, kết hợp tinh hoa sư phạm truyền thống cùng sức mạnh trí tuệ nhân tạo để khai phá tiềm năng của mọi người học.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm font-semibold group cursor-pointer">
                                <div className="size-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white">
                                    <MapPin className="size-5" />
                                </div>
                                <span className="text-foreground/80 group-hover:text-primary transition-colors">Lô E2a-7, Đường D1, TP. Thủ Đức, HCM</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-semibold group cursor-pointer">
                                <div className="size-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white">
                                    <Mail className="size-5" />
                                </div>
                                <span className="text-foreground/80 group-hover:text-primary transition-colors">contact@toriinihongo.vn</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {Object.entries(footerLinks).map(([key, section]) => (
                            <div key={key} className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40">
                                    {section.title}
                                </h3>
                                <ul className="space-y-4">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm font-bold text-muted-foreground hover:text-primary transition-all flex items-center group"
                                            >
                                                <div className="w-0 h-0.5 bg-primary mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300" />
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-6">
                            <h3 className="text-lg font-black italic">Đăng ký nhận ưu đãi</h3>
                            <p className="text-xs text-muted-foreground font-medium">Nhận thông báo về các khoá học mới và tài liệu JLPT miễn phí hàng tuần.</p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Email của bạn..."
                                    className="h-12 bg-background border-border rounded-xl px-4 text-xs font-bold"
                                />
                                <Button size="icon" className="size-12 rounded-xl shrink-0">
                                    <Send className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {socials.map((s) => (
                                <Link
                                    key={s.label}
                                    href={s.href}
                                    className="size-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                    aria-label={s.label}
                                >
                                    <s.icon className="size-4" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator className="opacity-50" />

                <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground/40 italic">
                    <p>© {year} Torii Nihongo Education. All Rights Reserved.</p>
                    <div className="flex items-center gap-8">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                        <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
