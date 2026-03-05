import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
    useAcademyAssignmentTemplates,
    useDeleteAcademyAssignmentTemplate,
} from "@/lib/api/services/academy-assignment-templates"

export default function AcademyAssignmentTemplatesPage() {
    const [courseProfileId, setCourseProfileId] = useState("")
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const query = useMemo(
        () => ({
            courseProfileId: courseProfileId || undefined,
        }),
        [courseProfileId],
    )

    const { data = [], isLoading } = useAcademyAssignmentTemplates(query)
    const del = useDeleteAcademyAssignmentTemplate()

    return (
        <div className="space-y-6">
            <PageHeader
                title="Academy · Assignment Templates"
                subtitle="Quản lý các mẫu bài tập dùng chung cho CourseProfile."
                actions={
                    <Button asChild>
                        <Link to="/academy/assignment-templates/new">Tạo mới</Link>
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách</CardTitle>
                    <div className="flex flex-col gap-2 md:flex-row">
                        <Input
                            value={courseProfileId}
                            onChange={(e) => setCourseProfileId(e.target.value)}
                            placeholder="Filter CourseProfileId (uuid)"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Max Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4}>Đang tải...</TableCell>
                                </TableRow>
                            ) : data.length ? (
                                data.map((it) => (
                                    <TableRow key={it.id}>
                                        <TableCell className="font-medium">{it.title}</TableCell>
                                        <TableCell>{it.defaultType}</TableCell>
                                        <TableCell>{it.defaultMaxScore}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link to={`/academy/assignment-templates/${it.id}/edit`}>Sửa</Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={del.isPending}
                                                    onClick={() => setDeleteId(it.id)}
                                                >
                                                    Xoá
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4}>Chưa có dữ liệu</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xoá Assignment Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Thao tác này sẽ xoá vĩnh viễn Assignment Template và có thể ảnh hưởng đến ClassAssessment/Submission liên quan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!deleteId) return
                                try {
                                    await del.mutateAsync(deleteId)
                                    toast.success("Đã xoá")
                                } catch (e: any) {
                                    toast.error(e?.message || "Xoá thất bại")
                                } finally {
                                    setDeleteId(null)
                                }
                            }}
                        >
                            Xoá
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
