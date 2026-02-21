import { useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Search, ArrowLeft, Home } from "lucide-react"
import {
    Empty,
    EmptyContent,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@workspace/ui/components/empty"

export default function NotFoundPage() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
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
                    <EmptyTitle className="text-xl font-semibold">
                        Không tìm thấy trang
                    </EmptyTitle>
                    <EmptyDescription>
                        Đường dẫn bạn yêu cầu không tồn tại trong hệ thống quản trị Torii Academy.
                    </EmptyDescription>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 size-4" />
                            Quay lại
                        </Button>
                        <Button onClick={() => navigate("/")}>
                            <Home className="mr-2 size-4" />
                            Trang chủ
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    )
}
