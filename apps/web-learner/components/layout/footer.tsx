'use client'

import Link from 'next/link'
import { Facebook, Youtube, Instagram, Mail, MapPin, Sparkles } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const footerSections = {
        courses: {
            title: 'Khóa học',
            links: [
                { name: 'Luyện thi JLPT N5', href: '/courses/n5' },
                { name: 'Luyện thi JLPT N4', href: '/courses/n4' },
                { name: 'Luyện thi JLPT N3', href: '/courses/n3' },
                { name: 'Luyện thi JLPT N2', href: '/courses/n2' },
                { name: 'Luyện thi JLPT N1', href: '/courses/n1' },
            ],
        },
        features: {
            title: 'Tính năng',
            links: [
                { name: 'Lớp học trực tuyến', href: '/live-classes' },
                { name: 'Trợ lý ảo AI Sensei', href: '/ai-sensei' },
                { name: 'Thẻ ghi nhớ thông minh', href: '/flashcards' },
                { name: 'Cộng đồng học tập', href: '/community' },
            ],
        },
        company: {
            title: 'Về Torii',
            links: [
                { name: 'Giới thiệu', href: '/about' },
                { name: 'Đội ngũ giảng viên', href: '/instructors' },
                { name: 'Liên hệ', href: '/contact' },
                { name: 'Chính sách bảo mật', href: '/privacy' },
                { name: 'Điều khoản sử dụng', href: '/terms' },
            ],
        },
    }

    return (
        <footer className="bg-background pt-20 pb-10 border-t border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <span className="font-sans font-bold text-2xl tracking-tight text-foreground">
                                TORII <span className="text-primary font-normal">Nihongo</span>
                            </span>
                        </Link>

                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            Nền tảng học tiếng Nhật hiện đại ứng dụng công nghệ AI và cộng đồng năng động, giúp bạn chinh phục JLPT nhanh chóng.
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>Thủ Đức, TP. Hồ Chí Minh</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>hello@torii-nihongo.vn</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            {[
                                { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
                                { icon: Youtube, href: '#', color: 'hover:text-red-600' },
                                { icon: Instagram, href: '#', color: 'hover:text-pink-600' }
                            ].map((social, idx) => (
                                <Link
                                    key={idx}
                                    href={social.href}
                                    className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-all duration-200 hover:bg-muted/80 ${social.color}`}
                                >
                                    <social.icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 lg:col-span-3 gap-10 sm:gap-8">
                        {Object.entries(footerSections).map(([key, section]) => (
                            <div key={key} className="space-y-4">
                                <h3 className="text-sm font-bold text-foreground">
                                    {section.title}
                                </h3>
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-muted-foreground hover:text-primary transition-colors block"
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

                {/* Newsletter Box */}
                <div className="rounded-2xl bg-card border border-border p-8 mb-16 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="max-w-md text-center lg:text-left space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">
                                Đăng ký nhận bản tin
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Nhận thông báo về các khóa học mới và tài liệu miễn phí.
                            </p>
                        </div>
                        <div className="w-full max-w-md">
                            <div className="relative flex gap-2">
                                <Input
                                    className="h-12 rounded-xl border-border bg-background"
                                    placeholder="Địa chỉ email của bạn..."
                                />
                                <Button className="h-12 rounded-xl px-6 font-bold shadow-sm">
                                    Đăng ký
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © {currentYear} Torii Nihongo. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Quyền riêng tư</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Điều khoản</Link>
                        <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
