import { User, BookOpen, Quote, Star, ShieldCheck, MapPin, Calendar, Timer, CheckCircle, Mail, MessageCircle, Share2, Globe, AtSign } from "lucide-react"
import Link from "next/link"

interface LecturerPageProps {
    params: Promise<{ id: string }>
}

export default async function LecturerProfilePage({ params }: LecturerPageProps) {
    const { id } = await params

    // Static placeholder data matching HTML template
    const instructor = {
        id: id,
        name: "Kenji Sato",
        nameJp: "佐藤 健二",
        title: "Business Japanese Expert & N1 Instructor",
        location: "Tokyo, Japan",
        experience: "10+ Years Experience",
        avatar: "/placeholder-instructor.jpg",
        verified: true,
        rating: 4.9,
        reviewCount: 128,
        ratingDistribution: [
            { stars: 5, percentage: 90 },
            { stars: 4, percentage: 7 },
            { stars: 3, percentage: 3 }
        ],
        bio: {
            intro: "With over a decade of experience teaching at Tokyo's premier language institutions, I specialize in bridging the gap between textbook Japanese and the professional world. My philosophy centers on \"Pragmatic Fluency\"—understanding not just the words, but the cultural nuance and Keigo (honorifics) required for high-level business.",
            detail: "Whether you're preparing for the JLPT N1 or navigating corporate Japan, my lessons are tailored to provide immediate practical value while building a rock-solid grammatical foundation."
        },
        qualifications: [
            {
                title: "JLPT N1 Certified",
                subtitle: "Perfect Score in Grammar"
            },
            {
                title: "Advanced Business Japanese Certification",
                subtitle: "BJT J1+ Level"
            },
            {
                title: "Waseda University Graduate",
                subtitle: "B.A. in Japanese Literature"
            }
        ],
        courses: [
            {
                id: "1",
                title: "Business Japanese Mastery",
                description: "Master Keigo, email etiquette, and presentation skills for the Japanese corporate environment.",
                level: "ADVANCED",
                price: 499,
                duration: "12 Weeks",
                thumbnail: "/placeholder-business-course.jpg"
            },
            {
                id: "2",
                title: "JLPT N1 Intensive Strategy",
                description: "A comprehensive deep dive into N1 grammar, kanji, and listening comprehension techniques.",
                level: "JLPT",
                price: 350,
                duration: "8 Weeks",
                thumbnail: "/placeholder-jlpt-course.jpg"
            }
        ],
        testimonials: [
            {
                id: "1",
                quote: "Kenji-sensei's approach to Keigo was a game changer for my career at a Japanese multinational. Highly recommended!",
                author: "Sarah Jenkins",
                role: "Project Manager"
            },
            {
                id: "2",
                quote: "I finally passed the N1 after failing three times. The strategy-focused lessons were exactly what I needed.",
                author: "David Chen",
                role: "Software Engineer"
            }
        ],
        nextAvailability: {
            day: "Monday, Oct 24th",
            time: "9:00 AM JST"
        }
    }

    return (
        <main className="max-w-7xl mx-auto px-6 py-12">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center mb-16">
                <div className="relative mb-6">
                    <div className="w-40 h-40 rounded-full border-4 border-primary/20 p-1 bg-gradient-to-br from-primary/20 to-primary/5">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-5xl font-bold">
                            {instructor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                    </div>
                    {instructor.verified && (
                        <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-lg border border-primary/20">
                            <ShieldCheck className="text-primary size-6 fill-current" />
                        </div>
                    )}
                </div>

                <h1 className="text-4xl font-extrabold mb-2 text-slate-900 dark:text-white">
                    {instructor.name} / {instructor.nameJp}
                </h1>
                <p className="text-xl font-medium text-primary mb-2">{instructor.title}</p>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-6">
                    <MapPin className="size-4" /> {instructor.location} • {instructor.experience}
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:bg-primary/90 transition-all">
                        <Calendar className="size-5" />
                        Book a Lesson
                    </button>
                    <button className="flex items-center gap-2 bg-primary/10 text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary/20 transition-all">
                        <Mail className="size-5" />
                        Message Kenji
                    </button>
                </div>

                {/* Social/Contact Icons */}
                <div className="flex items-center gap-4">
                    <a className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border border-transparent hover:border-primary/30" href="#">
                        <Share2 className="size-5" />
                    </a>
                    <a className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border border-transparent hover:border-primary/30" href="#">
                        <Globe className="size-5" />
                    </a>
                    <a className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border border-transparent hover:border-primary/30" href="#">
                        <AtSign className="size-5" />
                    </a>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-12">
                    {/* About Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <User className="text-primary" /> About Me
                        </h2>
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <p className="leading-relaxed">{instructor.bio.intro}</p>
                            <p className="leading-relaxed">{instructor.bio.detail}</p>
                        </div>
                    </section>

                    {/* Courses Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <BookOpen className="text-primary" /> Featured Courses
                            </h2>
                            <Link href={`/lecturers/${instructor.id}/courses`} className="text-primary font-semibold text-sm hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {instructor.courses.map((course) => (
                                <div key={course.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-4 border-b-primary">
                                    <div className="aspect-video relative overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded uppercase">
                                            {course.level}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                                            {course.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-lg font-bold text-primary">${course.price}</span>
                                            <div className="flex items-center text-xs font-medium text-slate-500 gap-1">
                                                <Timer className="size-4" /> {course.duration}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Quote className="text-primary" /> Student Testimonials
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {instructor.testimonials.map((testimonial) => (
                                <div key={testimonial.id} className="p-6 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10">
                                    <p className="italic mb-4 text-slate-700 dark:text-slate-300">
                                        "{testimonial.quote}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                            <User className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{testimonial.author}</p>
                                            <p className="text-xs text-slate-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Stats / Rating Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
                        <div className="text-center mb-6">
                            <p className="text-5xl font-black text-slate-900 dark:text-white">{instructor.rating}</p>
                            <div className="flex justify-center gap-1 my-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`size-5 ${
                                            i < Math.floor(instructor.rating)
                                                ? 'text-primary fill-primary'
                                                : i < instructor.rating
                                                ? 'text-primary fill-primary/50'
                                                : 'text-slate-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Overall Rating</p>
                            <p className="text-xs text-slate-400 mt-1">Based on {instructor.reviewCount} Reviews</p>
                        </div>
                        <div className="space-y-3">
                            {instructor.ratingDistribution.map((dist) => (
                                <div key={dist.stars} className="flex items-center gap-2">
                                    <span className="text-xs font-bold w-4">{dist.stars}</span>
                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full" style={{ width: `${dist.percentage}%` }}></div>
                                    </div>
                                    <span className="text-xs text-slate-500 w-8">{dist.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Qualifications Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="text-primary" /> Qualifications
                        </h3>
                        <ul className="space-y-4">
                            {instructor.qualifications.map((qual, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-0.5 size-5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">{qual.title}</p>
                                        <p className="text-xs text-slate-500">{qual.subtitle}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Availability Snapshot */}
                    <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl">
                        <h3 className="font-bold text-primary mb-2">Next Availability</h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                            {instructor.nextAvailability.day} at {instructor.nextAvailability.time}
                        </p>
                        <button className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                            Check Calendar
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}
