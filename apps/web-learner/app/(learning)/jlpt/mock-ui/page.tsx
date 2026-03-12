'use client'

import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, FileText, Headphones, Languages, MessageCircle, Timer } from "lucide-react"
import Link from "next/link"

const LEVEL_BADGE_COLOR = "bg-amber-400 text-amber-950 dark:text-amber-50"

export default function JlptMockUiPage() {
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
                            N3
                        </span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-10">
                        <h1 className="text-2xl font-bold text-foreground">
                            Kỳ thi 2023{" "}
                            <span className="text-muted-foreground font-normal text-base ml-2">
                                Kỳ 2 (tháng 12)
                            </span>
                        </h1>
                    </div>

                    {/* Exam Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: Kanji - Từ vựng */}
                        <ExamCard
                            icon={<Languages className="w-6 h-6" />}
                            iconBg="bg-sky-50 text-sky-500"
                            title="Kanji - Từ vựng"
                            subtitle="文字・語彙"
                            duration="30 phút"
                            questions="35 câu"
                            href="/jlpt/mock-ui/section"
                        />

                        {/* Card 2: Ngữ pháp - Đọc hiểu */}
                        <ExamCard
                            icon={<FileText className="w-6 h-6" />}
                            iconBg="bg-purple-50 text-purple-500"
                            title="Ngữ pháp - Đọc hiểu"
                            subtitle="文法・読解"
                            duration="70 phút"
                            questions="25 câu"
                        />

                        {/* Card 3: Nghe hiểu */}
                        <ExamCard
                            icon={<Headphones className="w-6 h-6" />}
                            iconBg="bg-emerald-50 text-emerald-500"
                            title="Nghe hiểu"
                            subtitle="聴解 (ちょうかい)"
                            duration="40 phút"
                            questions="28 câu"
                        />
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

interface ExamCardProps {
    icon: React.ReactNode
    iconBg: string
    title: string
    subtitle: string
    duration: string
    questions: string
    href?: string
}

function ExamCard({ icon, iconBg, title, subtitle, duration, questions, href }: ExamCardProps) {
    const Wrapper = href ? Link : "div"
    const wrapperProps = href ? { href } : {}

    return (
        <Wrapper
            {...(wrapperProps as any)}
            className="bg-card rounded-2xl p-8 shadow-sm border border-border flex flex-col gap-6 hover:shadow-md transition-shadow"
        >
            <div className={`${iconBg} size-10 rounded-lg flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-foreground text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    {duration}
                </div>
                <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    {questions}
                </div>
            </div>
        </Wrapper>
    )
}

