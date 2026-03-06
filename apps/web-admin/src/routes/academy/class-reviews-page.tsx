import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { format } from "date-fns"
import { academyClassReviewsAdminHooks } from "@/lib/api/services/academy-class-reviews"
import { StarIcon, CheckCircle2, XCircle, EyeOff } from "lucide-react"

export default function AcademyClassReviewsPage() {
    const [status, setStatus] = useState<string>("_all")
    const [rating, setRating] = useState<string>("_all")

    // query state
    const query = {
        status: status !== "_all" ? status : undefined,
        rating: rating !== "_all" ? Number(rating) : undefined,
        limit: 20,
        offset: 0,
    }

    const { data: axiosResponse, isLoading } = academyClassReviewsAdminHooks.useListReviews(query)
    const items = axiosResponse?.data?.data?.items || []

    const moderateMutation = academyClassReviewsAdminHooks.useModerateReview()

    // Moderate Dialog state
    const [moderateReview, setModerateReview] = useState<any>(null)
    const [moderationReason, setModerationReason] = useState("")

    const handleModerate = async (action: "publish" | "reject" | "hide") => {
        if (!moderateReview) return
        try {
            await moderateMutation.mutateAsync({
                id: moderateReview.id,
                dto: { action, reason: moderationReason },
            })
            toast.success(`Review successfully ${action}ed`)
            setModerateReview(null)
            setModerationReason("")
        } catch (e: any) {
            toast.error(e?.userMessage || "Moderation failed")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED":
                return <Badge variant="default" className="bg-green-600">Published</Badge>
            case "PENDING":
                return <Badge variant="secondary" className="bg-yellow-500 text-yellow-950 hover:bg-yellow-500">Pending</Badge>
            case "HIDDEN":
                return <Badge variant="outline" className="text-muted-foreground">Hidden</Badge>
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto w-full">
            <PageHeader
                title="Class Reviews"
                subtitle="Quản lý và duyệt đánh giá lớp học của học viên."
            />

            <Card>
                <CardHeader className="space-y-2">
                    <CardTitle>Danh sách Đánh giá</CardTitle>
                    <div className="flex flex-col gap-4 md:grid md:grid-cols-4">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_all">Tất cả Trạng thái</SelectItem>
                                <SelectItem value="PENDING">Pending (Chờ duyệt)</SelectItem>
                                <SelectItem value="PUBLISHED">Published (Đã duyệt)</SelectItem>
                                <SelectItem value="REJECTED">Rejected (Bị từ chối)</SelectItem>
                                <SelectItem value="HIDDEN">Hidden (Đã ẩn)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={rating} onValueChange={setRating}>
                            <SelectTrigger>
                                <SelectValue placeholder="Số sao" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_all">Tất cả</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Review</TableHead>
                                <TableHead>Context</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Đang tải...</TableCell>
                                </TableRow>
                            ) : items.length > 0 ? (
                                items.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="align-top py-4">
                                            <div className="space-y-1 max-w-[400px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-amber-500">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <StarIcon
                                                                key={i}
                                                                className={`size-4 ${i < item.rating ? "fill-current" : "text-muted-foreground/30"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    {item.title && <span className="font-medium text-sm">{item.title}</span>}
                                                </div>
                                                <p className="text-sm text-foreground/80 break-words line-clamp-2" title={item.content}>
                                                    {item.content || <span className="italic text-muted-foreground">Không có nội dung chi tiết</span>}
                                                </p>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">Học viên: {item.isAnonymous ? "Ẩn danh" : item.user?.displayName || item.user?.email || "Unknown"}</div>
                                                <div className="text-sm text-muted-foreground">Lớp: <span className="font-mono text-xs text-primary">{item.class?.name || "Unknown"}</span></div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-4">
                                            {getStatusBadge(item.status)}
                                        </TableCell>
                                        <TableCell className="align-top py-4 text-right">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setModerateReview(item)}
                                            >
                                                Kiểm duyệt
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                        Không tìm thấy dữ liệu.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!moderateReview} onOpenChange={(o) => (!o ? setModerateReview(null) : undefined)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Kiểm duyệt đánh giá</DialogTitle>
                        <DialogDescription>
                            Xem xét nội dung đánh giá và quyết định trạng thái.
                        </DialogDescription>
                    </DialogHeader>

                    {moderateReview && (
                        <div className="space-y-4 my-2">
                            <div className="bg-muted p-4 rounded-md space-y-2">
                                <div className="flex text-amber-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <StarIcon
                                            key={i}
                                            className={`size-4 ${i < moderateReview.rating ? "fill-current" : "text-slate-300"}`}
                                        />
                                    ))}
                                </div>
                                {moderateReview.title && <div className="font-semibold">{moderateReview.title}</div>}
                                <p className="text-sm whitespace-pre-wrap">{moderateReview.content || "Không có nội dung."}</p>
                                <div className="text-xs text-muted-foreground pt-2">
                                    Bởi: {moderateReview.isAnonymous ? "Ẩn danh" : moderateReview.user?.displayName || moderateReview.user?.email || "N/A"}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Lý do kiểm duyệt (Tùy chọn, đặc biệt khi Reject/Hide)</label>
                                <Textarea
                                    placeholder="Nhập lý do nội bộ để tra cứu sau này..."
                                    value={moderationReason}
                                    onChange={(e) => setModerationReason(e.target.value)}
                                    className="resize-none h-24"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => handleModerate("hide")}
                            disabled={moderateMutation.isPending}
                        >
                            <EyeOff className="mr-2 size-4" /> Ẩn (Hide)
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleModerate("reject")}
                            disabled={moderateMutation.isPending}
                        >
                            <XCircle className="mr-2 size-4" /> Từ chối
                        </Button>
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleModerate("publish")}
                            disabled={moderateMutation.isPending}
                        >
                            <CheckCircle2 className="mr-2 size-4" /> Chấp nhận (Publish)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
