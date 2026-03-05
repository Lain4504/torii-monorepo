import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import { QuizTemplateForm } from "@/components/academy/quiz-template-form"
import { useCreateAcademyQuizTemplate } from "@/lib/api/services/academy-quiz-templates"
import type { AcademyQuizTemplateCreateDTO } from "@workspace/schemas"

export default function AcademyQuizTemplateCreatePage() {
    const navigate = useNavigate()
    const create = useCreateAcademyQuizTemplate()

    const handleSubmit = async (data: any) => {
        try {
            await create.mutateAsync(data as AcademyQuizTemplateCreateDTO)
            toast.success("Tạo Quiz Template thành công")
            navigate("/academy/quiz-templates")
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi tạo")
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tạo Quiz Template"
                subtitle="Thêm mẫu quiz mới cho Course Profile."
            />
            <QuizTemplateForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={() => navigate("/academy/quiz-templates")}
                submitting={create.isPending}
            />
        </div>
    )
}
