"use client"

import { useRouter } from "next/navigation"
import { ErrorState } from "@workspace/ui/components/error-state"

export default function NotFound() {
    const router = useRouter()
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <ErrorState
                code="404"
                title="Trôi dạt vào cõi không"
                description="Trang bạn tìm kiếm đã tan biến vào hư vô. Đây là bản chất vô thường của vạn vật kỹ thuật số."
                variant="404"
                onBack={() => router.back()}
                onHome={() => router.push("/")}
            />
        </div>
    )
}
