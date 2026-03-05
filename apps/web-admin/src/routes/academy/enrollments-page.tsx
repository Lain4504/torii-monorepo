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
    useAcademyEnrollments,
    useDeleteAcademyEnrollment,
} from "@/lib/api/services/academy-enrollments"
import { Badge } from "@workspace/ui/components/badge"
import {
    Search,
    User,
    School,
    Calendar,
    CheckCircle2,
    XCircle,
    Plus,
    Edit2,
    Trash2,
    Filter
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@workspace/ui/components/select"

export default function AcademyEnrollmentsPage() {
    const [classId, setClassId] = useState("")
    const [userId, setUserId] = useState("")
    const [status, setStatus] = useState("")
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const query = useMemo(
        () => ({
            classId: classId || undefined,
            userId: userId || undefined,
            status: status || undefined,
        }),
        [classId, userId, status],
    )

    const { data = [], isLoading } = useAcademyEnrollments(query)
    const del = useDeleteAcademyEnrollment()

    return (
        <div className="space-y-6">
            <PageHeader
                title="Academy · Enrollments"
                subtitle="Quản lý học viên tham gia các lớp học, theo dõi trạng thái ghi danh."
                actions={
                    <Button asChild className="gap-2">
                        <Link to="/academy/enrollments/new">
                            <Plus className="h-4 w-4" /> Ghi danh học viên
                        </Link>
                    </Button>
                }
            />

            <Card className="border-muted/40 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider">Bộ lọc & Tìm kiếm</CardTitle>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                placeholder="Mã Lớp học..."
                                className="pl-9"
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="ID Học viên..."
                                className="pl-9"
                            />
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Trạng thái: Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                <SelectItem value="ACTIVE">Active (Đang học)</SelectItem>
                                <SelectItem value="COMPLETED">Completed (Hoàn thành)</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled (Đã huỷ)</SelectItem>
                                <SelectItem value="EXPIRED">Expired (Hết hạn)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => { setClassId(""); setUserId(""); setStatus(""); }} className="text-muted-foreground">
                            Xoá bộ lọc
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[300px]">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" /> Học viên
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <School className="h-3.5 w-3.5" /> Lớp học
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" /> Ngày ghi danh
                                    </div>
                                </TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5}>Đang tải...</TableCell>
                                </TableRow>
                            ) : data.length ? (
                                data.map((it) => (
                                    <TableRow key={it.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{it.user?.displayName || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{it.user?.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{it.class?.name || 'Unknown'}</span>
                                                <Badge variant="outline" className="w-fit text-[10px] py-0 font-mono mt-1">
                                                    {it.class?.code}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">
                                            {new Date(it.enrolledAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={it.status === 'ACTIVE' ? 'default' : it.status === 'COMPLETED' ? 'secondary' : 'outline'}
                                                className={it.status === 'ACTIVE' ? "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white" : ""}
                                            >
                                                {it.status === 'ACTIVE' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                {it.status === 'CANCELLED' && <XCircle className="h-3 w-3 mr-1" />}
                                                {it.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" asChild title="Chỉnh sửa">
                                                    <Link to={`/academy/enrollments/${it.id}/edit`}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={del.isPending}
                                                    onClick={() => setDeleteId(it.id)}
                                                    title="Huỷ ghi danh"
                                                    className="text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5}>Chưa có dữ liệu</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Huỷ ghi danh</AlertDialogTitle>
                        <AlertDialogDescription>
                            Thao tác này sẽ xoá bản ghi enrollment. Học viên sẽ không thể tiếp tục học lớp này.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!deleteId) return
                                try {
                                    await del.mutateAsync(deleteId)
                                    toast.success("Đã huỷ ghi danh")
                                } catch (e: any) {
                                    toast.error(e?.message || "Thao tác thất bại")
                                } finally {
                                    setDeleteId(null)
                                }
                            }}
                        >
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
