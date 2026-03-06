import { useNavigate, useParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import { AssignmentTemplateForm } from "@/components/academy/assignment-template-form"
import {
    useAcademyAssignmentTemplate,
    useUpdateAcademyAssignmentTemplate,
} from "@/lib/api/services/academy-assignment-templates"
import type { AcademyAssignmentTemplateUpdateDTO } from "@workspace/schemas"
import { Spinner } from "@workspace/ui/components/spinner"

export default function AcademyAssignmentTemplateEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: initial, isLoading } = useAcademyAssignmentTemplate(id)
    const update = useUpdateAcademyAssignmentTemplate()

    const handleSubmit = async (data: any) => {
        if (!id) return
        try {
            await update.mutateAsync({ id, input: data as AcademyAssignmentTemplateUpdateDTO })
            toast.success("Cập nhật thành công")
            navigate("/academy/assignment-templates")
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi cập nhật")
        }
    }

    if (isLoading) return <Spinner />

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sửa Assignment Template"
                subtitle={`Đang chỉnh sửa: ${initial?.title}`}
            />
            <AssignmentTemplateForm
                mode="edit"
                initial={initial}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/academy/assignment-templates")}
                submitting={update.isPending}
            />
        </div>
    )
}
