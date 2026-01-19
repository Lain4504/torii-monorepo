'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorState } from "@workspace/ui/components/error-state"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <ErrorState
                code="500"
                title="Đã xảy ra lỗi hệ thống"
                description="Hệ thống gặp sự cố không mong muốn trong quá trình xử lý. Đội ngũ kỹ thuật của Torii đã được thông báo."
                variant="500"
                actionLabel="Thử lại"
                onAction={() => reset()}
                onBack={() => router.back()}
                onHome={() => router.push("/")}
            />
        </div>
    )
}
