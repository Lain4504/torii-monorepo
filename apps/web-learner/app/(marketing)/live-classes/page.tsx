'use client'

import { useState } from 'react'
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
// removed Table imports as they are no longer used

// Type definition for a Live Course Cohort
interface LiveCourse {
    id: number
    title: string
    code: string
    description: string
    level: string
    startDate: string
    duration: string
    schedule: string
    instructor: {
        name: string
        avatar: string
        role: string
    }
    price: string
    features: string[]
    status: 'open' | 'filling_fast' | 'waitlist' | 'closed'
    curriculum_highlight: string
}

export default function LiveClassesPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<LiveCourse | null>(null)
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)

    // Mock Data representing "Cohorts" or "Term Courses"
    const liveCourses: LiveCourse[] = [
        {
            id: 1,
            title: "JLPT N4 Intensive Bootcamp",
            code: "N4-BATCH-24",
            description: "A comprehensive 3-month cohort designed to take you from N5 basic proficiency to N4 mastery. Focuses on heavy conversation practice and grammar drills.",
            level: "N4",
            startDate: "Nov 15, 2024",
            duration: "12 Weeks",
            schedule: "Mon & Wed, 19:30 - 21:00 (JST)",
            instructor: {
                name: "Yuki Tanaka",
                avatar: "",
                role: "Senior Linguist"
            },
            price: "¥45,000",
            features: ["Live pronunciation checks", "24/7 Discord Community", "Unlimited Replays"],
            status: "filling_fast",
            curriculum_highlight: "Mastering Keigo Basics"
        },
        {
            id: 2,
            title: "Zero to Hero: N5 Starter",
            code: "N5-BATCH-08",
            description: "The perfect starting point. Learn Hiragana, Katakana, and essential survival Japanese in a supportive live group environment.",
            level: "N5",
            startDate: "Dec 01, 2024",
            duration: "8 Weeks",
            schedule: "Sat & Sun, 10:00 - 11:30 (JST)",
            instructor: {
                name: " Sarah Jenkins",
                avatar: "",
                role: "Bilingual Expert"
            },
            price: "¥35,000",
            features: ["Cultural Workshops", "Kanji PDF Workbooks", "1-on-1 Feedback"],
            status: "open",
            curriculum_highlight: "Daily Life Conversations"
        },
        {
            id: 3,
            title: "Business Japanese N2 Masterclass",
            code: "BIZ-N2-03",
            description: "Advanced business etiquette, email writing, and boardroom negotiation tactics for professionals working with Japanese clients.",
            level: "N2",
            startDate: "Jan 10, 2025",
            duration: "10 Weeks",
            schedule: "Tue & Thu, 20:00 - 21:30 (JST)",
            instructor: {
                name: "Kenji Sato",
                avatar: "",
                role: "Corporate Trainer"
            },
            price: "¥60,000",
            features: ["Resume Review", "Mock Interviews", "Networking Events"],
            status: "waitlist",
            curriculum_highlight: "Negotiation Tactics"
        }
    ]

    const handleConfirmRegistration = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setIsRegisterOpen(false)

        // Simulate API
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Application Received!", {
                description: `We have received your enrollment request for ${selectedCourse?.title}. A confirmation email has been sent.`,
                className: "border-emerald-500/20 bg-background/90 backdrop-blur-xl",
                duration: 5000
            })
            setSelectedCourse(null)
        }, 1500)
    }

    if (isLoading) {
        return <PageLoading text="Processing Enrollment..." className="h-screen" />
    }

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50" />
                <div className="container relative z-10 px-4 mx-auto max-w-7xl">
                    <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Learning Cohorts</span>
                        </div>

                        <h1 className="max-w-4xl text-5xl md:text-7xl/none font-black uppercase italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
                            Master Japanese in <br />
                            <span className="text-primary">Real-Time</span>
                        </h1>

                        <p className="max-w-2xl text-lg text-muted-foreground font-medium leading-relaxed">
                            Join elite cohorts led by expert linguists. Structured curriculum, live interaction, and a community of dedicated learners driven by results.
                        </p>
                    </div>
                </div>
            </section>

            {/* Courses Schedule Table */}
            <section className="py-20 lg:py-24">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="rounded-[2.5rem] border border-white/5 bg-background/40 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
                        <div className="grid grid-cols-1 gap-4">
                            {liveCourses.map((course) => (
                                <Link
                                    href={`/live-classes/${course.id === 1 ? 'jlpt-n4-bootcamp' : 'other-course'}`}
                                    key={course.id}
                                    className="group block"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-white/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">

                                        {/* Status Accent Line */}
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1 lg:w-1.5",
                                            course.status === 'filling_fast' ? "bg-amber-500" :
                                                course.status === 'open' ? "bg-primary" : "bg-muted"
                                        )} />

                                        {/* 1. Level & Basic Info */}
                                        <div className="flex-1 min-w-0 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={cn(
                                                    "rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-widest border-0",
                                                    course.level === 'N5' ? "bg-blue-500/10 text-blue-500" :
                                                        course.level === 'N4' ? "bg-emerald-500/10 text-emerald-500" :
                                                            course.level === 'N2' ? "bg-purple-500/10 text-purple-500" : "bg-muted/10"
                                                )}>
                                                    {course.level}
                                                </Badge>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{course.code}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate pr-4">{course.title}</h3>
                                                <p className="text-sm font-medium text-muted-foreground mt-1 line-clamp-2 lg:line-clamp-1">{course.description}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6 border border-white/10">
                                                    <AvatarImage src={course.instructor.avatar} />
                                                    <AvatarFallback className="bg-primary/20 text-primary font-black text-[10px]">
                                                        {course.instructor.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-bold text-muted-foreground">{course.instructor.name}</span>
                                            </div>
                                        </div>

                                        {/* 2. Key Specs (Grid on mobile, Flex on desktop) */}
                                        <div className="grid grid-cols-2 lg:flex lg:items-center gap-y-4 gap-x-8 lg:shrink-0 lg:min-w-fit pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                                    <Calendar className="w-3.5 h-3.5 text-primary" /> Start Date
                                                </div>
                                                <p className="text-xs font-bold text-foreground">{course.startDate}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                                    <Clock className="w-3.5 h-3.5 text-primary" /> Schedule
                                                </div>
                                                <p className="text-xs font-bold text-foreground">{course.schedule}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                                    <GraduationCap className="w-3.5 h-3.5 text-primary" /> Duration
                                                </div>
                                                <p className="text-xs font-bold text-foreground">{course.duration}</p>
                                            </div>
                                        </div>

                                        {/* 3. Price & Action */}
                                        <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5 lg:w-[220px] lg:shrink-0">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Tuition</p>
                                                <p className="text-lg font-black text-foreground">{course.price}</p>
                                            </div>

                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground",
                                                course.status === 'closed' && "opacity-50"
                                            )}>
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration Dialog */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-8 pb-4 bg-muted/5 border-b border-white/5">
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                            Fast Track Enrollment
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            You are applying for {selectedCourse?.code}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-8">
                        {/* Course Summary Check */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-white/5">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-sm">{selectedCourse?.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">Starts {selectedCourse?.startDate} • {selectedCourse?.schedule}</p>
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
