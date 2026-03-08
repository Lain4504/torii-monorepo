import { useNavigate, useParams } from "react-router-dom"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { useAcademyQuestionPool, useUpdateAcademyQuestionPool } from "@/lib/api/services/academy-question-pools"
import { QuestionPoolForm } from "@/components/academy/question-pool-form"

export default function QuestionPoolEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: pool, isLoading } = useAcademyQuestionPool(id)
    const update = useUpdateAcademyQuestionPool()

    const hSubmit = async (data: any) => {
        if (!id) return
        try {
            await update.mutateAsync({ id, input: data })
            toast.success("Đã cập nhật")
            navigate(`/academy/question-pools/${id}`)
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi cập nhật")
        }
    }

    if (isLoading) return <div>Đang tải...</div>
    if (!pool) return <div>Không tìm thấy pool</div>

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Sửa Pool: ${pool.name}`}
                subtitle="Cập nhật thông tin cơ bản của pool."
            />

            <QuestionPoolForm
                mode="edit"
                initial={pool}
                onSubmit={hSubmit}
                onCancel={() => navigate(`/academy/question-pools/${id}`)}
                submitting={update.isPending}
            />
        </div>
    )
}
