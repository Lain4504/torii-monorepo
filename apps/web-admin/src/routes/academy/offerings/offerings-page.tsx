import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
    Plus,
    Search,
    FileEdit,
    Archive,
    Eye,
} from "lucide-react"
import {
    useAcademyCourseOfferings,
    type AcademyCourseOffering,
    useArchiveAcademyCourseOffering,
    useSubmitCourseOfferingForApproval
} from "@/lib/api/services/academy-course-offerings"
import { useDebounceValue } from "@workspace/ui/hooks/use-debounce-value"
import { OfferingSheet } from "./components/offering-sheet"
import { toast } from "@workspace/ui/components/sonner"
import { SendIcon } from "lucide-react"

const getOfferingStatusLabel = (status: string) => {
    switch (status) {
        case "PUBLISHED":
            return "Đang bán";
        case "PENDING_APPROVAL":
            return "Chờ duyệt";
        case "DRAFT":
            return "Bản nháp";
        case "REJECTED":
            return "Bị từ chối";
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
    const navigate = useNavigate()

    const { data: offerings, isLoading } = useAcademyCourseOfferings({
        q: debouncedSearch,
    })

    const archiveMutation = useArchiveAcademyCourseOffering()
    const submitForApprovalMutation = useSubmitCourseOfferingForApproval()

    const [archiveDialog, setArchiveDialog] = useState<{
        open: boolean
        offering: AcademyCourseOffering | null
    }>({ open: false, offering: null })

    const [submitDialog, setSubmitDialog] = useState<{
        open: boolean
        offering: AcademyCourseOffering | null
    }>({ open: false, offering: null })

    const handleCreate = () => {
        setSelectedOffering(null)
        setDialogOpen(true)
    }

    const handleEdit = (offering: AcademyCourseOffering) => {
        setSelectedOffering(offering)
        if (offering.status === 'PUBLISHED') {
            navigate(`/academy/course-offerings/${offering.id}/detail`)
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
                                                <Badge variant="outline" className="text-[10px]">{offering.classId ? 1 : 0} lớp</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                { (offering.status === 'DRAFT' || offering.status === 'REJECTED') && (
                                                    <Button 
                                                        variant="default" 
                                                        size="sm" 
                                                        className="h-8 gap-1.5 bg-primary hover:bg-primary/90"
                                                        onClick={() => {
                                                            if (offering.classId) {
                                                                setSubmitDialog({ open: true, offering })
                                                            } else {
                                                                toast.error("Vui lòng chọn lớp học (classId) trước khi gửi duyệt")
                                                            }
                                                        }}
                                                        disabled={submitForApprovalMutation.isPending}
                                                    >
                                                        <SendIcon className="h-3.5 w-3.5" /> Gửi duyệt
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => handleEdit(offering)}>
                                                    {offering.status === 'PUBLISHED' ? (
                                                        <><Eye className="h-4 w-4" /> Chi tiết</>
                                                    ) : (
                                                        <><FileEdit className="h-4 w-4" /> Sửa</>
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => setArchiveDialog({ open: true, offering })}
                                                    title="Lưu trữ"
                                                >
                                                    <Archive className="h-4 w-4" />
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

            <OfferingSheet
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                offering={selectedOffering}
            />

            {/* Archive Confirmation */}
            <AlertDialog 
                open={archiveDialog.open} 
                onOpenChange={(open) => !open && setArchiveDialog({ open: false, offering: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận lưu trữ</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn lưu trữ gói bán "{archiveDialog.offering?.title}"? 
                            Gói này sẽ không còn hiển thị cho học viên và không thể hồi phục trạng thái bán trực tiếp.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={() => {
                                if (archiveDialog.offering) {
                                    archiveMutation.mutate(archiveDialog.offering.id)
                                }
                            }}
                        >
                            Xác nhận lưu trữ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Submit Confirmation */}
            <AlertDialog 
                open={submitDialog.open} 
                onOpenChange={(open) => !open && setSubmitDialog({ open: false, offering: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Gửi duyệt gói bán</AlertDialogTitle>
                        <AlertDialogDescription>
                            Gói bán "{submitDialog.offering?.title}" sẽ được gửi cho bộ phận phê duyệt. 
                            Bạn sẽ không thể chỉnh sửa thông tin trong khi gói đang ở trạng thái chờ duyệt.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Kiểm tra lại</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => {
                                if (submitDialog.offering) {
                                    submitForApprovalMutation.mutate(submitDialog.offering.id)
                                }
                            }}
                        >
                            Xác nhận gửi duyệt
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
