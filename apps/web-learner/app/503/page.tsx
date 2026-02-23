"use client"

import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { ServerCrash, ArrowLeft, RotateCcw } from "lucide-react"
import {
    Empty,
    EmptyContent,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@workspace/ui/components/empty"

export default function ServiceUnavailablePage() {
    const router = useRouter()
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
            <Empty className="max-w-md border-none">
                <EmptyMedia>
                    <div className="size-16 flex items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                        <ServerCrash className="size-8" />
                    </div>
                </EmptyMedia>
                <EmptyContent>
                    <div className="text-6xl font-black text-muted-foreground/10 select-none leading-none">
                        503
                    </div>
                    <EmptyTitle className="text-xl font-semibold mt-4">
                        Dịch vụ tạm ngưng
                    </EmptyTitle>
                    <EmptyDescription>
                        Hệ thống đang bảo trì hoặc quá tải. Vui lòng thử lại sau ít phút.
                    </EmptyDescription>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 w-full">
                        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                            <ArrowLeft className="mr-2 size-4" />
                            Quay lại
                        </Button>
                        <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
                            <RotateCcw className="mr-2 size-4" />
                            Thử lại
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    )
}
