import { useNavigate, useParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import { QuizTemplateForm } from "@/components/academy/quiz-template-form"
import {
    useAcademyQuizTemplate,
    useUpdateAcademyQuizTemplate,
} from "@/lib/api/services/academy-quiz-templates"
import type { AcademyQuizTemplateUpdateDTO } from "@workspace/schemas"
import { Spinner } from "@workspace/ui/components/spinner"

export default function AcademyQuizTemplateEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: initial, isLoading } = useAcademyQuizTemplate(id)
    const update = useUpdateAcademyQuizTemplate()

    const handleSubmit = async (data: any) => {
        if (!id) return
        try {
            await update.mutateAsync({ id, input: data as AcademyQuizTemplateUpdateDTO })
            toast.success("Cập nhật thành công")
            navigate("/academy/quiz-templates")
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi cập nhật")
        }
    }

    if (isLoading) return <Spinner />

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sửa Quiz Template"
                subtitle={`Đang chỉnh sửa: ${initial?.title}`}
            />
            <QuizTemplateForm
                mode="edit"
                initial={initial}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/academy/quiz-templates")}
                submitting={update.isPending}
            />
        </div>
    )
}
