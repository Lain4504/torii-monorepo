'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';

export function HomeClient() {
    const [typedText, setTypedText] = useState("");
    const [showOptions, setShowOptions] = useState(false);

    const fullText = "Chào mừng bạn đến với Torii Nihongo... Bạn muốn chọn con đường nào? Học qua video bài giảng chuyên sâu, tham gia lớp học trực tuyến Live (WebRTC), hay rèn luyện phản xạ cùng tôi?";

    useEffect(() => {
        let currentText = "";
        let i = 0;
        const interval = setInterval(() => {
            currentText += fullText.charAt(i);
            setTypedText(currentText);
            i++;
            if (i >= fullText.length) {
                clearInterval(interval);
                setTimeout(() => setShowOptions(true), 500);
            }
        }, 35);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground min-h-screen">
            <style jsx>{`
                .ethereal-bg {
                    background-image: url('/background.png');
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed;
                }
                .ink-overlay {
                    background: linear-gradient(to bottom, 
                        rgba(0, 0, 0, 0.2) 0%, 
                        color-mix(in oklch, var(--background), transparent 20%) 60%, 
                        var(--background) 100%
                    );
                }
                .glass-portal {
                    background: color-mix(in oklch, var(--foreground), transparent 97%);
                    backdrop-filter: blur(8px);
                    border: 1px solid color-mix(in oklch, var(--primary), transparent 80%);
                    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                }
                .glass-portal:hover {
                    background: color-mix(in oklch, var(--primary), transparent 92%);
                    border-color: color-mix(in oklch, var(--primary), transparent 50%);
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1), 0 0 20px color-mix(in oklch, var(--primary), transparent 90%);
                    transform: translateY(-8px);
                }
                .title-glow {
                    text-shadow: 0 0 15px oklch(0.64 0.13 175 / 0.4);
                }
                .serif-jp {
                    font-family: var(--font-serif), serif;
                }
                .space-grotesk {
                    font-family: var(--font-space), sans-serif;
                }
                .brush-border {
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }
            `}</style>

            <main className="relative overflow-hidden">
                {/* Hero section with background.png */}
                <section className="relative h-screen flex flex-col items-center justify-center p-4 ethereal-bg">
                    <div className="absolute inset-0 ink-overlay pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-12">
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <span className="space-grotesk text-primary font-bold tracking-[0.5em] uppercase text-sm block">Welcome to Torii Universe</span>
                            <h1 className="serif-jp text-5xl md:text-7xl font-black title-glow leading-tight">
                                Chinh Phục <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-foreground to-primary">Ngôn Ngữ Tâm Hồn</span>
                            </h1>
                        </div>

                        {/* Immersive Dialogue Box */}
                        <div className="max-w-2xl mx-auto backdrop-blur-md bg-background/40 dark:bg-black/40 border border-primary/20 p-8 rounded-sm relative group overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-8 h-1 bg-primary shadow-[0_0_10px_var(--primary)]"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-1 bg-primary shadow-[0_0_10px_var(--primary)]"></div>

                            <div className="min-h-[60px]">
                                <p className="serif-jp text-lg md:text-xl text-foreground/90 leading-relaxed italic">
                                    "{typedText}"
                                    <span className="animate-pulse ml-1 text-primary">|</span>
                                </p>
                            </div>
                        </div>

                        {/* Interactive Choices */}
                        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto transition-all duration-1000 ${showOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <Link href="/courses" className="glass-portal p-6 group">
                                <span className="block text-primary space-grotesk text-xs mb-2 font-bold">[ 01 ]</span>
                                <span className="block serif-jp font-bold group-hover:text-primary transition-colors">Video VOD</span>
                            </Link>
                            <Link href="/live-classes" className="glass-portal p-6 group">
                                <span className="block text-primary space-grotesk text-xs mb-2 font-bold">[ 02 ]</span>
                                <span className="block serif-jp font-bold group-hover:text-primary transition-colors">Live Class</span>
                            </Link>
                            <Link href="/demo-ai" className="glass-portal p-6 group">
                                <span className="block text-primary space-grotesk text-xs mb-2 font-bold">[ 03 ]</span>
                                <span className="block serif-jp font-bold group-hover:text-primary transition-colors">AI Sensei</span>
                            </Link>
                            <Link href="/placement-test" className="glass-portal p-6 group">
                                <span className="block text-primary space-grotesk text-xs mb-2 font-bold">[ 04 ]</span>
                                <span className="block serif-jp font-bold group-hover:text-primary transition-colors">Test LVL</span>
                            </Link>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-primary/40 animate-bounce flex flex-col items-center gap-2">
                        <span className="space-grotesk text-[10px] uppercase tracking-widest">Scroll to Journey</span>
                        <div className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent"></div>
                    </div>
                </section>

                {/* The Trinity Experience Section - Rebuilt for Immersion */}
                <section className="py-32 relative bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                            <div className="space-y-4">
                                <span className="text-primary space-grotesk font-bold tracking-[0.4em] uppercase text-xs">The Trinity System</span>
                                <h2 className="serif-jp text-4xl md:text-5xl font-black">Hành Trình <br /> <span className="text-primary">Tam Trụ Đào Tạo</span></h2>
                            </div>
                            <p className="max-w-md text-muted-foreground serif-jp italic text-lg opacity-80 border-l border-primary/20 pl-6">
                                "Không chỉ là học tập, đó là sự khai phóng tiềm năng qua ba cánh cửa tri thức."
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-0 border border-primary/10 rounded-sm overflow-hidden">
                            {/* Gate 01: VOD */}
                            <div className="relative group overflow-hidden border-r border-primary/10">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="p-12 space-y-8 relative z-10">
                                    <div className="w-12 h-12 flex items-center justify-center border border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="serif-jp text-2xl font-black group-hover:text-primary transition-colors tracking-tight">Cửa Thứ Nhất: <br /> Lưu Trữ Tri Thức</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed serif-jp opacity-70">
                                            Hệ thống hàng nghìn bài học VOD được đúc kết từ những bậc thầy ngôn ngữ. Xây dựng nền tảng vững như bàn thạch.
                                        </p>
                                    </div>
                                    <ul className="space-y-3 pt-6 border-t border-primary/10">
                                        <li className="flex items-center text-xs serif-jp text-foreground/60 font-medium group-hover:text-foreground"><span className="w-1.5 h-1.5 bg-primary mr-3 rounded-full"></span> Tiếp cận vĩnh viễn</li>
                                        <li className="flex items-center text-xs serif-jp text-foreground/60 font-medium group-hover:text-foreground"><span className="w-1.5 h-1.5 bg-primary mr-3 rounded-full"></span> Giáo trình N1 chuyên gia</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Gate 02: LIVE */}
                            <div className="relative group overflow-hidden border-r border-primary/10 bg-black/5">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="p-12 space-y-8 relative z-10">
                                    <div className="w-12 h-12 flex items-center justify-center border border-primary bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15.6 11.6L22 7v10l-6.4-4.6v-1.8z"></path><rect x="2" y="5" width="14" height="14" rx="2" ry="2"></rect></svg>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="serif-jp text-2xl font-black group-hover:text-primary transition-colors tracking-tight">Cửa Thứ Hai: <br /> Cộng Hưởng Trực Tiếp</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed serif-jp opacity-70">
                                            Vượt qua khoảng cách địa lý với WebRTC. Tương tác trực tiếp, giải đáp tức thì cùng Sensei và đồng đội.
                                        </p>
                                    </div>
                                    <ul className="space-y-3 pt-6 border-t border-primary/10">
                                        <li className="flex items-center text-xs serif-jp text-foreground/60 font-medium group-hover:text-foreground"><span className="w-1.5 h-1.5 bg-primary mr-3 rounded-full"></span> Độ trễ tiệm cận 0ms</li>
                                        <li className="flex items-center text-xs serif-jp text-foreground/60 font-medium group-hover:text-foreground"><span className="w-1.5 h-1.5 bg-primary mr-3 rounded-full"></span> Live Q&A hàng tuần</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Gate 03: AI */}
                            <div className="relative group overflow-hidden">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="p-12 space-y-8 relative z-10">
                                    <div className="w-12 h-12 flex items-center justify-center border border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="serif-jp text-2xl font-black group-hover:text-primary transition-colors tracking-tight">Cửa Thứ Ba: <br /> Phá Vỡ Giới Hạn AI</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed serif-jp opacity-70">
                                            Luyện tập không ngừng nghỉ với trợ lý AI Sensei. Sửa lỗi phát âm, phản xạ voice 1:1 siêu thực.
                                        </p>
                                    </div>
                                    <ul className="space-y-3 pt-6 border-t border-primary/10">
                                        <li className="flex items-center text-xs serif-jp text-foreground/60 font-medium group-hover:text-foreground"><span className="w-1.5 h-1.5 bg-primary mr-3 rounded-full"></span> Voice Real-time 1:1</li>
                                        <li className="flex items-center text-xs serif-jp text-foreground/60 font-medium group-hover:text-foreground"><span className="w-1.5 h-1.5 bg-primary mr-3 rounded-full"></span> Kịch bản thực chiến</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Premium Features Showcase */}
                <section className="py-32 relative overflow-hidden bg-background">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 lg:gap-12">
                            {[
                                {
                                    icon: <svg className="size-6 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg>,
                                    title: "Đa Nền Tảng",
                                    desc: "TRUY CẬP MỌI NƠI"
                                },
                                {
                                    icon: <svg className="size-6 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
                                    title: "Mock Test",
                                    desc: "CHALLENGE JLPT"
                                },
                                {
                                    icon: <svg className="size-6 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
                                    title: "Cộng Đồng",
                                    desc: "ĐỒNG ĐỘI TORII"
                                },
                                {
                                    icon: <svg className="size-6 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
                                    title: "Flashcard",
                                    desc: "SPACED REPETITION"
                                }
                            ].map((feature, idx) => (
                                <div key={idx} className="group flex flex-col items-center text-center p-8 transition-all duration-300 hover:bg-primary/5 rounded-sm">
                                    <div className="size-16 mb-6 flex items-center justify-center border border-primary/20 bg-primary/5 text-primary rounded-sm transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                        {feature.icon}
                                    </div>
                                    <h4 className="serif-jp font-bold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h4>
                                    <p className="text-[10px] space-grotesk text-muted-foreground font-bold tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity uppercase">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Immersive CTA */}
                <section className="py-32 relative ethereal-bg">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
                        <div className="space-y-4">
                            <span className="text-primary space-grotesk font-bold tracking-[0.8em] uppercase text-[10px]">Begin your Journey</span>
                            <h2 className="serif-jp text-4xl md:text-5xl font-black title-glow leading-tight">Sẵn sàng bước qua <br /> <span className="text-primary">Cánh Cửa Torii?</span></h2>
                            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto serif-jp leading-relaxed opacity-80">
                                Đừng để ranh giới ngôn ngữ ngăn cản bước chân bạn. <br className="hidden sm:block" /> Hãy để công nghệ dẫn lối đến đỉnh cao tri thức.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button size="lg" className="px-10 h-14 rounded-sm font-bold serif-jp tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto" asChild>
                                <Link href="/register">MỞ CÁNH CỬA NGAY</Link>
                            </Button>
                            <Button variant="outline" size="lg" className="px-10 h-14 rounded-sm border-primary/40 text-primary font-bold serif-jp tracking-widest hover:bg-primary/5 w-full sm:w-auto" asChild>
                                <Link href="/about">TÌM HIỂU THÊM</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
