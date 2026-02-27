import { MessageCircle, BookOpen, Pencil, CheckCircle, Briefcase, User, Star, ChevronLeft, ChevronRight, Bot } from "lucide-react"
import Link from "next/link"

export default function CourseCatalogPage() {
    // Static placeholder data matching HTML template
    const courses = [
        {
            id: "1",
            title: "日常会話マスター",
            titleEn: "Daily Conversation Master",
            level: "N5",
            category: "Conversation",
            description: "Learn practical Japanese for your next trip or daily interactions. Focus on speaking and listening.",
            instructor: "Yuki Tanaka",
            rating: 4.9,
            reviewCount: 1200,
            price: 4500,
            thumbnail: "/placeholder-temple.jpg"
        },
        {
            id: "2",
            title: "ビジネス日本語の極意",
            titleEn: "Advanced Business Japanese",
            level: "N2",
            category: "Business",
            description: "Master Keigo and corporate etiquette. Designed for professionals working in Japanese environments.",
            instructor: "Kenji Sato",
            rating: 4.8,
            reviewCount: 850,
            price: 12800,
            thumbnail: "/placeholder-business.jpg"
        },
        {
            id: "3",
            title: "漢字 500 マスタリー",
            titleEn: "Kanji 500 Mastery Course",
            level: "N3",
            category: "Kanji",
            description: "A systematic approach to learning 500 essential N3 Kanji through mnemonic techniques and visual arts.",
            instructor: "Ami Suzuki",
            rating: 5.0,
            reviewCount: 340,
            price: 6200,
            thumbnail: "/placeholder-kanji.jpg"
        },
        {
            id: "4",
            title: "文法基礎トレーニング",
            titleEn: "Grammar Foundation Training",
            level: "N4",
            category: "Grammar",
            description: "Build a solid foundation. Perfect for students preparing for N4/N5 certification exams.",
            instructor: "Hiroko Ito",
            rating: 4.7,
            reviewCount: 560,
            isFree: true,
            thumbnail: "/placeholder-fuji.jpg"
        },
        {
            id: "5",
            title: "AI 講師と学ぶ日本語",
            titleEn: "Learn Japanese with AI Sensei",
            level: "N3",
            category: "AI Sensei",
            description: "Personalized adaptive learning path powered by GPT-4. Practice 24/7 with an AI tutor.",
            instructor: "AI Assistant",
            rating: 4.9,
            reviewCount: 2100,
            price: 3000,
            isMonthly: true,
            thumbnail: "/placeholder-library.jpg"
        },
        {
            id: "6",
            title: "N1 合格への最終関門",
            titleEn: "N1 Certification Final Step",
            level: "N1",
            category: "JLPT Prep",
            description: "Intensive exam preparation for the highest level of Japanese proficiency. Includes 5 mock exams.",
            instructor: "Dr. Yamamoto",
            rating: 4.6,
            reviewCount: 120,
            price: 18000,
            thumbnail: "/placeholder-shibuya.jpg"
        }
    ]

    const topics = [
        { name: "Conversation", icon: MessageCircle, count: 12, active: true },
        { name: "Grammar", icon: BookOpen, count: 24, active: false },
        { name: "Kanji", icon: Pencil, count: 18, active: false },
        { name: "JLPT Prep", icon: CheckCircle, count: 8, active: false },
        { name: "Business", icon: Briefcase, count: 5, active: false }
    ]

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filtering */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Search Mobile */}
                    <div className="sm:hidden mb-6">
                        <input
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                            placeholder="Search courses..."
                            type="text"
                        />
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Difficulty</h3>
                        <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                            {[
                                { label: "N1 (Advanced)", value: "N1" },
                                { label: "N2", value: "N2" },
                                { label: "N3 (Intermediate)", value: "N3", checked: true },
                                { label: "N4", value: "N4" },
                                { label: "N5 (Beginner)", value: "N5" }
                            ].map((level) => (
                                <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                        type="checkbox"
                                        defaultChecked={level.checked}
                                    />
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{level.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Topic Filter */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Topic</h3>
                        <div className="space-y-2">
                            {topics.map((topic) => {
                                const Icon = topic.icon
                                return (
                                    <button
                                        key={topic.name}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            topic.active
                                                ? 'bg-primary/10 text-primary'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon className="size-4" />
                                            {topic.name}
                                        </span>
                                        <span className={`text-xs ${topic.active ? '' : 'text-slate-400'}`}>{topic.count}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Price</h3>
                        <div className="space-y-2">
                            {["All Courses", "Free", "Paid"].map((option) => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer">
                                    <input className="text-primary focus:ring-primary" name="price" type="radio" defaultChecked={option === "All Courses"} />
                                    <span className="text-sm font-medium">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Features</h3>
                        <div className="flex flex-wrap gap-2">
                            {["AI Sensei", "WebRTC", "PDF Material", "Live Chat"].map((feature) => (
                                <span
                                    key={feature}
                                    className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-xs font-semibold cursor-pointer hover:bg-primary hover:text-white transition-colors"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Sorting & Info */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-900 dark:text-white">48</span> courses
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400">Sort by:</span>
                            <select className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer">
                                <option>Popularity</option>
                                <option>Newest</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Course Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.id}`}
                                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                            {course.level}
                                        </span>
                                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                            {course.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</h3>
                                        <p className="text-xs text-primary font-medium">{course.titleEn}</p>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            {course.instructor === "AI Assistant" ? (
                                                <Bot className="size-4" />
                                            ) : (
                                                <User className="size-4" />
                                            )}
                                            <span>{course.instructor}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="size-4 text-yellow-400 fill-current" />
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{course.rating}</span>
                                            <span>({course.reviewCount.toLocaleString()})</span>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex items-center justify-between">
                                        {course.isFree ? (
                                            <span className="text-lg font-bold text-primary italic">Free</span>
                                        ) : (
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                ¥{course.price.toLocaleString()}
                                                {course.isMonthly && <span className="text-xs font-normal"> / mo</span>}
                                            </span>
                                        )}
                                        <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                            詳細を見る
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center pt-12 pb-8">
                        <nav className="flex items-center gap-1">
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <ChevronLeft className="size-5" />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">2</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">3</button>
                            <span className="px-2 text-slate-400">...</span>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">12</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <ChevronRight className="size-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </main>
    )
}
