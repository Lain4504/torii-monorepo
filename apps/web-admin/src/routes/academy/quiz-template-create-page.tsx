import { useNavigate, useSearchParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import { QuizTemplateForm } from "@/components/academy/quiz-template-form"
import { useCreateAcademyQuizTemplate } from "@/lib/api/services/academy-quiz-templates"
import type { AcademyQuizTemplateCreateDTO } from "@workspace/schemas"

export default function AcademyQuizTemplateCreatePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const create = useCreateAcademyQuizTemplate()
    const profileId = searchParams.get("profileId")

    const handleSubmit = async (data: any) => {
        try {
            await create.mutateAsync(data as AcademyQuizTemplateCreateDTO)
            toast.success("Tạo Quiz Template thành công")
            if (profileId) {
                navigate(`/academy/course-profiles/${profileId}?tab=quizzes`)
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
                title="Tạo Quiz Template"
                subtitle="Thêm mẫu quiz mới cho Course Profile."
            />
            <QuizTemplateForm
                mode="create"
                initial={profileId ? { courseProfileId: profileId } as any : undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                    if (profileId) {
                        navigate(`/academy/course-profiles/${profileId}?tab=quizzes`)
                    } else {
                        navigate(-1)
                    }
                }}
                submitting={create.isPending}
            />
        </div>
    )
}
