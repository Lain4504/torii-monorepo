'use client'

'use client'

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, CalendarDays, FileText, MessageCircle } from "lucide-react"

const LEVEL_BADGE_COLOR = "bg-amber-400 text-amber-950 dark:text-amber-50"

type MockExam = {
    id: string
    title: string
    code: string
    duration: string
    sections: string
}

const MOCK_EXAMS: MockExam[] = [
    {
        id: "2023-12-01",
        title: "JLPT Mock Test 01",
        code: "Kỳ thi 2023 · Đề 1",
        duration: "Tổng 140 phút",
        sections: "Kanji – Từ vựng · Ngữ pháp – Đọc hiểu · Nghe hiểu",
    },
    {
        id: "2023-12-02",
        title: "JLPT Mock Test 02",
        code: "Kỳ thi 2023 · Đề 2",
        duration: "Tổng 140 phút",
        sections: "Kanji – Từ vựng · Ngữ pháp – Đọc hiểu · Nghe hiểu",
    },
    {
        id: "2023-12-03",
        title: "JLPT Mock Test 03",
        code: "Kỳ thi 2023 · Đề 3",
        duration: "Tổng 140 phút",
        sections: "Kanji – Từ vựng · Ngữ pháp – Đọc hiểu · Nghe hiểu",
    },
]

export default function JlptLevelExamPage() {
    const params = useParams<{ level: string }>()
    const levelCode = (params.level || "n3").toUpperCase()

    return (
        <div className="min-h-screen bg-muted">
            <div className="w-full h-screen overflow-y-auto relative px-6 py-10 md:px-16 md:py-16">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 mb-6">
                        <Link
                            href="/dashboard/jlpt-list-exam"
                            className="text-sm text-muted-foreground flex items-center gap-1 hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Chọn cấp độ JLPT
                        </Link>
                        <span
                            className={`${LEVEL_BADGE_COLOR} text-[12px] font-bold px-3 py-0.5 rounded-full ml-2`}
                        >
                            {levelCode}
                        </span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground">
                            Danh sách đề thi JLPT {levelCode}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Chọn một đề thi bên dưới để vào màn hình chọn phần thi (Kanji, Ngữ pháp –
                            Đọc hiểu, Nghe hiểu).
                        </p>
                    </div>

                    {/* Exam list */}
                    <div className="space-y-4">
                        {MOCK_EXAMS.map((exam) => (
                            <Link
                                key={exam.id}
                                href="/jlpt/mock-ui"
                                className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {levelCode}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em]">
                                            {exam.code}
                                        </p>
                                        <h2 className="text-base md:text-lg font-bold text-foreground">
                                            {exam.title}
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {exam.sections}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                        <span>Kỳ thi 2023 · Kỳ 2</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>{exam.duration}</span>
                                    </div>
                                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary group-hover:text-primary/80">
                                        Nhấn để chọn đề
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Floating Chat Button */}
                <div className="fixed bottom-10 right-10">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Nhắn tin</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

