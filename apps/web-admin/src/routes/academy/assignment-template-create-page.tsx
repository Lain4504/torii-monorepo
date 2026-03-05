import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import { AssignmentTemplateForm } from "@/components/academy/assignment-template-form"
import { useCreateAcademyAssignmentTemplate } from "@/lib/api/services/academy-assignment-templates"
import type { AcademyAssignmentTemplateCreateDTO } from "@workspace/schemas"

export default function AcademyAssignmentTemplateCreatePage() {
    const navigate = useNavigate()
    const create = useCreateAcademyAssignmentTemplate()

    const handleSubmit = async (data: any) => {
        try {
            await create.mutateAsync(data as AcademyAssignmentTemplateCreateDTO)
            toast.success("Tạo Assignment Template thành công")
            navigate("/academy/assignment-templates")
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi tạo")
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tạo Assignment Template"
                subtitle="Thêm mẫu bài tập mới cho Course Profile."
            />
            <AssignmentTemplateForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={() => navigate("/academy/assignment-templates")}
                submitting={create.isPending}
            />
        </div>
    )
}
