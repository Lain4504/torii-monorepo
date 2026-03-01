'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
    Play,
    Users,
    MessageSquare,
    Zap,
    Shield,
    Globe,
    Star,
    ChevronRight,
    ArrowRight,
    Check,
    Cpu,
    Video,
    Award,
    Clock,
    BookOpen,
    BarChart3,
    ArrowUpRight,
    Sparkles,
    Mic,
    HelpCircle,
    Mail,
    Instagram,
    Twitter,
    Github
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@workspace/ui/components/accordion';

// --- Constants ---

const FADE_IN_UP = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
    initial: {},
    whileInView: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ badge, title, subtitle, centered = true }: { badge: string; title: string | React.ReactNode; subtitle?: string; centered?: boolean }) => (
    <div className={`mb-16 space-y-4 ${centered ? 'text-center max-w-3xl mx-auto' : 'text-left'}`}>
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
            <Badge variant="outline" className="px-4 py-1.5 border-[#B91C1C]/20 text-[#B91C1C] font-semibold tracking-wider bg-[#B91C1C]/5 rounded-full uppercase text-[10px]">
                {badge}
            </Badge>
        </motion.div>
        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight"
        >
            {title}
        </motion.h2>
        {subtitle && (
            <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium"
            >
                {subtitle}
            </motion.p>
        )}
    </div>
);

// --- Sections ---

// Navbar and Footer are now provided by the global MarketingLayout

function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={containerRef} className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-[#FBFBFA]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#B91C1C]/[0.02] -z-10" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#B91C1C]/[0.03] rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8"
                    >
                        <Badge variant="outline" className="px-4 py-2 border-[#B91C1C]/20 text-[#B91C1C] font-bold tracking-[0.2em] bg-white rounded-full uppercase text-[10px] shadow-sm">
                            ✦ Personalized Japanese Mastery
                        </Badge>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1] tracking-tight">
                            Master <span className="text-[#B91C1C]">Japanese</span> <br />
                            with AI Precision.
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 max-w-xl leading-relaxed">
                            Combining high-fidelity video lessons, real-time live classes, and an advanced AI Sensei to guide your journey from N5 to N1.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold bg-[#B91C1C] hover:bg-[#991717] ring-offset-2 hover:ring-2 ring-[#B91C1C]/30 transition-all group" asChild>
                                <Link href="/register">
                                    Start Learning Free
                                    <ArrowRight className="ml-3 size-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="h-16 px-10 rounded-full text-lg font-bold border-gray-200 hover:bg-gray-50 bg-white" asChild>
                                <Link href="/courses">Explore Roadmap</Link>
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="size-12 rounded-full border-4 border-[#FBFBFA] bg-gray-200 overflow-hidden shadow-sm">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                                    </div>
                                ))}
                                <div className="size-12 rounded-full border-4 border-[#FBFBFA] bg-[#B91C1C] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    +12k
                                </div>
                            </div>
                            <div>
                                <div className="flex text-amber-500 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="size-3.5 fill-current" />)}
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trust by 12,000+ Learners</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        style={{ y: y1 }}
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.12)] border border-white/50 bg-white">
                            <img src="/home1/hero.png" alt="Torii Sensei Platform" className="w-full h-auto" />

                            {/* Floating UI Elements */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute top-12 -left-8 backdrop-blur-xl bg-white/90 p-5 rounded-3xl border border-white/20 shadow-2xl space-y-3 max-w-[200px]"
                            >
                                <div className="size-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Cpu className="size-5" />
                                </div>
                                <p className="text-sm font-black text-gray-900 leading-tight">AI Feedback</p>
                                <p className="text-xs text-gray-500 font-medium">Pronunciation: <span className="text-[#B91C1C] font-bold">98% Match</span></p>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[98%] rounded-full" />
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="absolute bottom-20 -right-8 backdrop-blur-xl bg-white/95 p-6 rounded-[2rem] border border-white/20 shadow-2xl space-y-2 min-w-[220px]"
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C]">JLPT Readiness</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black text-gray-900">N3</span>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12.5%</span>
                                </div>
                                <div className="flex gap-1">
                                    {[0.3, 0.5, 0.8, 1, 0.7, 0.9, 0.6].map((h, i) => (
                                        <div key={i} className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden flex flex-col justify-end">
                                            <div className="bg-[#B91C1C]" style={{ height: `${h * 100}%` }} />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Background shapes */}
                        <div className="absolute -z-10 -top-8 -right-8 size-full border-[10px] border-[#B91C1C]/5 rounded-[3rem]" />
                        <div className="absolute -z-10 -bottom-16 -left-16 size-80 rounded-full border border-gray-100" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function SocialProof() {
    return (
        <section className="py-20 bg-white border-y border-gray-100">
            <div className="container mx-auto px-6 max-w-7xl">
                <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">Empowering Learners From Global Communities</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all">
                    {['Google', 'Netflix', 'Sony', 'Uniqlo', 'Rakuten'].map(name => (
                        <span key={name} className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">{name}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    const features = [
        {
            icon: Video,
            title: "Expert-Led VOD Courses",
            desc: "HD video lessons covering N5 to N1, meticulously scripted for clarity and retention. Buy once, master for life.",
            color: "blue",
            link: "/courses"
        },
        {
            icon: Users,
            title: "Live WebRTC Classrooms",
            desc: "Join high-interaction livestreams with native Senseis. Real-time Q&A and group practice sessions.",
            color: "red",
            link: "/live-classes"
        },
        {
            icon: Cpu,
            title: "24/7 AI Sensei Tutor",
            desc: "Our custom LLM corrects your grammar, simulates conversations, and guides your daily study rituals.",
            color: "purple",
            link: "/ai-sensei"
        }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <SectionHeader
                    badge="Platform Ecosystem"
                    title={<>The Three Pillars of <br /><span className="text-[#B91C1C] italic">Effective Mastery.</span></>}
                    subtitle="We didn’t just build a course; we built a comprehensive learning engine."
                />

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
                            className="group h-full"
                        >
                            <GlassCard className="p-10 h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border-transparent hover:border-gray-200">
                                <div className={`size-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 ${f.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    f.color === 'red' ? 'bg-[#B91C1C]/5 text-[#B91C1C]' :
                                        'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    <f.icon className="size-8" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4">{f.title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-8 flex-1">{f.desc}</p>
                                <Link href={f.link} className="inline-flex items-center gap-2 font-bold text-sm text-gray-900 hover:text-[#B91C1C] transition-colors group/link">
                                    Explore Feature <ChevronRight className="size-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function AISenseiSection() {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-950 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,#B91C1C20,transparent)] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(185,28,28,0.15)]"
                        >
                            <img src="/home1/ai-sensei.png" alt="AI Sensei Interface" className="w-full h-auto" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent" />

                            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-3 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-white text-sm font-bold tracking-widest uppercase">Live Analysis Active</span>
                                </div>
                                <Badge className="bg-red-500 text-white border-none py-1 px-3">99.2% Accuracy</Badge>
                            </div>
                        </motion.div>

                        {/* Glow effect */}
                        <div className="absolute -inset-10 bg-[#B91C1C]/20 blur-[120px] -z-10 rounded-full" />
                    </div>

                    <div className="order-1 lg:order-2 space-y-10">
                        <div className="space-y-4">
                            <Badge className="bg-white/10 text-white/80 border-white/20 hover:bg-white/20 px-4 py-2 rounded-full uppercase text-[10px] font-black tracking-widest">
                                <Sparkles className="size-3 mr-2 text-red-500" /> Proprietary Neo-Sensei AI
                            </Badge>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                                Your Perfect <br />
                                <span className="text-[#B91C1C]">Language Partner.</span>
                            </h2>
                            <p className="text-xl text-white/60 leading-relaxed max-w-xl">
                                AI Sensei isn't just a chatbot. It's a trained linguistic engine that understands context, explains complex grammar concepts, and corrects your writing with surgical precision.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { icon: Mic, title: "Voice Precision", desc: "Real-time phoneme matching to fix your accent." },
                                { icon: MessageSquare, title: "Infinite Chat", desc: "Simulate real-life scenarios like job interviews." },
                                { icon: Zap, title: "Instant Feedback", desc: "Know why your sentence was slightly off instantly." },
                                { icon: BarChart3, title: "Progression AI", desc: "Dynamically adjusts difficulty based on your speed." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 flex-shrink-0">
                                        <item.icon className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-white font-bold">{item.title}</h4>
                                        <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold bg-white text-gray-950 hover:bg-gray-100 shadow-xl shadow-white/10" asChild>
                            <Link href="/ai-sensei">Talk to Sensei Now</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function LiveClassSection() {
    return (
        <section className="py-32 bg-[#FBFBFA]">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="w-full lg:w-1/2 space-y-10">
                        <SectionHeader
                            centered={false}
                            badge="Interactive Learning"
                            title={<>Real-time. Real Connection. <br /><span className="text-[#B91C1C]">Real Mastery.</span></>}
                            subtitle="Stream-based live classes with state-of-the-art WebRTC technology. No lag, just learning."
                        />

                        <div className="space-y-6">
                            {[
                                "Native Japanese speakers with 5+ years experience.",
                                "Built-in interactive whiteboards & Kanji drills.",
                                "Recorded sessions available 30 minutes after class.",
                                "Maximum 15 students per interactive cohort."
                            ].map((text, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="size-6 rounded-full bg-[#B91C1C] flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform">
                                        <Check className="size-3.5 stroke-[3]" />
                                    </div>
                                    <span className="text-gray-900 font-semibold">{text}</span>
                                </motion.div>
                            ))}
                        </div>

                        <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold bg-[#B91C1C] hover:bg-[#991717] shadow-xl shadow-[#B91C1C]/20" asChild>
                            <Link href="/live-classes">View Class Schedule</Link>
                        </Button>
                    </div>

                    <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4 pt-12"
                        >
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800" alt="Live Class" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-6">
                                    <p className="text-white font-black text-lg">Daily Conversations</p>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Level: N4 - N3</p>
                                </div>
                                <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase animate-pulse">Live</div>
                            </div>
                            <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-[#B91C1C] flex flex-col items-center justify-center p-8 text-center text-white space-y-4">
                                <Users className="size-10" />
                                <p className="text-xl font-black">2.5k Members Online</p>
                                <p className="text-sm text-white/70">Join the discussion in real-time discord channels.</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: -40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-white flex flex-col items-center justify-center p-8 text-center space-y-4 border border-gray-100">
                                <Clock className="size-10 text-[#B91C1C]" />
                                <p className="text-xl font-black text-gray-900">Next Class: 15m</p>
                                <p className="text-sm text-gray-500">Business Etiquette with Tanaka-sensei</p>
                                <Button variant="outline" size="sm" className="rounded-full border-[#B91C1C] text-[#B91C1C] hover:bg-[#B91C1C] hover:text-white font-bold">Join Now</Button>
                            </div>
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" alt="Lecturer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#B91C1C]/80 to-transparent flex flex-col justify-end p-6">
                                    <p className="text-white font-black text-lg">JLPT N1 Masterclass</p>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Session by Head Teacher</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function RoadmapSection() {
    const levels = [
        { level: "N5", title: "Survival", desc: "Basic alphabets & common phrases.", color: "bg-gray-200" },
        { level: "N4", title: "Social", desc: "Fluent basic conversation & daily reading.", color: "bg-orange-100 text-orange-600" },
        { level: "N3", title: "Bridge", desc: "Workplace proficiency & news analysis.", color: "bg-blue-100 text-blue-600" },
        { level: "N2", title: "Expert", desc: "Professional fluency in all situations.", color: "bg-red-50 text-[#B91C1C]" },
        { level: "N1", title: "Native", desc: "Unrestricted mastery of the language.", color: "bg-gray-900 text-white" }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <SectionHeader
                    badge="Long-term Strategy"
                    title={<>Structured From <span className="text-gray-400">Day 1.</span></>}
                    subtitle="Our curriculum follows the official Japanese-Language Proficiency Test standards, reinforced by modern pedagogical science."
                />

                <div className="relative pt-12">
                    {/* Road line */}
                    <div className="absolute top-[4.5rem] left-0 right-0 h-1 bg-gray-100 -z-10 hidden lg:block" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                        {levels.map((l, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative group text-center lg:text-left"
                            >
                                <div className={`size-20 rounded-[2rem] flex items-center justify-center text-2xl font-black mb-8 mx-auto lg:mx-0 shadow-lg transition-transform group-hover:-translate-y-2 duration-300 ${l.color}`}>
                                    {l.level}
                                </div>
                                <h4 className="text-xl font-black text-gray-900 mb-2">{l.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">{l.desc}</p>
                                <div className="h-px w-0 group-hover:w-full bg-[#B91C1C] transition-all duration-500" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function Testimonials() {
    return (
        <section className="py-32 bg-[#FBFBFA]">
            <div className="container mx-auto px-6 max-w-7xl">
                <SectionHeader
                    badge="Student Stories"
                    title="Real Success in Real Companies."
                    subtitle="Join a community of high-achievers who transformed their careers with Torii Sensei."
                />

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Hoang Anh",
                            role: "Software Engineer at Rakuten",
                            content: "The AI Sensei was a game changer for my technical interview prep. It understood nuance in a way Duolingo never could.",
                            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HA"
                        },
                        {
                            name: "Minh Tu",
                            role: "Business Analyst in Tokyo",
                            content: "Live classes gave me the confidence to speak. The teachers are native and focus on real-world etiquette, not just book learning.",
                            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MT"
                        },
                        {
                            name: "Duc Huy",
                            role: "Full-stack Developer",
                            content: "Passed N2 in 8 months starting from N4. The roadmap is incredibly efficient if you stick to the AI-generated schedule.",
                            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DH"
                        }
                    ].map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
                        >
                            <GlassCard className="p-10 border-transparent hover:border-gray-200 transition-all space-y-8">
                                <div className="flex text-amber-400">
                                    {[1, 2, 3, 4, 5].map(j => <Star key={j} className="size-4 fill-current" />)}
                                </div>
                                <p className="text-gray-700 leading-relaxed font-medium italic">"{t.content}"</p>
                                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                    <img src={t.avatar} className="size-12 rounded-full bg-gray-100" />
                                    <div>
                                        <p className="font-black text-gray-900">{t.name}</p>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingSection() {
    const plans = [
        {
            name: "Beginner",
            price: "Free",
            desc: "Start your journey.",
            features: ["Full N5 VOD Course", "AI Sensei (Basic Chat)", "Weekly Newsletter", "Community Access"],
            cta: "Get Started",
            highlight: false
        },
        {
            name: "Professional",
            price: "$29",
            period: "/mo",
            desc: "For serious climbers.",
            features: ["N5 → N1 VOD Access", "Infinite AI Sensei Tutor", "4 Live Classes/month", "JLPT Mock Exams", "Career Support"],
            cta: "Subscribe Now",
            highlight: true
        },
        {
            name: "Immersive",
            price: "$99",
            period: "/mo",
            desc: "Zero to Native fast.",
            features: ["Everything in Pro", "Unlimited Live Classes", "1-on-1 Mentorship (1h/mo)", "Private Slack Group", "Job Referral Program"],
            cta: "Go Immersive",
            highlight: false
        }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <SectionHeader
                    badge="Investment"
                    title="Simple, Transparent Pricing."
                    subtitle="Choose the path that fits your goals. Upgrade or downgrade anytime."
                />

                <div className="grid md:grid-cols-3 gap-8 items-center">
                    {plans.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
                            className={`rounded-[2.5rem] p-10 transition-all duration-500 ${p.highlight
                                ? 'bg-gray-950 text-white shadow-2xl shadow-gray-400 scale-105 z-10'
                                : 'bg-[#FBFBFA] text-gray-900 border border-gray-100 hover:border-gray-300'
                                }`}
                        >
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <h4 className={`text-xl font-black ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.name}</h4>
                                    {p.highlight && <Badge className="bg-[#B91C1C] hover:bg-[#B91C1C] border-none font-bold uppercase text-[9px]">Most Popular</Badge>}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black">{p.price}</span>
                                    {p.period && <span className={`text-xl font-bold ${p.highlight ? 'text-white/40' : 'text-gray-400'}`}>{p.period}</span>}
                                </div>
                                <p className={`text-sm font-medium ${p.highlight ? 'text-white/60' : 'text-gray-500'}`}>{p.desc}</p>
                                <Button className={`w-full h-14 rounded-full font-black text-sm uppercase tracking-widest ${p.highlight
                                    ? 'bg-[#B91C1C] hover:bg-[#991717] text-white'
                                    : 'bg-white border-2 border-gray-200 text-gray-900 hover:bg-gray-50'
                                    }`}>
                                    {p.cta}
                                </Button>
                                <div className="pt-6 space-y-4">
                                    {p.features.map((f, j) => (
                                        <div key={j} className="flex items-center gap-3">
                                            <div className={`size-5 rounded-full flex items-center justify-center ${p.highlight ? 'bg-white/10' : 'bg-[#B91C1C]/10'}`}>
                                                <Check className={`size-3 ${p.highlight ? 'text-[#B91C1C]' : 'text-[#B91C1C]'}`} />
                                            </div>
                                            <span className={`text-sm font-semibold ${p.highlight ? 'text-white/80' : 'text-gray-600'}`}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQ() {
    const items = [
        { q: "How does the AI Sensei differ from ChatGPT?", a: "Unlike general-purpose AIs, our Neo-Sensei is trained specifically on JLPT materials, millions of student errors, and Japanese pedagogical patterns. It's essentially an expert tutor encoded as a model." },
        { q: "Can I switch between plans easily?", a: "Yes! You can upgrade to Immersive or downgrade to Pro at any time. Your billing will be adjusted prorated immediately." },
        { q: "Are the live classes recorded?", a: "Every single one. They are high-quality WebRTC streams that are archived and fully searchable by the topic discussed." },
        { q: "I'm a complete beginner. Where do I start?", a: "Start with our Japanese 101 VOD course for N5. It's free and designed to get you past the initial hump of Hiragana and Katakana in just 3 days." }
    ];

    return (
        <section className="py-32 bg-[#FBFBFA]">
            <div className="container mx-auto px-6 max-w-3xl">
                <SectionHeader
                    badge="Clarification"
                    title="Common Questions."
                    subtitle="Everything you need to know about the Torii Sensei ecosystem."
                />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Accordion type="single" collapsible className="space-y-4">
                        {items.map((item, i) => (
                            <AccordionItem key={i} value={`faq-${i}`} className="border-none">
                                <AccordionTrigger className="bg-white px-8 py-6 rounded-3xl border border-gray-100 hover:border-gray-200 font-black text-left decoration-transparent transition-all data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="bg-white px-8 pb-8 rounded-b-3xl border-x border-b border-gray-100 text-gray-600 leading-relaxed font-medium">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
}

function FinalCTA() {
    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="relative rounded-[4rem] bg-[#B91C1C] p-12 md:p-24 overflow-hidden shadow-[0_40px_100px_-20px_rgba(185,28,28,0.4)]">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 size-96 border-[40px] border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 size-80 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative z-10 text-center space-y-12 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1] tracking-tighter">
                            Ready to transform your <br />Japanese journey?
                        </h2>
                        <p className="text-white/80 text-xl md:text-2xl font-medium leading-relaxed">
                            Join 12,000+ students already mastering Japanese with AI. <br className="hidden md:block" />
                            No credit card required to start.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button size="lg" className="h-20 px-12 rounded-full text-xl font-black bg-white text-[#B91C1C] hover:bg-gray-50 shadow-2xl shadow-black/10 transition-all hover:scale-105 active:scale-95 group" asChild>
                                <Link href="/register">
                                    Create Free Account
                                    <ArrowRight className="ml-3 size-6 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button variant="ghost" className="h-20 px-12 rounded-full text-xl font-bold text-white hover:bg-white/10" asChild>
                                <Link href="/pricing">View All Plans</Link>
                            </Button>
                        </div>
                        <div className="flex flex-wrap justify-center items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
                            {['Unlimited Access', 'Native Senseis', 'Mobile Ready', 'Cancel Anytime'].map(t => (
                                <span key={t} className="flex items-center gap-2"><Check className="size-4 text-white" />{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Positioning Statement Helper
function PositioningSection() {
    return (
        <section className="py-32 bg-[#FBFBFA]">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] mb-8">
                            Why Torii Sensei is <br />
                            <span className="text-[#B91C1C] italic text-5xl md:text-6xl">Strategically Superior.</span>
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed font-medium mb-10">
                            Normal courses give you information. We give you an environment. Most platforms stop at video playback — we start there.
                        </p>

                        <div className="space-y-4">
                            {[
                                { t: "Adaptive Learning Engine", d: "Most courses are 'one-size-fits-all'. Torii adapts to your specific memory gaps." },
                                { t: "Native Immersion Protocol", d: "We focus on conversation from Day 1, not just grammar sheets." },
                                { t: "JLPT Certification Focused", d: "Every lesson is scientifically mapped to official exam outcomes." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                                    <h4 className="font-black text-gray-900 text-lg flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-[#B91C1C]" /> {item.t}
                                    </h4>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, rotate: -3 }}
                        whileInView={{ opacity: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="aspect-square bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center space-y-8">
                            <div className="size-32 bg-[#B91C1C]/5 rounded-full flex items-center justify-center animate-pulse">
                                <Award className="size-16 text-[#B91C1C]" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-gray-900">98.4% Success Rate</h3>
                                <p className="text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">Of our students pass their target JLPT exam on the first attempt after completing our roadmap.</p>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                    <div key={i} className="w-1.5 h-8 bg-[#B91C1C]/10 rounded-full overflow-hidden flex flex-col justify-end">
                                        <motion.div
                                            animate={{ height: ['40%', '90%', '40%'] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                            className="bg-[#B91C1C] w-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Circle ornament */}
                        <div className="absolute -z-10 -bottom-10 -right-10 size-64 border-[40px] border-[#B91C1C]/5 rounded-full" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export function Home1Client() {
    return (
        <div className="min-h-screen bg-[#FBFBFA] selection:bg-primary/10 selection:text-primary pt-10">
            <main>
                <HeroSection />
                <SocialProof />
                <PositioningSection />
                <FeaturesSection />
                <AISenseiSection />
                <LiveClassSection />
                <RoadmapSection />
                <Testimonials />
                <PricingSection />
                <FAQ />
                <FinalCTA />
            </main>
        </div>
    );
}
