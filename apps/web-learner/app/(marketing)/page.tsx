import { Video, Monitor, BookOpen, ArrowRight, Github, Twitter, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
    // Static placeholder data matching Sakura Learn template
    const featuredCourses = [
        {
            id: "1",
            title: "日本語基礎 N5",
            titleEn: "Foundational Japanese for beginners. Focus on Hiragana, Katakana, and basic grammar.",
            level: "JLPT N5",
            rating: 4.9,
            reviewCount: 1200,
            price: 4800,
            isMonthly: true
        },
        {
            id: "2",
            title: "中級日本語 N3",
            titleEn: "Bridge to fluency. Learn daily conversation nuances and intermediate kanji.",
            level: "JLPT N3",
            rating: 4.8,
            reviewCount: 850,
            price: 5500,
            isMonthly: true
        },
        {
            id: "3",
            title: "ビジネス日本語",
            titleEn: "Master Keigo (honorifics) and Japanese corporate etiquette for career growth.",
            level: "BUSINESS",
            rating: 5.0,
            reviewCount: 320,
            price: 7200,
            isMonthly: true,
            isBusiness: true
        }
    ]

    const testimonials = [
        {
            id: "1",
            quote: "AI先生との会話練習が本当に役立ちます。間違いを即座に修正してくれるので、自信がつきました。",
            author: "Alex Johnson",
            role: "N2 合格者"
        },
        {
            id: "2",
            quote: "ビジネスコースのおかげで、日本企業への転職が成功しました。敬語の使い方が非常に分かりやすいです。",
            author: "Sarah Chen",
            role: "ソフトウェアエンジニア"
        },
        {
            id: "3",
            quote: "WebRTCの品質が非常に高く、まるで対面で話しているような感覚です。講師の質も非常に高いです。",
            author: "Marco Rossi",
            role: "大学生"
        }
    ]

    const howItWorksSteps = [
        {
            step: 1,
            title: "無料登録",
            description: "まずはアカウントを作成。すべての機能が試せます。"
        },
        {
            step: 2,
            title: "コースを選択",
            description: "レベルチェックテストで最適なプランを決定。"
        },
        {
            step: 3,
            title: "レッスン開始",
            description: "AI先生や講師と対話して、生きた日本語を習得。"
        },
        {
            step: 4,
            title: "成果を確認",
            description: "データに基づいたフィードバックで成長を実感。"
        }
    ]

    return (
        <main>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <div className="z-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/30 text-accent-foreground text-xs font-semibold mb-6">
                            最新のAI学習テクノロジー
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                            日本語の扉を<br />開こう
                            <span className="block text-2xl lg:text-3xl font-medium text-muted-foreground mt-4">
                                Open the Door to Japanese
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                            インタラクティブなレッスンとAI先生で日本語をマスター。リアルタイムの指導とパーソナライズされたカリキュラムで、あなたの夢をサポートします。
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-md font-semibold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                                無料体験を始める
                            </button>
                            <Link href="/courses">
                                <button className="px-8 py-4 border border-border bg-background rounded-md font-semibold text-lg hover:bg-muted transition-all">
                                    コースを見る
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Visual Content */}
                    <div className="relative flex justify-center items-center">
                        <div className="relative w-full aspect-square max-w-md">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/20 rounded-full blur-3xl opacity-50"></div>
                            <div className="relative z-10 w-full h-full border border-border rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 flex flex-col justify-center items-center text-center">
                                <BookOpen className="w-24 h-24 text-primary mb-6" strokeWidth={1} />
                                <div className="space-y-2 w-full">
                                    <div className="h-2 w-32 bg-muted rounded mx-auto"></div>
                                    <div className="h-2 w-48 bg-muted/60 rounded mx-auto"></div>
                                    <div className="h-2 w-40 bg-muted/40 rounded mx-auto"></div>
                                </div>
                                <div className="absolute -top-4 -right-4 p-4 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-lg">
                                    <span className="text-xs font-bold text-accent-foreground">Success Rate 98%</span>
                                </div>
                                <div className="absolute -bottom-6 -left-6 p-4 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-xs font-medium">AI Sensei Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* USP Section */}
            <section className="py-16 border-y border-border bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* USP Item 1 */}
                        <div className="flex gap-6 p-8 bg-background border border-border rounded-2xl shadow-sm">
                            <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center text-accent-foreground">
                                <Video className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">リアルタイムのWebRTCレッスン</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    ブラウザだけで高品質なビデオ通話。ネイティブ講師といつでもどこでもつながります。
                                </p>
                            </div>
                        </div>

                        {/* USP Item 2 */}
                        <div className="flex gap-6 p-8 bg-background border border-border rounded-2xl shadow-sm">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Monitor className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">パーソナルAI先生</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    24時間365日、あなたのレベルに合わせた対話練習や質問対応。語学の壁をAIが取り払います。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-2">人気のあるコース</h2>
                            <p className="text-muted-foreground">初級からビジネスレベルまで、あなたに最適なステップを選びましょう。</p>
                        </div>
                        <Link href="/courses" className="text-primary font-semibold hover:underline flex items-center gap-1">
                            すべてのコースを見る
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredCourses.map((course) => (
                            <div key={course.id} className="group bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        course.isBusiness 
                                            ? 'bg-accent/20 text-accent-foreground font-bold' 
                                            : 'bg-muted'
                                    }`}>
                                        {course.level}
                                    </span>
                                    <div className="flex items-center text-yellow-500 text-xs font-bold">
                                        ★ {course.rating} <span className="text-muted-foreground font-normal ml-1">({course.reviewCount.toLocaleString()})</span>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold">{course.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{course.titleEn}</p>
                                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                    <span className="font-bold">
                                        ¥{course.price.toLocaleString()} 
                                        {course.isMonthly && <span className="text-xs text-muted-foreground font-normal"> / month</span>}
                                    </span>
                                    <button className="text-sm font-semibold text-primary hover:text-primary/80">詳細を見る</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">学習のステップ</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            シンプルで効果的な4つのプロセス。目標達成まで最短距離で案内します。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {howItWorksSteps.map((item) => (
                            <div key={item.step} className="text-center group">
                                <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-sm group-hover:border-primary transition-colors">
                                    {item.step}
                                </div>
                                <h4 className="font-bold mb-2">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">学習者の声</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="p-8 bg-background border border-border rounded-2xl">
                                <p className="italic text-muted-foreground mb-6">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                                    <div>
                                        <p className="text-sm font-bold">{testimonial.author}</p>
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-foreground text-background rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6 relative z-10">今すぐ日本語の旅を始めましょう</h2>
                        <p className="text-background/80 mb-10 max-w-xl mx-auto relative z-10">
                            最初の14日間はすべての機能を無料でお試しいただけます。クレジットカードは不要です。
                        </p>
                        <button className="px-8 py-4 bg-background text-foreground rounded-md font-bold text-lg hover:bg-muted transition-all relative z-10">
                            まずは無料で始める
                        </button>
                    </div>
                </div>
            </section>
        </main>
    )
}
