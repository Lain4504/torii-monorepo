import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { CourseProfileForm } from "@/components/academy/course-profile-form"
import { useCreateAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import type { AcademyCourseProfileCreateDTO } from "@workspace/schemas"
import { useNavigate } from "react-router-dom"

export default function AcademyCourseProfileCreatePage() {
  const nav = useNavigate()
  const create = useCreateAcademyCourseProfile()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Course Profile"
        subtitle="Tạo khóa học trừu tượng (ví dụ: JLPT N5)."
      />

      <CourseProfileForm
        mode="create"
        submitting={create.isPending}
        onCancel={() => nav("/academy/course-profiles")}
        onSubmit={async (data) => {
          await create.mutateAsync(data as AcademyCourseProfileCreateDTO)
          toast.success("Đã tạo Course Profile")
          nav("/academy/course-profiles")
        }}
      />
    </div>
  )
}

