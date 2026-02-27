import { useState } from 'react';
import { useUpdateCourse, useCourse } from '@/lib/api/services/courses';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyMedia,
    EmptyTitle,
} from '@workspace/ui/components/empty';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { Spinner } from '@workspace/ui/components/spinner';

import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { User as UserIcon, Trash2, Plus } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { toast } from '@workspace/ui/components/sonner';
import { type CourseResponseDTO, UserRole } from '@workspace/schemas';
import { useUsers } from '@/lib/api/services/users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Field, FieldLabel } from '@workspace/ui/components/field';


interface ManageInstructorsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
}

export function ManageInstructorsSheet({ open, onOpenChange, course }: ManageInstructorsSheetProps) {
    const [selectedLecturerId, setSelectedLecturerId] = useState<string>('');
    const { data: freshCourse, isLoading: loadingCourse } = useCourse(course?.id || '');
    const { data: usersData } = useUsers({ page: 1, limit: 100, search: '' });
    const updateMutation = useUpdateCourse();

    const currentLecturer = freshCourse?.lecturer;

    // Filter only lecturers from users
    const lecturers = (usersData?.data || []).filter((user: any) => user.role === UserRole.LECTURER);

    // Filter lecturers not already assigned
    const availableLecturers = lecturers.filter((l: any) => l.id !== freshCourse?.lecturerId);

    const handleAssign = async () => {
        if (!course || !selectedLecturerId) return;

        try {
            await updateMutation.mutateAsync({
                id: course.id,
                course: { lecturerId: selectedLecturerId },
            });
            toast.success('Đã phân công giảng viên', {
                description: 'Giảng viên đã được gán cho khóa học thành công.',
            });
            setSelectedLecturerId('');
        } catch (error: any) {
            toast.error('Phân công thất bại', {
                description: error.response?.data?.message || 'Không thể phân công giảng viên.',
            });
        }
    };

    const handleUnassign = async () => {
        if (!course) return;

        try {
            await updateMutation.mutateAsync({
                id: course.id,
                course: { lecturerId: null },
            });
            toast.success('Đã gỡ bỏ giảng viên', {
                description: 'Giảng viên đã được gỡ khỏi khóa học.',
            });
        } catch (error: any) {
            toast.error('Gỡ bỏ thất bại', {
                description: error.response?.data?.message || 'Không thể gỡ bỏ giảng viên.',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                {!course ? (
                    <div className="flex-1 flex items-center justify-center min-h-0">
                        <Spinner className="h-8 w-8 text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <SheetHeader>
                            <SheetTitle>Quản lý Giảng viên</SheetTitle>
                            <SheetDescription>
                                Phân công cho khóa học {course.title}
                            </SheetDescription>
                        </SheetHeader>

                        <ScrollArea className="flex-1 min-h-0">
                            <div className="space-y-6 p-6">

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold">
                                        Giảng viên hiện tại
                                    </h3>

                                    {loadingCourse ? (
                                        <div className="flex items-center justify-center py-12 rounded-3xl border border-border/40 bg-muted/5">
                                            <Spinner className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                    ) : !currentLecturer ? (
                                        <Empty>
                                            <EmptyMedia>
                                                <UserIcon className="h-10 w-10 text-muted-foreground/20" />
                                            </EmptyMedia>
                                            <EmptyContent>
                                                <EmptyTitle>Chưa có giảng viên</EmptyTitle>
                                                <EmptyDescription>
                                                    Vui lòng phân công giảng viên bên dưới
                                                </EmptyDescription>
                                            </EmptyContent>
                                        </Empty>
                                    ) : (
                                        <div className="space-y-3">
                                            <div
                                                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:bg-muted/30 transition-all group shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border border-border/20 rounded-lg">
                                                        <AvatarImage src={currentLecturer.avatarUrl || undefined} />
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold rounded-lg">
                                                            {currentLecturer.displayName?.charAt(0) || 'L'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-foreground">{currentLecturer.displayName}</p>
                                                            <Badge variant="default" className="h-4 px-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                                Chủ nhiệm
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground/60 font-medium">{currentLecturer.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                                                        onClick={handleUnassign}
                                                        disabled={updateMutation.isPending}
                                                        title="Gỡ bỏ giảng viên">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!freshCourse?.lecturerId && (
                                    <div className="space-y-6 pt-6 border-t border-border/40">
                                        <div className="space-y-4">
                                            <Field className="space-y-2.5">
                                                <FieldLabel htmlFor="lecturer-select" className="text-xs font-bold text-muted-foreground/70 ml-1 uppercase tracking-wider">Phân công giảng viên</FieldLabel>
                                                <Select
                                                    value={selectedLecturerId}
                                                    onValueChange={setSelectedLecturerId}
                                                >
                                                    <SelectTrigger id="lecturer-select" className="">
                                                        <SelectValue placeholder="Chọn giảng viên..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableLecturers.map((lecturer) => (
                                                            <SelectItem key={lecturer.id} value={lecturer.id} className="rounded-lg cursor-pointer text-xs font-medium py-2.5 focus:bg-primary/5 focus:text-primary">
                                                                <span className="mr-2">{lecturer.displayName}</span>
                                                                <span className="text-[10px] text-muted-foreground opacity-50 lowercase">{lecturer.email}</span>
                                                            </SelectItem>
                                                        ))}
                                                        {availableLecturers.length === 0 && (
                                                            <div className="p-4 text-center">
                                                                <p className="text-xs text-muted-foreground/60 italic">Không có giảng viên khả dụng</p>
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </Field>

                                            <Button
                                                onClick={handleAssign}
                                                disabled={!selectedLecturerId || updateMutation.isPending}
                                                className="w-full rounded-xl h-11 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all">
                                                {updateMutation.isPending ? (
                                                    <>
                                                        <Spinner className="mr-2 h-3.5 w-3.5" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="mr-2 h-3.5 w-3.5" />
                                                        Phân công
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
