import { useNavigate } from 'react-router-dom';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { BookOpen, GraduationCap, Calendar, FileQuestion } from 'lucide-react';
import type { QuestionPoolResponseDTO } from '@workspace/schemas';
import { ScrollArea } from '@workspace/ui/components/scroll-area';

interface ViewQuestionPoolDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pool: QuestionPoolResponseDTO | null;
    onEdit: (pool: QuestionPoolResponseDTO) => void;
}

export function ViewQuestionPoolDialog({ open, onOpenChange, pool, onEdit }: ViewQuestionPoolDialogProps) {
    const navigate = useNavigate();

    if (!pool) return null;

    const handleViewQuestions = () => {
        onOpenChange(false);
        navigate(`/question-bank/pools/${pool.id}/questions`);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chi Tiết Kho Đề</SheetTitle>
                    <SheetDescription>
                        Thông tin định danh & Phân loại kho đề.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary opacity-60">
                                <BookOpen className="size-4" />
                                <h3 className="text-xs font-bold uppercase tracking-wider">Thông tin hiển thị</h3>
                            </div>
                            <div className="space-y-4 p-6 rounded-2xl bg-muted/5 border border-border/80 shadow-sm transition-all hover:bg-muted/10">
                                <div>
                                    <h4 className="text-xl font-bold text-foreground mb-2">{pool.name}</h4>
                                    {pool.description ? (
                                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                                            "{pool.description}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/50 italic">Chưa có mô tả chi tiết cho kho đề này.</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <Separator className="opacity-50" />

                        <div className="grid grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary opacity-60">
                                    <GraduationCap className="size-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Trình độ chuyên môn</h3>
                                </div>
                                <div className="flex flex-col gap-1.5 ml-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Cấp độ JLPT</p>
                                    <div>
                                        {pool.jlptLevel ? (
                                            <Badge variant="secondary">
                                                {pool.jlptLevel}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm font-medium text-muted-foreground/40 italic">Chưa thiết lập</span>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary opacity-60">
                                    <Calendar className="size-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Dữ liệu hệ thống</h3>
                                </div>
                                <div className="flex flex-col gap-1.5 ml-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ngày khởi tạo</p>
                                    <p className="text-sm font-bold text-foreground">
                                        {new Date(pool.createdAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </section>
                        </div>

                        <Separator className="opacity-50" />

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary opacity-60">
                                <GraduationCap className="size-4" />
                                <h3 className="text-xs font-bold uppercase tracking-wider">Liên kết giáo trình</h3>
                            </div>
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Khóa học liên quan:</span>
                                {pool.courseId ? (
                                    <Badge variant="default">
                                        Đã liên kết
                                    </Badge>
                                ) : (
                                    <span className="text-xs font-medium text-muted-foreground/40 italic">Chưa liên kết khóa học</span>
                                )}
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <SheetFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            onEdit(pool);
                        }}>
                        Chỉnh sửa
                    </Button>
                    <Button
                        onClick={handleViewQuestions}>
                        <FileQuestion className="h-4 w-4 mr-2" />
                        Xem Câu Hỏi
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

