import { useState } from "react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    Plus,
    Search,
    FileEdit,
    Archive,
    CheckCircle2,
    Eye,
} from "lucide-react"
import {
    useAcademyCourseOfferings,
    type AcademyCourseOffering,
    useSubmitCourseOfferingForApproval,
    useApproveCourseOffering,
    useRejectCourseOffering,
    useArchiveAcademyCourseOffering
} from "@/lib/api/services/academy-course-offerings"
import { useDebounceValue } from "@workspace/ui/hooks/use-debounce-value"
import { OfferingDialog } from "./components/offering-dialog"
import { OfferingDetailDialog } from "./components/offering-detail-dialog"

const getOfferingStatusLabel = (status: string) => {
    switch (status) {
        case "PUBLISHED":
            return "Đang bán";
        case "PENDING_APPROVAL":
            return "Chờ duyệt";
        case "DRAFT":
            return "Bản nháp";
        case "ARCHIVED":
            return "Đã lưu trữ";
        default:
            return status;
    }
};

export default function OfferingsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch] = useDebounceValue(searchTerm, 500)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedOffering, setSelectedOffering] = useState<AcademyCourseOffering | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)

    const { data: offerings, isLoading } = useAcademyCourseOfferings({
        q: debouncedSearch,
    })

    const submitForApprovalMutation = useSubmitCourseOfferingForApproval()
    const approveMutation = useApproveCourseOffering()
    const rejectMutation = useRejectCourseOffering()
    const archiveMutation = useArchiveAcademyCourseOffering()

    const handleCreate = () => {
        setSelectedOffering(null)
        setDialogOpen(true)
    }

    const handleEdit = (offering: AcademyCourseOffering) => {
        setSelectedOffering(offering)
        if (offering.status === 'PUBLISHED') {
            setDetailDialogOpen(true)
        } else {
            setDialogOpen(true)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gói bán & giá khóa học"
                subtitle="Quản lý các gói sản phẩm thương mại, thiết lập giá và liên kết lớp học."
                actions={
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tạo gói bán mới
                    </Button>
                }
            />

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm mã hoặc tên gói..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12">STT</TableHead>
                                <TableHead className="w-[120px]">Mã</TableHead>
                                <TableHead>Tên gói bán</TableHead>
                                <TableHead>Giá (VND)</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Lớp liên kết</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : offerings?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        Không tìm thấy gói bán nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                offerings?.map((offering, index) => (
                                    <TableRow key={offering.id} className="group transition-colors">
                                        <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                        <TableCell className="font-mono text-xs font-bold">{offering.code}</TableCell>
                                        <TableCell className="font-medium">{offering.title}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{Number(offering.price).toLocaleString()}₫</span>
                                                {offering.originalPrice && Number(offering.originalPrice) > Number(offering.price) && (
                                                    <span className="text-xs text-muted-foreground line-through">{Number(offering.originalPrice).toLocaleString()}₫</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    offering.status === 'PUBLISHED'
                                                        ? 'default'
                                                        : offering.status === 'PENDING_APPROVAL'
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                            >
                                                {getOfferingStatusLabel(offering.status as any)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="text-[10px]">{offering.classes?.length || 0} lớp</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => handleEdit(offering)}>
                                                    {offering.status === 'PUBLISHED' ? (
                                                        <><Eye className="h-4 w-4" /> Chi tiết</>
                                                    ) : (
                                                        <><FileEdit className="h-4 w-4" /> Sửa</>
                                                    )}
                                                </Button>
                                                {offering.status === 'DRAFT' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-yellow-600 border-yellow-500/40"
                                                        onClick={() => submitForApprovalMutation.mutate(offering.id)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" /> Gửi duyệt
                                                    </Button>
                                                )}
                                                {offering.status === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-green-600 border-green-500/40"
                                                            onClick={() => approveMutation.mutate(offering.id)}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" /> Phê duyệt
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-destructive border-destructive/40"
                                                            onClick={() => {
                                                            const reason = window.prompt("Lý do từ chối:")
                                                            if (reason) rejectMutation.mutate({ id: offering.id, reason })
                                                        }}>
                                                            <Archive className="h-4 w-4" /> Từ chối
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 text-destructive border-destructive/40 hover:text-destructive hover:bg-destructive/5"
                                                    onClick={() => archiveMutation.mutate(offering.id)}
                                                >
                                                    <Archive className="h-4 w-4" /> Lưu trữ
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <OfferingDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                offering={selectedOffering}
            />

            <OfferingDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                offering={selectedOffering}
            />
        </div>
    )
}
