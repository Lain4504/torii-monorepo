import { Video, Bot, CreditCard, Settings, User, GraduationCap, DollarSign, Wrench, BrainCircuit, Languages, Search, ChevronDown, Mail, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
    // Static placeholder data matching HTML template
    const featuredTopics = [
        {
            id: "1",
            icon: Video,
            title: "WebRTCレッスンの参加方法",
            titleEn: "Joining WebRTC Lessons",
            color: "blue"
        },
        {
            id: "2",
            icon: Bot,
            title: "AI先生の使い方",
            titleEn: "How to use AI Sensei",
            color: "purple"
        },
        {
            id: "3",
            icon: CreditCard,
            title: "支払い・プラン",
            titleEn: "Payments & Plans",
            color: "emerald"
        },
        {
            id: "4",
            icon: Settings,
            title: "アカウント設定",
            titleEn: "Account Settings",
            color: "amber"
        }
    ]

    const categories = [
        { name: "Account", icon: User, active: true },
        { name: "Courses", icon: GraduationCap, active: false },
        { name: "Payments", icon: DollarSign, active: false },
        { name: "Technical", icon: Wrench, active: false },
        { name: "AI Sensei", icon: BrainCircuit, active: false },
        { name: "WebRTC", icon: Languages, active: false }
    ]

    const faqs = [
        {
            id: "1",
            question: "パスワードを忘れました。どうすればいいですか？",
            questionEn: "I forgot my password. What should I do?",
            answer: "ログイン画面の「パスワードをお忘れですか？」リンクをクリックしてください。登録されたメールアドレスにリセット用のリンクをお送りします。",
            answerEn: "Click the \"Forgot Password?\" link on the login screen. We will send a reset link to your registered email address.",
            expanded: true
        },
        {
            id: "2",
            question: "メールアドレスの変更方法は？",
            questionEn: "How can I change my email address?",
            answer: "",
            answerEn: "",
            expanded: false
        },
        {
            id: "3",
            question: "プロフィールの編集方法を教えてください。",
            questionEn: "How do I edit my profile?",
            answer: "",
            answerEn: "",
            expanded: false
        },
        {
            id: "4",
            question: "アカウントを削除したい場合は？",
            questionEn: "What if I want to delete my account?",
            answer: "",
            answerEn: "",
            expanded: false
        }
    ]

    const getColorClasses = (color: string): { bg: string; text: string; bgDark: string; textDark: string } => {
        const colorMap: Record<string, { bg: string; text: string; bgDark: string; textDark: string }> = {
            blue: { bg: "bg-blue-100", text: "text-blue-600", bgDark: "dark:bg-blue-900/30", textDark: "dark:text-blue-400" },
            purple: { bg: "bg-purple-100", text: "text-purple-600", bgDark: "dark:bg-purple-900/30", textDark: "dark:text-purple-400" },
            emerald: { bg: "bg-emerald-100", text: "text-emerald-600", bgDark: "dark:bg-emerald-900/30", textDark: "dark:text-emerald-400" },
            amber: { bg: "bg-amber-100", text: "text-amber-600", bgDark: "dark:bg-amber-900/30", textDark: "dark:text-amber-400" }
        }
        const defaultColor = { bg: "bg-blue-100", text: "text-blue-600", bgDark: "dark:bg-blue-900/30", textDark: "dark:text-blue-400" }
        return colorMap[color] ?? defaultColor
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Search Section */}
            <section className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">Help &amp; Support</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 italic">なにかお困りですか？ How can we help you today?</p>
                <div className="max-w-2xl mx-auto relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-lg"
                        placeholder="Search for help... (なにかお困りですか？)"
                        type="text"
                    />
                </div>
            </section>

            {/* Featured Topics Grid */}
            <section className="mb-20">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <span className="w-8 h-1 bg-primary rounded-full"></span>
                    Featured Topics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredTopics.map((topic) => {
                        const Icon = topic.icon
                        const colors = getColorClasses(topic.color)
                        return (
                            <div
                                key={topic.id}
                                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary transition-all shadow-sm hover:shadow-xl cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.bgDark} ${colors.text} ${colors.textDark} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="size-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{topic.title}</h3>
                                <p className="text-sm text-slate-500">{topic.titleEn}</p>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Categories and FAQ Accordion */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20">
                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <nav className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Categories</p>
                        {categories.map((category) => {
                            const Icon = category.icon
                            return (
                                <a
                                    key={category.name}
                                    href="#"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors ${
                                        category.active
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon className="size-5" />
                                    {category.name}
                                </a>
                            )
                        })}
                    </nav>
                </aside>

                {/* Accordion Section */}
                <div className="lg:col-span-3 space-y-4">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                            <button className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900 dark:text-white">{faq.question}</p>
                                    <p className="text-sm text-slate-500">{faq.questionEn}</p>
                                </div>
                                <ChevronDown className="text-slate-400 size-5 shrink-0 ml-4" />
                            </button>
                            {faq.expanded && (
                                <div className="px-6 pb-5 pt-0 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-2 p-4">
                                    {faq.answer}
                                    <br /><br />
                                    {faq.answerEn}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Support Section */}
            <section className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-3xl font-black mb-4">Still need help?</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Our support team is available 24/7 to assist you with any questions or technical issues.
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                    <Mail className="size-5" />
                                </div>
                                <div>
                                    <p className="font-bold">Email Us</p>
                                    <a className="text-primary hover:underline" href="mailto:support@nihongo.io">
                                        support@nihongo.io
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                    <MessageCircle className="size-5" />
                                </div>
                                <div>
                                    <p className="font-bold">Live Chat</p>
                                    <p className="text-sm text-slate-500 mb-2">Available Mon-Fri, 9am - 6pm JST</p>
                                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                                        Start Live Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form className="space-y-4 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl shadow-primary/5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Name</label>
                                <input
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-primary focus:ring-primary"
                                    type="text"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                                <input
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-primary focus:ring-primary"
                                    type="email"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                            <select className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-primary focus:ring-primary">
                                <option>Technical Issue</option>
                                <option>Billing Question</option>
                                <option>Course Feedback</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Message</label>
                            <textarea
                                className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-primary focus:ring-primary"
                                rows={4}
                            />
                        </div>
                        <button
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
                            type="submit"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </section>
        </main>
    )
}
