'use client'

import Link from 'next/link'
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const footerSections = {
        courses: {
            title: 'Khóa học',
            links: [
                { name: 'JLPT N5 - Sơ cấp', href: '/courses/n5' },
                { name: 'JLPT N4 - Trung cấp sơ', href: '/courses/n4' },
                { name: 'JLPT N3 - Trung cấp', href: '/courses/n3' },
                { name: 'JLPT N2 - Trung cao', href: '/courses/n2' },
                { name: 'JLPT N1 - Cao cấp', href: '/courses/n1' },
            ],
        },
        features: {
            title: 'Tính năng',
            links: [
                { name: 'Lớp trực tuyến WebRTC', href: '/live-classes' },
                { name: 'AI Sensei 先生', href: '/ai-sensei' },
                { name: 'Flashcards thông minh', href: '/flashcards' },
                { name: 'Luyện thi JLPT', href: '/jlpt-practice' },
                { name: 'Cộng đồng học tập', href: '/community' },
            ],
        },
        resources: {
            title: 'Tài nguyên',
            links: [
                { name: 'Blog học tiếng Nhật', href: '/blog' },
                { name: 'Ngữ pháp N5-N1', href: '/grammar' },
                { name: 'Từ vựng theo chủ đề', href: '/vocabulary' },
                { name: 'Kanji tra cứu', href: '/kanji' },
                { name: 'Câu hỏi thường gặp', href: '/faq' },
            ],
        },
        company: {
            title: 'Về Torii Nihongo',
            links: [
                { name: 'Giới thiệu', href: '/about' },
                { name: 'Đội ngũ giảng viên', href: '/instructors' },
                { name: 'Liên hệ', href: '/contact' },
                { name: 'Tuyển dụng', href: '/careers' },
                { name: 'Chính sách bảo mật', href: '/privacy' },
                { name: 'Điều khoản sử dụng', href: '/terms' },
            ],
        },
    }

    return (
        <footer className="bg-muted/50 border-t">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <svg className="w-10 h-10 text-primary group-hover:opacity-80 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 10h18" strokeLinecap="round" />
                                    <path d="M5 10v8" strokeLinecap="round" />
                                    <path d="M19 10v8" strokeLinecap="round" />
                                    <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-foreground">
                                    Torii Nihongo
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                    日本語センター
                                </span>
                            </div>
                        </Link>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed">
                            Nền tảng học tiếng Nhật trực tuyến hàng đầu Việt Nam.
                            Kết hợp lớp học WebRTC chất lượng cao và AI Sensei để mang đến
                            trải nghiệm học tập hiệu quả nhất.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="w-5 h-5 text-primary" />
                                <a href="mailto:hello@torii-nihongo.vn" className="hover:text-primary transition-colors cursor-pointer">
                                    hello@torii-nihongo.vn
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Phone className="w-5 h-5 text-primary" />
                                <a href="tel:+84123456789" className="hover:text-primary transition-colors cursor-pointer">
                                    (+84) 123 456 789
                                </a>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>Số 1, Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            <a
                                href="https://facebook.com/torii-nihongo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://youtube.com/@torii-nihongo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com/torii.nihongo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Courses Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                            {footerSections.courses.title}
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.courses.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Features Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                            {footerSections.features.title}
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.features.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                            {footerSections.resources.title}
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.resources.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                            {footerSections.company.title}
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.company.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-16 pt-12 border-t">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">
                                Đăng ký nhận tin tức
                            </h3>
                            <p className="text-muted-foreground">
                                Nhận mẹo học tiếng Nhật, đề thi JLPT mới và ưu đãi đặc biệt
                            </p>
                        </div>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="flex-1 px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <Button className="px-6">
                                Đăng ký
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground text-center md:text-left">
                            © {currentYear} Torii Nihongo. All rights reserved. | SP26SE005
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer">
                                Chính sách bảo mật
                            </Link>
                            <Link href="/terms" className="hover:text-primary transition-colors cursor-pointer">
                                Điều khoản sử dụng
                            </Link>
                            <Link href="/cookies" className="hover:text-primary transition-colors cursor-pointer">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
