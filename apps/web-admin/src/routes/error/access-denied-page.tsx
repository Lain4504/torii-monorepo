import { useNavigate } from "react-router-dom"
import { ErrorState } from "@workspace/ui/components/error-state"

export default function AccessDeniedPage() {
    const navigate = useNavigate()
    return (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center p-8">
            <ErrorState
                code="403"
                title="Unauthorized Grid Access"
                description="Your neural signature does not match the clearance levels required for this secure node."
                variant="403"
                onBack={() => navigate(-1)}
                onHome={() => navigate("/")}
            />
        </div>
    )
}
