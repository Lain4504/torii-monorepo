import { useNavigate } from "react-router-dom"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { useCreateAcademyQuestionPool } from "@/lib/api/services/academy-question-pools"
import { QuestionPoolForm } from "@/components/academy/question-pool-form"

export default function QuestionPoolNewPage() {
    const navigate = useNavigate()
    const create = useCreateAcademyQuestionPool()

    const hSubmit = async (data: any) => {
        try {
            const res = await create.mutateAsync(data)
            toast.success("Đã tạo pool")
            navigate(`/academy/question-pools/${res.id}`)
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi tạo pool")
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tạo Question Pool mới"
                subtitle="Group questions for random sampling in exams."
            />

            <QuestionPoolForm
                mode="create"
                onSubmit={hSubmit}
                onCancel={() => navigate("/academy/question-pools")}
                submitting={create.isPending}
            />
        </div>
    )
}
