'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
    Calendar, Clock, Users, ArrowRight, CheckCircle2, Sparkles, Youtube, ShieldCheck, Zap,
    ChevronRight, ArrowLeft, Star, PlayCircle, BookOpen, GraduationCap
} from 'lucide-react'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { cn } from '@workspace/ui/lib/utils'
import { toast } from '@workspace/ui/components/sonner'

export default function LiveClassDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const [isLoading, setIsLoading] = useState(false)
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)

    // Mock Data (In real app, fetch based on slug)
    const course = {
        id: 1,
        title: "JLPT N4 Intensive Bootcamp",
        code: "N4-BATCH-24",
        slug: "jlpt-n4-bootcamp",
        description: "A comprehensive 3-month cohort designed to take you from N5 basic proficiency to N4 mastery. This course focuses heavily on conversation practice (Kaiwa) and grammar drills to ensure you can not only pass the exam but speak confidently.",
        level: "N4",
        startDate: "Nov 15, 2024",
        duration: "12 Weeks",
        schedule: "Mon & Wed, 19:30 - 21:00 (JST)",
        totalHours: 36,
        maxStudents: 15,
        enrolled: 8,
        instructor: {
            name: "Yuki Tanaka",
            avatar: "",
            role: "Senior Linguist",
            bio: "Yuki Sensei has over 10 years of experience teaching Japanese to international students. She specializes in JLPT preparation and business Japanese."
        },
        price: "¥45,000",
        features: [
            "Live pronunciation checks in every session",
            "24/7 Discord Community access",
            "Unlimited Replays of all live sessions",
            "Weekly graded assignments & feedback",
            "1-on-1 Monthly Progress Review",
            "Mock JLPT Exams included"
        ],
        curriculum: [
            { week: 1, topic: "N4 Grammar Foundations & Particles" },
            { week: 2, topic: "Essential Verbs & Conjugations" },
            { week: 3, topic: "Daily Life Conversations (Kaiwa)" },
            { week: 4, topic: "Listening Comprehension Strategies" },
            { week: 5, topic: "Kanji Intensive (100 new characters)" },
            { week: 6, topic: "Mid-term Review & Feedback" },
        ],
        status: "filling_fast",
        rating: 4.8,
        reviewsCount: 124
    }

    const handleConfirmRegistration = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setIsRegisterOpen(false)

        // Simulate API
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Enrollment Successful!", {
                description: `Welcome to the ${course.title} cohort! Check your email for next steps.`,
                className: "border-emerald-500/20 bg-background/90 backdrop-blur-xl",
                duration: 5000
            })
        }, 1500)
    }

    if (isLoading) {
        return <PageLoading text="Processing Enrollment..." className="h-screen" />
    }

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-700">
            {/* Nav / Header */}
            <header className="fixed top-0 inset-x-0 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center px-4 md:px-8">
                <div className="container mx-auto max-w-7xl flex items-center justify-between">
                    <Link href="/live-classes" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Cohorts</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                            {course.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-20">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-3 gap-12">

                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Course Header */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-0">
                                            {course.level}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-bold">{course.rating}</span>
                                            <span className="text-xs text-muted-foreground ml-1">({course.reviewsCount} reviews)</span>
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground">
                                        {course.title}
                                    </h1>
                                    <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl">
                                        {course.description}
                                    </p>
                                </div>

                                {/* Instructor Small Bio */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/5 border border-white/5 max-w-xl">
                                    <Avatar className="w-12 h-12 border border-white/10">
                                        <AvatarImage src={course.instructor.avatar} />
                                        <AvatarFallback className="bg-primary/20 text-primary font-black">
                                            {course.instructor.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{course.instructor.name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{course.instructor.role}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" /> Key Features
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {course.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Curriculum Preview */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" /> Curriculum Snapshot
                                </h3>
                                <div className="space-y-3">
                                    {course.curriculum.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-white/5 hover:border-primary/20 transition-colors">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-black text-sm">
                                                W{item.week}
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{item.topic}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sticky Sidebar / Enrollment Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="p-6 rounded-[2rem] border border-white/5 bg-background/40 backdrop-blur-xl shadow-2xl space-y-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Tuition</span>
                                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 text-[9px] font-black uppercase">
                                                Flexible Payment
                                            </Badge>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-foreground">{course.price}</span>
                                            <span className="text-sm font-medium text-muted-foreground">/ course</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Button
                                            onClick={() => setIsRegisterOpen(true)}
                                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform bg-primary text-primary-foreground"
                                        >
                                            Secure Your Seat <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                        <p className="text-center text-[10px] text-muted-foreground font-medium">
                                            30-Day Money-Back Guarantee • Certificate Included
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" /> Start Date
                                            </div>
                                            <span className="font-bold text-foreground">{course.startDate}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-4 h-4" /> Schedule
                                            </div>
                                            <span className="font-bold text-foreground text-right max-w-[150px]">{course.schedule}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="w-4 h-4" /> Class Size
                                            </div>
                                            <span className="font-bold text-foreground">Max {course.maxStudents}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <GraduationCap className="w-4 h-4" /> Duration
                                            </div>
                                            <span className="font-bold text-foreground">{course.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Registration Dialog (Reused for consistency) */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-8 pb-4 bg-muted/5 border-b border-white/5">
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                            Fast Track Enrollment
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            You are applying for {course.code}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-8">
                        {/* Course Summary Check */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-white/5">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-sm">{course.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">Starts {course.startDate}</p>
                            </div>
                        </div>

                        <form id="enroll-form" onSubmit={handleConfirmRegistration} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fname" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">First Name</Label>
                                    <Input id="fname" required className="bg-muted/10 border-white/5 h-12 rounded-xl focus:bg-background transition-colors" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lname" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Name</Label>
                                    <Input id="lname" required className="bg-muted/10 border-white/5 h-12 rounded-xl focus:bg-background transition-colors" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                                <Input id="email" type="email" required className="bg-muted/10 border-white/5 h-12 rounded-xl focus:bg-background transition-colors" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                                <Input id="phone" type="tel" className="bg-muted/10 border-white/5 h-12 rounded-xl focus:bg-background transition-colors" placeholder="+81 ..." />
                            </div>
                        </form>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/5 text-xs text-muted-foreground leading-relaxed">
                            <ShieldCheck className="w-5 h-5 text-muted-foreground/60 shrink-0" />
                            <p>By proceeding, you agree to the enrollment terms. Payment details will be collected in the next step via our secure gateway.</p>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-4 bg-muted/5 border-t border-white/5">
                        <Button variant="ghost" onClick={() => setIsRegisterOpen(false)} className="rounded-xl font-bold uppercase tracking-wider text-xs">Cancel</Button>
                        <Button type="submit" form="enroll-form" className="rounded-xl font-black uppercase tracking-widest text-xs h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                            Continue to Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
