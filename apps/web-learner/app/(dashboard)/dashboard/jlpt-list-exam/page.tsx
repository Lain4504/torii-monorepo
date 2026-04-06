"use client"

import Link from "next/link"
import { 
    Trophy,
    GraduationCap,
    ArrowRight,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const LEVELS = [
    { 
        code: "N1", 
        description: "JLPT N1",
        shortDesc: "Cấp độ cao nhất, sử dụng thành thạo như người bản xứ.",
        difficulty: "Cao cấp"
    },
    { 
        code: "N2", 
        description: "JLPT N2",
        shortDesc: "Hiểu biết sâu rộng tiếng Nhật trong nhiều hoàn cảnh.",
        difficulty: "Thượng cấp"
    },
    { 
        code: "N3", 
        description: "JLPT N3",
        shortDesc: "Chuyển tiếp quan trọng lên cấp độ trung cấp.",
        difficulty: "Trung cấp"
    },
    { 
        code: "N4", 
        description: "JLPT N4",
        shortDesc: "Hiểu đàm thoại cơ bản và chữ Hán thông dụng.",
        difficulty: "Sơ cấp 2"
    },
    { 
        code: "N5", 
        description: "JLPT N5",
        shortDesc: "Dành cho người mới bắt đầu, kiến thức căn bản nhất.",
        difficulty: "Sơ cấp 1"
    },
]

const LEVEL_STYLES: Record<string, { box: string; code: string; difficulty: string }> = {
    N1: {
        box: "bg-rose-500/10 border-rose-500/30",
        code: "text-rose-700 dark:text-rose-300",
        difficulty: "text-rose-600/90 dark:text-rose-300/90",
    },
    N2: {
        box: "bg-orange-500/10 border-orange-500/30",
        code: "text-orange-700 dark:text-orange-300",
        difficulty: "text-orange-600/90 dark:text-orange-300/90",
    },
    N3: {
        box: "bg-amber-500/10 border-amber-500/30",
        code: "text-amber-700 dark:text-amber-300",
        difficulty: "text-amber-600/90 dark:text-amber-300/90",
    },
    N4: {
        box: "bg-emerald-500/10 border-emerald-500/30",
        code: "text-emerald-700 dark:text-emerald-300",
        difficulty: "text-emerald-600/90 dark:text-emerald-300/90",
    },
    N5: {
        box: "bg-sky-500/10 border-sky-500/30",
        code: "text-sky-700 dark:text-sky-300",
        difficulty: "text-sky-600/90 dark:text-sky-300/90",
    },
}

export default function JlptListExamPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border shrink-0">
                        <Trophy className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Luyện thi JLPT Mock</h1>
                        <p className="text-sm text-muted-foreground">Hệ thống đề thi thử JLPT chuẩn xác từ N1 đến N5.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {LEVELS.map((level) => (
                    (() => {
                        const levelStyle = LEVEL_STYLES[level.code] ?? {
                            box: "bg-muted border-border",
                            code: "text-foreground",
                            difficulty: "text-muted-foreground",
                        }

                        return (
                    <Link key={level.code} href={`/jlpt/${level.code.toLowerCase()}`} className="group block">
                        <div className="flex items-center gap-4 p-5 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                            <div className={cn("size-14 rounded-lg flex flex-col items-center justify-center border shrink-0", levelStyle.box)}>
                                <span className={cn("text-xl font-bold leading-none", levelStyle.code)}>{level.code}</span>
                                <span className={cn("text-[9px] font-medium mt-0.5", levelStyle.difficulty)}>{level.difficulty}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="text-base font-bold text-foreground">
                                        Kỳ thi thử {level.description}
                                    </h3>
                                    <ArrowRight className="size-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground leading-normal max-w-2xl">
                                    {level.shortDesc}
                                </p>
                            </div>
                        </div>
                    </Link>
                        )
                    })()
                ))}
            </div>

            <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-4 py-2 rounded-lg border">
                    <GraduationCap className="size-4" />
                    <span>Chọn cấp độ phù hợp để bắt đầu quá trình đánh giá</span>
                </div>
            </div>
        </div>
    )
}
