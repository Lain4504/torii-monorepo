import { useNavigate } from "react-router-dom"
import { ErrorState } from "@workspace/ui/components/error-state"

export default function AccessDeniedPage() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-1 items-center justify-center p-8">
            <ErrorState
                code="403"
                title="Truy cập bị từ chối"
                description="Tài khoản của bạn không có đủ quyền hạn để truy cập vào vùng dữ liệu này."
                variant="403"
                onBack={() => navigate(-1)}
                onHome={() => navigate("/")}
            />
        </div>
    )
}
