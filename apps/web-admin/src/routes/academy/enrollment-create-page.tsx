import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import { EnrollmentForm } from "@/components/academy/enrollment-form"
import { useCreateAcademyEnrollment } from "@/lib/api/services/academy-enrollments"
import type { AcademyEnrollmentCreateDTO } from "@workspace/schemas"

export default function AcademyEnrollmentCreatePage() {
    const navigate = useNavigate()
    const create = useCreateAcademyEnrollment()

    const handleSubmit = async (data: any) => {
        try {
            await create.mutateAsync(data as AcademyEnrollmentCreateDTO)
            toast.success("Ghi danh học viên thành công")
            navigate("/academy/enrollments")
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi ghi danh")
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Ghi danh học viên"
                subtitle="Thêm học viên vào lớp học mới."
            />
            <EnrollmentForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={() => navigate("/academy/enrollments")}
                submitting={create.isPending}
            />
        </div>
    )
}
