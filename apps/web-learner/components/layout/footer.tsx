'use client'

import Link from 'next/link'
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin, Sparkles, Send } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { useTranslation } from '@workspace/i18n'
import { Input } from '@workspace/ui/components/input'

export function Footer() {
    const { t } = useTranslation()
    const currentYear = new Date().getFullYear()

    const footerSections = {
        courses: {
            titleKey: 'learner.footer.sections.courses',
            links: [
                { nameKey: 'learner.footer.courses.jlptN5', href: '/courses/n5' },
                { nameKey: 'learner.footer.courses.jlptN4', href: '/courses/n4' },
                { nameKey: 'learner.footer.courses.jlptN3', href: '/courses/n3' },
                { nameKey: 'learner.footer.courses.jlptN2', href: '/courses/n2' },
                { nameKey: 'learner.footer.courses.jlptN1', href: '/courses/n1' },
            ],
        },
        features: {
            titleKey: 'learner.footer.sections.features',
            links: [
                { nameKey: 'learner.footer.features.liveClassesWebRTC', href: '/live-classes' },
                { nameKey: 'learner.footer.features.aiSensei', href: '/ai-sensei' },
                { nameKey: 'learner.footer.features.smartFlashcards', href: '/flashcards' },
                { nameKey: 'learner.footer.features.learningCommunity', href: '/community' },
            ],
        },
        company: {
            titleKey: 'learner.footer.sections.about',
            links: [
                { nameKey: 'learner.footer.company.introduction', href: '/about' },
                { nameKey: 'learner.footer.company.instructors', href: '/instructors' },
                { nameKey: 'learner.footer.company.contact', href: '/contact' },
                { nameKey: 'learner.footer.company.privacy', href: '/privacy' },
                { nameKey: 'learner.footer.company.terms', href: '/terms' },
            ],
        },
    }

    return (
        <footer className="relative bg-background pt-24 pb-12 overflow-hidden border-t border-border/40">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-8 mb-20">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-primary flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-2xl tracking-tighter text-foreground">TORII</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] -mt-1 opacity-70">Nihongo Center</span>
                            </div>
                        </Link>

                        <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm font-medium">
                            {t('learner.footer.platformDescription')}
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>Thủ Đức, TP. Hồ Chí Minh</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>hello@torii-nihongo.vn</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            {[
                                { icon: Facebook, href: '#', color: 'hover:bg-blue-500/10 hover:text-blue-600' },
                                { icon: Youtube, href: '#', color: 'hover:bg-red-500/10 hover:text-red-600' },
                                { icon: Instagram, href: '#', color: 'hover:bg-pink-500/10 hover:text-pink-600' }
                            ].map((social, idx) => (
                                <Link
                                    key={idx}
                                    href={social.href}
                                    className={`w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground transition-all duration-300 ${social.color} hover:scale-110`}
                                >
                                    <social.icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 lg:col-span-3 gap-12 sm:gap-8">
                        {Object.entries(footerSections).map(([key, section]) => (
                            <div key={key} className="space-y-6">
                                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.25em] opacity-50">
                                    {t(section.titleKey)}
                                </h3>
                                <ul className="space-y-4">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-[13px] font-bold text-muted-foreground/70 hover:text-primary transition-all flex items-center group cursor-pointer"
                                            >
                                                <span className="w-0 group-hover:w-3 h-[1px] bg-primary transition-all duration-300 mr-0 group-hover:mr-2 opacity-0 group-hover:opacity-100" />
                                                {t(link.nameKey)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Newsletter Box */}
                <div className="relative rounded-[2.5rem] bg-muted/30 border border-border/40 p-8 md:p-12 mb-20 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:bg-primary/10 transition-all duration-700" />
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="max-w-md text-center lg:text-left space-y-3">
                            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                                Sẵn sàng chinh phục tiếng Nhật?
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground">
                                Đăng ký nhận tin để không bỏ lỡ các ưu đãi và tài liệu học tập mới nhất từ Torii.
                            </p>
                        </div>
                        <div className="w-full max-w-md">
                            <div className="relative group">
                                <Input
                                    className="h-14 rounded-2xl bg-background border-border/40 pl-6 pr-16 text-sm font-bold placeholder:text-muted-foreground/40 shadow-none ring-0 focus-visible:ring-0"
                                    placeholder="Địa chỉ email của bạn..."
                                />
                                <Button className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer">
                                    <Send className="w-4 h-4 text-white" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/20">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest text-center md:text-left">
                            © {currentYear} Torii Nihongo. All rights reserved. | Code: SP26SE005
                        </p>
                        <div className="flex items-center gap-8 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                            <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer">Privacy</Link>
                            <Link href="/terms" className="hover:text-primary transition-colors cursor-pointer">Terms</Link>
                            <Link href="/cookies" className="hover:text-primary transition-colors cursor-pointer">Cookies</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
