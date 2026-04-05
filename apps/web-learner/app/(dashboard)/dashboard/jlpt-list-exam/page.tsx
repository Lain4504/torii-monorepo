'use client'

import Link from "next/link"
import { 
    ChevronRight, 
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

const LEVELS = [
    { 
        code: "N5", 
        description: "JLPT N5",
        shortDesc: "Dành cho người mới bắt đầu, nắm vững kiến thức căn bản nhất.",
    },
    { 
        code: "N4", 
        description: "JLPT N4",
        shortDesc: "Yêu cầu hiểu đàm thoại cơ bản và chữ Hán thông dụng.",
    },
    { 
        code: "N3", 
        description: "JLPT N3",
        shortDesc: "Hành trang chuyển tiếp quan trọng lên cấp độ trung cấp.",
    },
    { 
        code: "N2", 
        description: "JLPT N2",
        shortDesc: "Khả năng hiểu biết sâu rộng tiếng Nhật trong nhiều hoàn cảnh.",
    },
    { 
        code: "N1", 
        description: "JLPT N1",
        shortDesc: "Cấp độ cao nhất, yêu cầu sử dụng thành thạo như người bản xứ.",
    },
]

export default function JlptListExamPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-8">
            {/* Standard Header */}
            <div className="space-y-4 pb-8 border-b border-border">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Luyện thi JLPT Mock</h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Chinh phục kỳ thi JLPT với hệ thống đề thi mô phỏng chất lượng cao.
                </p>
            </div>

            {/* Level selection grid - Compact Size */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LEVELS.map((level) => (
                    <Link key={level.code} href={`/jlpt/${level.code.toLowerCase()}`} className="group">
                        <Card className="h-full border-border/40 bg-card hover:bg-muted/5 transition-all duration-300 rounded-xl overflow-hidden shadow-none group">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base font-bold text-foreground/80 group-hover:text-primary transition-colors flex items-center justify-between">
                                    {level.description}
                                    <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-xs text-muted-foreground/60 leading-relaxed font-medium line-clamp-2">
                                    {level.shortDesc}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </section>
        </div>
    )
}
