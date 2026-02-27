import { CheckCircle, ChevronRight, Home, Star, PlayCircle, FileQuestion, BrainCircuit, Signal, Clock, BookOpen, Award, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CourseDetailPageProps {
    params: Promise<{ slug: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
    const { slug } = await params

    // Static placeholder data matching HTML template
    const courseData = {
        title: "ビジネス日本語の極意",
        titleEn: "Advanced Business Japanese",
        slug: slug,
        level: "Advanced",
        description: "Master the nuances of professional Japanese communication. This course is designed for non-native speakers who aim to excel in Japanese corporate environments by mastering complex Keigo (honorifics), meeting etiquette, and formal document preparation.",
        thumbnailUrl: "/placeholder-business-japan.jpg",
        instructor: {
            name: "Kenji Sato",
            nameJp: "佐藤 健二",
            role: "Corporate Trainer & Linguist",
            avatar: "/placeholder-instructor.jpg",
            bio: "Kenji has over 15 years of experience training executives from Fortune 500 companies in Tokyo. He specializes in bridging cultural gaps through language and has authored three books on Japanese corporate culture."
        },
        rating: 4.8,
        reviewCount: 850,
        price: 12800,
        originalPrice: 18500,
        discount: 30,
        currency: "¥",
        includes: {
            difficulty: "N2 Level",
            duration: "15 hours total",
            lessons: "42 Lessons",
            certificate: true
        },
        learningOutcomes: [
            {
                jp: "状況に応じた適切な敬語（尊敬・謙譲・丁寧）の使い分け",
                en: "Master appropriate Keigo usage for different business scenarios."
            },
            {
                jp: "日本独自の商習慣とビジネスマナーの理解",
                en: "Understand Japanese business customs and corporate etiquette."
            },
            {
                jp: "効果的なプレゼンテーションと会議での発言術",
                en: "Effective presentation and speaking skills for meetings."
            },
            {
                jp: "ビジネスメールと報告書の正確な書き方",
                en: "Precise writing for business emails and internal reports."
            }
        ],
        requirements: [
            "JLPT N3レベル相当以上の日本語能力 (JLPT N3 level or equivalent)",
            "基本的な文法と漢字の知識 (Knowledge of basic grammar and Kanji)",
            "ビジネスの場でのキャリアアップを目指す意欲 (Ambition to grow in a corporate environment)"
        ],
        curriculum: [
            {
                id: "module-1",
                title: "Module 1: 敬語の基本と高度な応用 (Introduction to Keigo)",
                lessons: [
                    { title: "1.1 尊敬語・謙譲語の再確認", type: "video", duration: "12:45" },
                    { title: "1.2 敬語クイズ：基礎編", type: "quiz", duration: "5 questions" },
                    { title: "1.3 AI先生とロールプレイ：初対面の挨拶", type: "ai", duration: "LIVE AI" }
                ]
            },
            {
                id: "module-2",
                title: "Module 2: 電話対応とアポイントメント (Phone Calls & Appointments)",
                lessons: []
            },
            {
                id: "module-3",
                title: "Module 3: 訪問と接待の日本語 (Visiting Clients & Hospitality)",
                lessons: []
            }
        ],
        reviews: [
            {
                id: "1",
                user: { name: "Elena Markova", initials: "EM" },
                rating: 5,
                comment: "The AI practice sessions are a game changer. I used to be terrified of picking up the phone at work, but the simulated drills gave me the confidence I needed.",
                date: "2 weeks ago"
            },
            {
                id: "2",
                user: { name: "James Lee", initials: "JL" },
                rating: 4,
                comment: "Very comprehensive. Sato-sensei explains not just what to say, but WHY we say it, which helps with memorization. Excellent production quality.",
                date: "1 month ago"
            }
        ],
        relatedCourses: [
            {
                id: "1",
                title: "JLPT N2 読解完全マスター",
                level: "Intermediate",
                thumbnail: "/placeholder-course-1.jpg",
                rating: 4.9,
                price: 9800
            },
            {
                id: "2",
                title: "ゼロから始める日本語会話",
                level: "Beginner",
                thumbnail: "/placeholder-course-2.jpg",
                rating: 4.7,
                price: 5400
            }
        ]
    }

    return (
        <main className="container mx-auto px-4 lg:px-10 py-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link href="/" className="hover:text-primary flex items-center gap-1">
                    <Home className="size-4" />
                    Trang chủ
                </Link>
                <ChevronRight className="size-4" />
                <Link href="/courses" className="hover:text-primary">
                    Khóa học
                </Link>
                <ChevronRight className="size-4" />
                <span className="text-slate-900 dark:text-slate-100 font-medium">{courseData.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Hero Section */}
                    <section className="space-y-6">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-2xl">
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-xs font-bold w-fit mb-4 uppercase tracking-wider">
                                    {courseData.level}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                                    {courseData.title}
                                    <br />
                                    <span className="text-2xl font-semibold opacity-90">{courseData.titleEn}</span>
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full ring-2 ring-primary/20 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xl font-bold">
                                    KS
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Instructor</p>
                                    <p className="font-semibold">{courseData.instructor.name} ({courseData.instructor.nameJp})</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="size-5 fill-current" />
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{courseData.rating}</span>
                                    <span className="text-slate-400 font-normal ml-1">({courseData.reviewCount} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                            {courseData.description}
                        </p>
                    </section>

                    {/* What You'll Learn */}
                    <section className="bg-white dark:bg-slate-900/50 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle className="text-primary" />
                            学習内容 (What You'll Learn)
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {courseData.learningOutcomes.map((outcome, index) => (
                                <div key={index} className="flex gap-3">
                                    <CheckCircle className="text-primary text-sm mt-1 shrink-0" />
                                    <p className="text-sm">
                                        {outcome.jp}
                                        <br />
                                        <span className="text-slate-500">{outcome.en}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Curriculum */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold mb-6">カリキュラム (Curriculum)</h3>
                        <div className="space-y-3">
                            {courseData.curriculum.map((module) => (
                                <div key={module.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/30">
                                    <button className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <span className="font-bold">{module.title}</span>
                                        <ChevronDown className="size-5" />
                                    </button>
                                    {module.lessons.length > 0 && (
                                        <div className="px-4 pb-4 space-y-3">
                                            {module.lessons.map((lesson, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                                                        lesson.type === 'ai'
                                                            ? 'bg-primary/5 border border-primary/20'
                                                            : 'bg-slate-50 dark:bg-slate-800/80'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {lesson.type === 'video' && <PlayCircle className="text-blue-500 size-5" />}
                                                        {lesson.type === 'quiz' && <FileQuestion className="text-green-500 size-5" />}
                                                        {lesson.type === 'ai' && <BrainCircuit className="text-primary size-5" />}
                                                        <span className={lesson.type === 'ai' ? 'font-medium' : ''}>{lesson.title}</span>
                                                    </div>
                                                    {lesson.type === 'ai' ? (
                                                        <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                            {lesson.duration}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">{lesson.duration}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Requirements */}
                    <section>
                        <h3 className="text-xl font-bold mb-4">受講条件 (Requirements)</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                            {courseData.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                    </section>

                    {/* Instructor Profile */}
                    <section className="bg-slate-100 dark:bg-slate-800/40 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
                        <div className="size-32 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg flex items-center justify-center text-4xl font-bold">
                            {courseData.instructor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold">{courseData.instructor.nameJp} ({courseData.instructor.name})</h3>
                                <p className="text-primary font-medium">{courseData.instructor.role}</p>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                {courseData.instructor.bio}
                            </p>
                            <div className="flex gap-4">
                                <button className="text-sm font-bold text-primary hover:underline">Other Courses</button>
                                <button className="text-sm font-bold text-primary hover:underline">Full Bio</button>
                            </div>
                        </div>
                    </section>

                    {/* Reviews */}
                    <section className="space-y-6">
                        <h3 className="text-xl font-bold">受講生の声 (Student Reviews)</h3>
                        <div className="grid gap-4">
                            {courseData.reviews.map((review) => (
                                <div key={review.id} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                {review.user.initials}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{review.user.name}</p>
                                                <p className="text-xs text-slate-400">{review.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-500 text-sm">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`size-4 ${i < review.rating ? 'fill-current' : ''}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-8">
                    <div className="sticky top-24 space-y-6">
                        {/* Enrollment Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                    {courseData.currency}{courseData.price.toLocaleString()}
                                </p>
                                <p className="text-sm text-slate-500 line-through">
                                    {courseData.currency}{courseData.originalPrice.toLocaleString()} ({courseData.discount}% OFF)
                                </p>
                            </div>
                            <div className="space-y-3">
                                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20">
                                    受講開始 (Enroll Now)
                                </button>
                                <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold py-4 rounded-xl transition-all">
                                    お気に入りに追加
                                </button>
                            </div>
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <p className="font-bold text-sm">コース内容 (Includes):</p>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Signal className="text-primary size-5" />
                                        <span className="font-medium text-slate-600 dark:text-slate-400">
                                            Difficulty: <span className="text-slate-900 dark:text-slate-100">{courseData.includes.difficulty}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="text-primary size-5" />
                                        <span className="font-medium text-slate-600 dark:text-slate-400">
                                            Duration: <span className="text-slate-900 dark:text-slate-100">{courseData.includes.duration}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <BookOpen className="text-primary size-5" />
                                        <span className="font-medium text-slate-600 dark:text-slate-400">
                                            Lessons: <span className="text-slate-900 dark:text-slate-100">{courseData.includes.lessons}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Award className="text-primary size-5" />
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Certificate of Completion</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Courses */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg">おすすめの関連コース</h4>
                            <div className="space-y-4">
                                {courseData.relatedCourses.map((course) => (
                                    <div key={course.id} className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all cursor-pointer">
                                        <div className="aspect-video relative overflow-hidden">
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <p className="text-xs font-bold text-primary uppercase">{course.level}</p>
                                            <p className="font-bold text-sm line-clamp-1">{course.title}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                    <Star className="size-3 fill-current" />
                                                    <span className="text-slate-900 dark:text-slate-100">{course.rating}</span>
                                                </div>
                                                <p className="font-bold text-sm">{courseData.currency}{course.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
