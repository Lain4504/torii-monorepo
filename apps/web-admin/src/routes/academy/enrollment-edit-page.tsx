import { useNavigate, useParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import { EnrollmentForm } from "@/components/academy/enrollment-form"
import {
    useAcademyEnrollment,
    useUpdateAcademyEnrollment,
} from "@/lib/api/services/academy-enrollments"
import type { AcademyEnrollmentUpdateDTO } from "@workspace/schemas"
import { Spinner } from "@workspace/ui/components/spinner"

export default function AcademyEnrollmentEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: initial, isLoading } = useAcademyEnrollment(id)
    const update = useUpdateAcademyEnrollment()

    const handleSubmit = async (data: any) => {
        if (!id) return
        try {
            await update.mutateAsync({ id, input: data as AcademyEnrollmentUpdateDTO })
            toast.success("Cập nhật thành công")
            navigate("/academy/enrollments")
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi cập nhật")
        }
    }

    if (isLoading) return <Spinner />

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sửa bản ghi ghi danh"
                subtitle={`Học viên: ${initial?.user?.displayName || id}`}
            />
            <EnrollmentForm
                mode="edit"
                initial={initial}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/academy/enrollments")}
                submitting={update.isPending}
            />
        </div>
    )
}
