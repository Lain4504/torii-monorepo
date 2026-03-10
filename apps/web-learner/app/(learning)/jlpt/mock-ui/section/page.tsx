'use client'

import { Button } from "@workspace/ui/components/button"
import { Clock, Maximize2, MessageCircle, Send, Settings } from "lucide-react"

type MondaiSection = {
    id: string
    title: string
    description: string
}

type QuestionOption = {
    id: number
    label: string
}

type QuestionBlock = {
    id: number
    sentence: React.ReactNode
    options: QuestionOption[]
}

const MONDAI_SECTIONS: MondaiSection[] = [
    { id: "m1", title: "問題1", description: "読み方 ・ 0/8" },
    { id: "m2", title: "問題2", description: "漢字 ・ 0/6" },
    { id: "m3", title: "問題3", description: "語彙 ・ 0/11" },
    { id: "m4", title: "問題4", description: "類義語 ・ 0/5" },
    { id: "m5", title: "問題5", description: "用法 ・ 0/5" },
]

const QUESTION_COUNT = 35

const QUESTIONS: QuestionBlock[] = [
    {
        id: 1,
        sentence: (
            <>
                すみません、
                <span className="underline underline-offset-8 decoration-2 font-bold decoration-black px-1">
                    汚して
                </span>
                しまいました。
            </>
        ),
        options: [
            { id: 1, label: "こわして" },
            { id: 2, label: "おこして" },
            { id: 3, label: "よごして" },
            { id: 4, label: "のこして" },
        ],
    },
    {
        id: 2,
        sentence: (
            <>
                体育館に
                <span className="underline underline-offset-8 decoration-2 font-bold decoration-black px-1">
                    選手
                </span>
                が入ってきました。
            </>
        ),
        options: [
            { id: 1, label: "ぜんしゅ" },
            { id: 2, label: "せんしゅう" },
            { id: 3, label: "せんしゅ" },
            { id: 4, label: "ぜんしゅう" },
        ],
    },
    {
        id: 3,
        sentence: (
            <>
                次は
                <span className="underline underline-offset-8 decoration-2 font-bold decoration-black px-1">
                    月末
                </span>
                に来てください。
            </>
        ),
        options: [
            { id: 1, label: "げつもつ" },
            { id: 2, label: "げつまつ" },
            { id: 3, label: "がつまつ" },
            { id: 4, label: "がつもつ" },
        ],
    },
    {
        id: 4,
        sentence: (
            <>
                箱の
                <span className="underline underline-offset-8 decoration-2 font-bold decoration-black px-1">
                    裏
                </span>
                をよく見てください。
            </>
        ),
        options: [
            { id: 1, label: "うら" },
            { id: 2, label: "おく" },
        ],
    },
]

export default function JlptMockSectionPage() {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                    <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm font-bold">
                        N3
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-foreground">Kanji - Từ vựng</h1>
                        <span className="text-xs text-muted-foreground">0/35 câu</span>
                    </div>
                </div>

                {/* Timer (mocked UI) */}
                <div className="flex items-center space-x-2 text-xl font-semibold text-foreground">
                    <Clock className="w-5 h-5" />
                    <span>29 : 31</span>
                </div>

                <div className="flex items-center space-x-3">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors shadow-none">
                        <Send className="w-4 h-4 mr-2" />
                        Nộp bài
                    </Button>
                    <Button
                        variant="outline"
                        className="px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
                    >
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Thoát
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-[280px] bg-card border-r border-border flex flex-col overflow-y-auto">
                    <div className="p-6 space-y-8">
                        {/* Mondai sections */}
                        <section>
                            <h2 className="text-xs font-bold text-muted-foreground tracking-wider mb-4 uppercase">
                                PHẦN THI
                            </h2>
                            <nav className="space-y-1">
                                {MONDAI_SECTIONS.map((m, index) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        className={`block w-full text-left p-3 rounded-lg transition-colors ${
                                            index === 0
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-accent"
                                        }`}
                                    >
                                        <p className="font-bold text-sm">
                                            {m.title}
                                        </p>
                                        <p
                                            className={`text-xs ${
                                                index === 0 ? "opacity-90" : "text-muted-foreground"
                                            }`}
                                        >
                                            {m.description}
                                        </p>
                                    </button>
                                ))}
                            </nav>
                        </section>

                        {/* Question grid */}
                        <section>
                            <h2 className="text-xs font-bold text-muted-foreground tracking-wider mb-4 uppercase">
                                CÂU HỎI
                            </h2>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: QUESTION_COUNT }, (_, i) => i + 1).map(
                                    (num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            className="w-full aspect-square text-[10px] flex items-center justify-center border border-border text-muted-foreground rounded hover:bg-primary/5 hover:text-primary transition-colors"
                                        >
                                            {num}
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="mt-auto p-4 flex justify-start">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto bg-muted p-8 relative">
                    <div className="max-w-4xl mx-auto space-y-6 pb-24">
                        {/* Instruction card */}
                        <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6">
                            <p className="text-foreground font-medium">
                                問題1　＿＿＿のことばの読み方として最もよいものを、1・2・3・4から一つえらびなさい。
                            </p>
                        </div>

                        {/* Question blocks */}
                        {QUESTIONS.map((q) => (
                            <div
                                key={q.id}
                                className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-6"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-foreground rounded-md font-bold">
                                        {q.id}
                                    </span>
                                    <p className="text-xl text-foreground">
                                        {q.sentence}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                                    {q.options.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className="option-card border border-border rounded-lg p-4 text-left transition-all flex items-center space-x-3 group bg-card"
                                        >
                                            <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                                                {opt.id}
                                            </span>
                                            <span>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating chat button */}
                    <div className="fixed bottom-6 right-6">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center px-4 py-2 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            <span className="font-medium text-sm">Nhắn tin</span>
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    )
}

