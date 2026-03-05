import { useState } from 'react';
import { useCourses, useReviewSyllabus } from '@/lib/api/services/courses';
import { useCourseModules } from '@/lib/api/services/modules';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { PageHeader } from '@/components/common/page-header';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Spinner } from "@workspace/ui/components/spinner";
import { toast } from '@workspace/ui/components/sonner';
import { CheckCircle2, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import { formatDateTime } from '@/lib/format-utils';
import { CourseMasterStatus } from '@workspace/schemas';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Textarea } from '@workspace/ui/components/textarea';

export default function SyllabusReviewPage() {
    const [page, setPage] = useState(1);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
    const [comment, setComment] = useState('');

    const { data: coursesData, isLoading } = useCourses({
        page,
        limit: 10,
        status: CourseMasterStatus.PENDING_REVIEW
    });

    const { data: modules } = useCourseModules(selectedCourseId || '');
    const reviewMutation = useReviewSyllabus();

    const handleReview = async (outcome: 'APPROVED' | 'CHANGES_REQUIRED' | 'REJECTED') => {
        if (!selectedCourseId) return;

        try {
            await reviewMutation.mutateAsync({
                id: selectedCourseId,
                payload: {
                    outcome,
                    comments: comment
                }
            });
            toast.success(outcome === 'APPROVED' ? 'Đã phê duyệt giáo trình!' : 'Đã gửi yêu cầu chỉnh sửa');
            setReviewSheetOpen(false);
            setComment('');
            setSelectedCourseId(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý phản hồi');
        }
    };

    const openReview = (courseId: string) => {
        setSelectedCourseId(courseId);
        setReviewSheetOpen(true);
    };

    const courses = coursesData?.data || [];

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Hành lang Phê duyệt Syllabus"
                subtitle="Kiểm duyệt và thẩm định chất lượng khung chương trình đào tạo Torii"
                stats={[
                    { label: "Đang chờ duyệt", value: coursesData?.total || 0 }
                ]}
            />

            <div className="space-y-4">
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Khung chương trình</TableHead>
                                    <TableHead>Giảng viên biên soạn</TableHead>
                                    <TableHead>Ngày gửi</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Spinner className="size-8" />
                                                <p className="text-sm text-muted-foreground animate-pulse">Đang truy xuất danh sách chờ duyệt...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : courses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                                                <CheckCircle2 className="size-12" />
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold uppercase tracking-tight">Tuyệt vời!</p>
                                                    <p className="text-sm">Hiện không có yêu cầu phê duyệt giáo trình nào đang chờ.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    courses.map((course) => (
                                        <TableRow key={course.id} className="group hover:bg-primary/5 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">{course.title}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">ID: {course.id.slice(0, 8)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {(course.lecturer?.displayName?.[0] || 'L').toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium">{course.lecturer?.displayName || 'Chưa gán'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground tabular-nums">
                                                {formatDateTime(course.updatedAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[9px] font-black tracking-widest px-2 py-0.5 shadow-sm">
                                                    {course.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openReview(course.id)}
                                                    className="font-bold uppercase tracking-widest text-[10px] h-8 px-4"
                                                >
                                                    Thẩm định
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex justify-center border-t pt-4">
                    <SmartPagination
                        page={page}
                        totalPages={coursesData?.totalPages || 1}
                        totalItems={coursesData?.total || 0}
                        onPageChange={setPage}
                        itemName="yêu cầu"
                    />
                </div>
            </div>

            {/* Review Flow Sheet */}
            <Sheet open={reviewSheetOpen} onOpenChange={setReviewSheetOpen}>
                <SheetContent className="w-full sm:max-w-[1000px] flex flex-col p-0 border-l-0">
                    <SheetHeader className="p-8 border-b bg-muted/5">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 uppercase text-[9px] font-black tracking-[0.2em] px-2 py-0.5">Syllabus Audit</Badge>
                                <span className="text-[10px] text-muted-foreground font-mono">v1.0.4-pending</span>
                            </div>
                            <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                Phê duyệt <span className="text-primary italic">Khung chương trình</span>
                            </SheetTitle>
                            <SheetDescription>
                                Thẩm định chuyên môn và cấu trúc nội dung trước khi phát hành chính thức.
                            </SheetDescription>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Left: Curriculum Tree */}
                        <div className="w-[450px] border-r bg-muted/5 flex flex-col">
                            <div className="p-4 border-b bg-background/50 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cấu trúc đề xuất</span>
                                <Badge variant="outline" className="text-[9px]">{modules?.length || 0} Modules</Badge>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-3">
                                    {modules?.map((m, idx) => (
                                        <div key={m.id} className="group">
                                            <div className="p-4 rounded-xl border bg-background hover:border-primary/50 transition-all cursor-default shadow-sm group-hover:shadow-md">
                                                <div className="flex items-start gap-3">
                                                    <div className="size-7 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10 shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[13px] font-bold text-foreground leading-tight truncate">{m.title}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <div className="flex items-center gap-1">
                                                                <BookOpen className="size-3 text-muted-foreground/60" />
                                                                <span className="text-[10px] text-muted-foreground/60 font-medium">-- bài học</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <AlertCircle className="size-3 text-muted-foreground/60" />
                                                                <span className="text-[10px] text-muted-foreground/60 font-medium">-- nội dung</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Right: Review Actions */}
                        <div className="flex-1 flex flex-col bg-background">
                            <ScrollArea className="flex-1">
                                <div className="p-8 space-y-10">
                                    {/* Summary Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 rounded-2xl border bg-muted/5 flex flex-col gap-1 items-center justify-center text-center">
                                            <span className="text-4xl font-black text-primary leading-none tabular-nums">{modules?.length || 0}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Học phần</span>
                                        </div>
                                        <div className="p-6 rounded-2xl border bg-muted/5 flex flex-col gap-1 items-center justify-center text-center">
                                            <span className="text-4xl font-black text-primary leading-none tabular-nums">--</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Bài học/Quiz</span>
                                        </div>
                                    </div>

                                    {/* Feedback Section */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Phản hồi kiểm duyệt</h3>
                                            <p className="text-xs text-muted-foreground">Nhận xét chuyên môn để giảng viên hoàn thiện Syllabus.</p>
                                        </div>
                                        <Textarea
                                            placeholder="Ghi chú các điểm cần cải thiện, lỗi nội dung hoặc cấu trúc bài học..."
                                            className="min-h-[250px] resize-none border-dashed bg-muted/10 focus:bg-background transition-all rounded-2xl p-4 text-sm"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Sticky Footer */}
                            <div className="p-6 border-t bg-muted/5">
                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                        onClick={() => handleReview('REJECTED')}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <XCircle className="size-4 mr-2" />
                                        Từ chối
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                        onClick={() => handleReview('CHANGES_REQUIRED')}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <AlertCircle className="size-4 mr-2" />
                                        Cần sửa lại
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-[10px]"
                                        onClick={() => handleReview('APPROVED')}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <CheckCircle2 className="size-4 mr-2" />
                                        Phê duyệt
                                    </Button>
                                </div>
                                {reviewMutation.isPending && (
                                    <div className="mt-4 flex items-center justify-center gap-2">
                                        <Spinner className="size-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Đang xử lý kết quả...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
