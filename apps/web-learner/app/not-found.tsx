"use client"

import { useRouter } from "next/navigation"
import { ErrorState } from "@workspace/ui/components/error-state"

export default function NotFound() {
    const router = useRouter()
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <ErrorState
                code="404"
                title="Không tìm thấy trang"
                description="Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Vui lòng quay lại trang chủ."
                variant="404"
                onBack={() => router.back()}
                onHome={() => router.push("/")}
            />
        </div>
    )
}
