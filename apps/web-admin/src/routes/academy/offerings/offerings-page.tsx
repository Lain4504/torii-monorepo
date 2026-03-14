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
    Layers,
    DollarSign,
    CheckCircle2,
    Clock
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

export default function OfferingsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch] = useDebounceValue(searchTerm, 500)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedOffering, setSelectedOffering] = useState<AcademyCourseOffering | null>(null)

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
        setDialogOpen(true)
    }

    const stats = [
        { label: "Đang hoạt động", value: offerings?.filter(o => o.status === 'PUBLISHED').length || 0, icon: CheckCircle2, color: "text-green-500" },
        { label: "Chờ duyệt", value: offerings?.filter(o => o.status === 'PENDING_APPROVAL').length || 0, icon: Clock, color: "text-yellow-500" },
        { label: "Tổng số", value: offerings?.length || 0, icon: Layers, color: "text-blue-500" },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gói bán & Giá (Offerings)"
                subtitle="Quản lý các gói sản phẩm thương mại, thiết lập giá và liên kết lớp học."
                actions={
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tạo gói bán mới
                    </Button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-card border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                            <stat.icon className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm mã hoặc tên gói..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
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
                                        <Badge variant={
                                            offering.status === 'PUBLISHED' ? 'default' :
                                                offering.status === 'PENDING_APPROVAL' ? 'secondary' : 'outline'
                                        }>
                                            {offering.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="text-[10px]">{offering.classes?.length || 0} lớp</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 flex-wrap">
                                            <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={() => handleEdit(offering)}>
                                                <FileEdit className="h-4 w-4" /> Sửa
                                            </Button>
                                            {offering.status === 'DRAFT' && (
                                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-yellow-600" onClick={() => submitForApprovalMutation.mutate(offering.id)}>
                                                    <CheckCircle2 className="h-4 w-4" /> Gửi duyệt
                                                </Button>
                                            )}
                                            {offering.status === 'PENDING_APPROVAL' && (
                                                <>
                                                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-green-600" onClick={() => approveMutation.mutate(offering.id)}>
                                                        <CheckCircle2 className="h-4 w-4" /> Phê duyệt
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-destructive" onClick={() => {
                                                        const reason = window.prompt("Lý do từ chối:")
                                                        if (reason) rejectMutation.mutate({ id: offering.id, reason })
                                                    }}>
                                                        <Archive className="h-4 w-4" /> Từ chối
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="ghost" size="sm" className="h-8 gap-1.5" disabled title="Cập nhật giá">
                                                <DollarSign className="h-4 w-4" /> Giá
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => archiveMutation.mutate(offering.id)}>
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

            <OfferingDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                offering={selectedOffering}
            />
        </div>
    )
}
