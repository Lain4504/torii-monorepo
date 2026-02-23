'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@workspace/ui/components/button"
import { ServerCrash, ArrowLeft, RotateCcw } from "lucide-react"
import {
    Empty,
    EmptyContent,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@workspace/ui/components/empty"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
            <Empty className="max-w-md border-none">
                <EmptyMedia>
                    <div className="size-16 flex items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <ServerCrash className="size-8" />
                    </div>
                </EmptyMedia>
                <EmptyContent>
                    <div className="text-6xl font-black text-muted-foreground/10 select-none leading-none">
                        500
                    </div>
                    <EmptyTitle className="text-xl font-semibold mt-4">
                        Đã xảy ra lỗi hệ thống
                    </EmptyTitle>
                    <EmptyDescription>
                        Hệ thống gặp sự cố không mong muốn trong quá trình xử lý. Đội ngũ kỹ thuật của Torii đã được thông báo.
                    </EmptyDescription>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 w-full">
                        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                            <ArrowLeft className="mr-2 size-4" />
                            Quay lại
                        </Button>
                        <Button onClick={() => reset()} className="w-full sm:w-auto">
                            <RotateCcw className="mr-2 size-4" />
                            Thử lại
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    )
}
