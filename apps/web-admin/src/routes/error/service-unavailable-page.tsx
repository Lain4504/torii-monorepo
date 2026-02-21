import { useNavigate } from "react-router-dom"
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
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
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
                    <EmptyTitle className="text-xl font-semibold">
                        Dịch vụ tạm ngưng
                    </EmptyTitle>
                    <EmptyDescription>
                        Hệ thống đang bảo trì hoặc quá tải. Vui lòng thử lại sau ít phút.
                    </EmptyDescription>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 size-4" />
                            Quay lại
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            <RotateCcw className="mr-2 size-4" />
                            Thử lại
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    )
}
