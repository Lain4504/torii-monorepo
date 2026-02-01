import { useNavigate } from "react-router-dom"
import { ErrorState } from "@workspace/ui/components/error-state"

export default function NotFoundPage() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-1 items-center justify-center p-8">
            <ErrorState
                code="404"
                title="Không tìm thấy trang"
                description="Đường dẫn bạn yêu cầu không tồn tại trong hệ thống quản trị."
                variant="404"
                onBack={() => navigate(-1)}
                onHome={() => navigate("/")}
            />
        </div>
    )
}
