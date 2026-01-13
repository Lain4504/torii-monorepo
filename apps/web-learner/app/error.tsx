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
                title="Sự cố trong dòng chảy"
                description="Ngay cả những viên đá vững chãi nhất cũng có thể nứt vỡ dưới áp lực của ngọn núi. Hệ thống đang được khôi phục."
                variant="500"
                actionLabel="Khôi phục kết nối"
                onAction={() => reset()}
                onBack={() => router.back()}
                onHome={() => router.push("/")}
            />
        </div>
    )
}
