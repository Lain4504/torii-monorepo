import { useNavigate, useSearchParams } from "react-router-dom"

import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { CourseEditionForm } from "@/components/academy/course-edition-form"
import { useCreateAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import type { AcademyCourseEditionCreateDTO } from "@workspace/schemas"

export default function AcademyCourseEditionCreatePage() {
  const nav = useNavigate()
  const create = useCreateAcademyCourseEdition()

  const [searchParams] = useSearchParams()
  const courseProfileId = searchParams.get("courseProfileId") ?? ""

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Course Edition"
        subtitle="Tạo phiên bản chương trình học (syllabus) cho một Course Profile."
      />

      <CourseEditionForm
        mode="create"
        initial={{ courseProfileId } as any}
        submitting={create.isPending}
        onCancel={() => nav(courseProfileId ? `/academy/course-profiles/${courseProfileId}?tab=editions` : "/academy/course-profiles")}
        onSubmit={async (data) => {
          await create.mutateAsync(data as AcademyCourseEditionCreateDTO)
          toast.success("Đã tạo Course Edition")
          nav(courseProfileId ? `/academy/course-profiles/${courseProfileId}?tab=editions` : "/academy/course-profiles")
        }}
      />
    </div>
  )
}

