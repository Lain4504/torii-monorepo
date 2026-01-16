import { useNavigate } from "react-router-dom"
import { ErrorState } from "@workspace/ui/components/error-state"

export default function NotFoundPage() {
    const navigate = useNavigate()
    return (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center p-8">
            <ErrorState
                code="404"
                title="Command center node not found"
                description="The administrative endpoint you are looking for does not exist in the current grid."
                variant="404"
                onBack={() => navigate(-1)}
                onHome={() => navigate("/")}
            />
        </div>
    )
}
