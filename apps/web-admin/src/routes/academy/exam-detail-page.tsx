import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import {
    useAcademyExam,
    useAddQuestionsFromPool,
} from "@/lib/api/services/academy-exams"
import { useAcademyQuestionPools } from "@/lib/api/services/academy-question-pools"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@workspace/ui/components/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ArrowLeft, Layers, WalletCards } from "lucide-react"

export default function AcademyExamDetailPage() {
    const { id } = useParams()
    const { data: exam, isLoading } = useAcademyExam(id)
    const { data: pools = [] } = useAcademyQuestionPools({})
    const addFromPool = useAddQuestionsFromPool()

    const [selectedSection, setSelectedSection] = useState<string>("")
    const [selectedPool, setSelectedPool] = useState<string>("")
    const [count, setCount] = useState<string>("5")
    const [isAddingFromPool, setIsAddingFromPool] = useState(false)

    const hAddFromPool = async () => {
        if (!id || !selectedSection || !selectedPool) return
        try {
            await addFromPool.mutateAsync({
                examId: id,
                sectionId: selectedSection,
                poolId: selectedPool,
                count: parseInt(count),
            })
            toast.success(`Đã thêm ${count} câu hỏi từ pool`)
            setIsAddingFromPool(false)
        } catch (e: any) {
            toast.error(e?.message || "Lỗi khi thêm câu hỏi")
        }
    }

    if (isLoading) return <div>Đang tải...</div>
    if (!exam) return <div>Không tìm thấy Exam</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/academy/exams" className="hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="size-4" /> Danh sách Exam
                </Link>
            </div>

            <PageHeader
                title={exam.title}
                subtitle={`Loại: ${exam.examType} · Cấu trúc và câu hỏi.`}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to={`/academy/exams/${id}/edit`}>Sửa thông tin</Link>
                        </Button>
                        <Dialog open={isAddingFromPool} onOpenChange={setIsAddingFromPool}>
                            <DialogTrigger asChild>
                                <Button variant="secondary">
                                    <WalletCards className="mr-2 h-4 w-4" /> Lấy từ Pool
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Thêm câu hỏi ngẫu nhiên từ Pool</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Chọn Section</label>
                                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn section mục tiêu..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exam.sections?.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Chọn Pool</label>
                                        <Select value={selectedPool} onValueChange={setSelectedPool}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn nguồn câu hỏi..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pools.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Số lượng câu hỏi</label>
                                        <Input
                                            type="number"
                                            value={count}
                                            onChange={(e) => setCount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddingFromPool(false)}>Hủy</Button>
                                    <Button
                                        onClick={hAddFromPool}
                                        disabled={!selectedSection || !selectedPool || addFromPool.isPending}
                                    >
                                        Xác nhận thêm
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            <div className="space-y-8">
                {(exam.sections?.length ?? 0) > 0 ? (
                    exam.sections?.map((section: any) => (
                        <Card key={section.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Layers className="size-4 text-primary" /> {section.title}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">{section.instruction || "Không có hướng dẫn."}</p>
                                </div>
                                <Badge variant="outline">{section.sectionType}</Badge>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">TT</TableHead>
                                            <TableHead>Câu hỏi</TableHead>
                                            <TableHead>Loại</TableHead>
                                            <TableHead className="text-right">Điểm</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(exam.examQuestions?.filter((eq: any) => eq.sectionId === section.id).length ?? 0) > 0 ? (
                                            exam.examQuestions
                                                ?.filter((eq: any) => eq.sectionId === section.id)
                                                .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                                                .map((eq: any, idx: number) => (
                                                    <TableRow key={eq.id}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell className="max-w-md truncate">
                                                            {eq.question?.content || "ID: " + eq.questionId}
                                                        </TableCell>
                                                        <TableCell>{eq.question?.questionType}</TableCell>
                                                        <TableCell className="text-right font-mono">{eq.points}</TableCell>
                                                    </TableRow>
                                                ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground italic">
                                                    Chưa có câu hỏi trong phần này.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="p-12 border-2 border-dashed rounded-lg text-center space-y-4">
                        <p className="text-muted-foreground">Đề thi này chưa có section nào.</p>
                        <Button variant="outline" asChild>
                            <Link to={`/academy/exams/${id}/edit`}>Cấu hình Sections trong Edit Info</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
