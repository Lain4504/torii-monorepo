import { useNavigate, useSearchParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import { AssignmentTemplateForm } from "@/components/academy/assignment-template-form"
import { useCreateAcademyAssignmentTemplate } from "@/lib/api/services/academy-assignment-templates"
import type { AcademyAssignmentTemplateCreateDTO } from "@workspace/schemas"

export default function AcademyAssignmentTemplateCreatePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const create = useCreateAcademyAssignmentTemplate()
    const profileId = searchParams.get("profileId")

    const handleSubmit = async (data: any) => {
        try {
            await create.mutateAsync(data as AcademyAssignmentTemplateCreateDTO)
            toast.success("Tạo Assignment Template thành công")
            if (profileId) {
                navigate(`/academy/course-profiles/${profileId}?tab=assignments`)
            } else {
                navigate(-1)
            }
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
                initial={profileId ? { courseProfileId: profileId } as any : undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                    if (profileId) {
                        navigate(`/academy/course-profiles/${profileId}?tab=assignments`)
                    } else {
                        navigate(-1)
                    }
                }}
                submitting={create.isPending}
            />
        </div>
    )
}
