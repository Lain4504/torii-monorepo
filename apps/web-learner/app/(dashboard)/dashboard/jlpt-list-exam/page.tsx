'use client'

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ChevronRight, GraduationCap, Languages } from "lucide-react"

const LEVELS = [
    { code: "N5", color: "bg-emerald-50 text-emerald-600", description: "Sơ cấp – N5" },
    { code: "N4", color: "bg-lime-50 text-lime-600", description: "Sơ trung cấp – N4" },
    { code: "N3", color: "bg-amber-50 text-amber-600", description: "Trung cấp – N3" },
    { code: "N2", color: "bg-sky-50 text-sky-600", description: "Thượng trung cấp – N2" },
    { code: "N1", color: "bg-purple-50 text-purple-600", description: "Cao cấp – N1" },
]

export default function JlptListExamPage() {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="max-w-[1200px] mx-auto p-6 md:p-10 space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                            <Languages className="w-3 h-3" />
                            Luyện thi JLPT mock
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Chọn cấp độ JLPT của bạn
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Chọn một cấp độ bên dưới để xem danh sách đề thi thử tương ứng.
                        </p>
                    </div>
                </header>

                {/* Level cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {LEVELS.map((level) => (
                        <Link
                            key={level.code}
                            href={`/jlpt/${level.code.toLowerCase()}`}
                            className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${level.color}`}
                                    >
                                        <span>{level.code}</span>
                                        <GraduationCap className="w-3 h-3" />
                                    </div>
                                    <h2 className="text-lg font-bold">{level.description}</h2>
                                    <p className="text-xs text-muted-foreground max-w-xs">
                                        Đề thi mô phỏng kỳ JLPT 2023 – Kỳ 2 (tháng 12). Gồm đủ 3 phần: Từ
                                        vựng, Ngữ pháp – Đọc hiểu, Nghe hiểu.
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="mt-6 flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
                                <span>Nhấn để xem đề thi</span>
                                <span>Mock exam · JLPT {level.code}</span>
                            </div>
                        </Link>
                    ))}
                </section>
            </div>
        </div>
    )
}

