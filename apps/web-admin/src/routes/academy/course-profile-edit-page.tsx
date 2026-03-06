import { useNavigate, useParams } from "react-router-dom"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { CourseProfileForm } from "@/components/academy/course-profile-form"
import {
  useAcademyCourseProfile,
  useUpdateAcademyCourseProfile,
} from "@/lib/api/services/academy-course-profiles"
import type { AcademyCourseProfileUpdateDTO } from "@workspace/schemas"

export default function AcademyCourseProfileEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyCourseProfile(id)
  const update = useUpdateAcademyCourseProfile()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Course Profile"
        subtitle="Chỉnh sửa thông tin khóa học trừu tượng."
      />

      {isLoading || !item ? (
        <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
      ) : (
        <CourseProfileForm
          mode="edit"
          initial={item}
          submitting={update.isPending}
          onCancel={() => nav("/academy/course-profiles")}
          onSubmit={async (data) => {
            await update.mutateAsync({
              id: item.id,
              input: data as AcademyCourseProfileUpdateDTO,
            })
            toast.success("Đã cập nhật")
            nav("/academy/course-profiles")
          }}
        />
      )}
    </div>
  )
}

