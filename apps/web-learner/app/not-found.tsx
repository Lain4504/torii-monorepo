"use client"

import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Search, ArrowLeft, Home } from "lucide-react"
import {
    Empty,
    EmptyContent,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@workspace/ui/components/empty"

export default function NotFound() {
    const router = useRouter()
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
            <Empty className="max-w-md border-none">
                <EmptyMedia>
                    <div className="size-16 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Search className="size-8" />
                    </div>
                </EmptyMedia>
                <EmptyContent>
                    <div className="text-6xl font-black text-muted-foreground/10 select-none leading-none">
                        404
                    </div>
                    <EmptyTitle className="text-xl font-semibold mt-4">
                        Không tìm thấy trang
                    </EmptyTitle>
                    <EmptyDescription>
                        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Vui lòng quay lại trang chủ.
                    </EmptyDescription>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 w-full">
                        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                            <ArrowLeft className="mr-2 size-4" />
                            Quay lại
                        </Button>
                        <Button onClick={() => router.push("/")} className="w-full sm:w-auto">
                            <Home className="mr-2 size-4" />
                            Trang chủ
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    )
}
