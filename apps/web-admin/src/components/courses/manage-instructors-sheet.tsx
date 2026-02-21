import { useState } from 'react';
import { useBoolean } from '@workspace/ui/hooks/use-boolean';
import { useAssignLecturer, useCourseInstructors, useUnassignLecturer, useUpdatePrimaryInstructor } from '@/api/services/course-instructors';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Badge } from '@workspace/ui/components/badge';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Loader2, User as UserIcon, Trash2, Crown, Users, Plus } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { type CourseResponseDTO, UserRole, InstructorRole } from '@workspace/schemas';
import { useUsers } from '@/api/services/users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Field, FieldLabel } from '@workspace/ui/components/field';
import { cn } from '@workspace/ui/lib/utils';

interface ManageInstructorsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
}

export function ManageInstructorsSheet({ open, onOpenChange, course }: ManageInstructorsSheetProps) {
    const [selectedLecturerId, setSelectedLecturerId] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<InstructorRole>(InstructorRole.MAIN);
    const isPrimary = useBoolean(false);

    const { data: instructors, isLoading: loadingInstructors } = useCourseInstructors(course?.id || '');
    const { data: usersData } = useUsers({ page: 1, limit: 100, search: '' });
    const assignMutation = useAssignLecturer();
    const unassignMutation = useUnassignLecturer();
    const updatePrimaryMutation = useUpdatePrimaryInstructor();

    // Filter only lecturers from users
    const lecturers = (usersData?.data || []).filter((user: any) => user.role === UserRole.LECTURER);

    // Filter lecturers not already assigned
    const assignedLecturerIds = new Set(instructors?.map(i => i.lecturerId) || []);
    const availableLecturers = lecturers.filter((l: any) => !assignedLecturerIds.has(l.id));

    const handleAssign = async () => {
        if (!course || !selectedLecturerId) return;

        try {
            await assignMutation.mutateAsync({
                courseId: course.id,
                lecturerId: selectedLecturerId,
                role: selectedRole,
                isPrimary: isPrimary.value,
            });
            toast.success('Đã phân công giảng viên', {
                description: 'Giảng viên đã được thêm vào khóa học thành công.',
            });
            setSelectedLecturerId('');
            isPrimary.setFalse();
        } catch (error: any) {
            toast.error('Phân công thất bại', {
                description: error.response?.data?.message || 'Không thể phân công giảng viên.',
            });
        }
    };

    const handleUnassign = async (id: string) => {
        try {
            await unassignMutation.mutateAsync(id);
            toast.success('Đã gỡ bỏ giảng viên', {
                description: 'Giảng viên đã được gỡ khỏi khóa học.',
            });
        } catch (error: any) {
            toast.error('Gỡ bỏ thất bại', {
                description: error.response?.data?.message || 'Không thể gỡ bỏ giảng viên.',
            });
        }
    };

    const handleTogglePrimary = async (id: string, currentPrimary: boolean) => {
        try {
            await updatePrimaryMutation.mutateAsync({
                id,
                dto: { isPrimary: !currentPrimary },
            });
            toast.success('Cập nhật quyền hạn', {
                description: `Trạng thái chủ nhiệm đã được ${!currentPrimary ? 'cấp' : 'thu hồi'}.`,
            });
        } catch (error: any) {
            toast.error('Cập nhật thất bại', {
                description: error.response?.data?.message || 'Không thể cập nhật trạng thái giảng viên.',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[800px] !max-w-[800px] flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background">
                {!course ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <SheetHeader className="px-8 py-6 border-b border-border/10">
                            <div className="relative flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                                        Quản lý Giảng viên
                                    </SheetTitle>
                                    <SheetDescription className="text-xs font-medium text-muted-foreground/60">
                                        Phân công cho khóa học <span className="text-foreground font-semibold">{course.title}</span>
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <ScrollArea className="flex-1 h-full px-8 py-8">
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

                                {/* Current Instructors */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 flex items-center gap-2">
                                        <Users className="h-3.5 w-3.5" />
                                        Đội ngũ Hiện tại
                                    </h4>

                                    {loadingInstructors ? (
                                        <div className="flex items-center justify-center py-12 rounded-3xl border border-border/40 bg-muted/5">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
                                        </div>
                                    ) : !instructors || instructors.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-muted-foreground/20 p-8 text-center bg-muted/5">
                                            <UserIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                                            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground/60">
                                                Chưa có giảng viên
                                            </p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground/40 mt-1 tracking-widest">
                                                Vui lòng phân công giảng viên bên dưới
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {instructors.map((instructor) => (
                                                <div
                                                    key={instructor.id}
                                                    className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:bg-muted/30 transition-all group shadow-sm hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 border border-border/20 rounded-lg">
                                                            <AvatarImage src={instructor.lecturer?.avatarUrl || undefined} />
                                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold rounded-lg">
                                                                {instructor.lecturer?.displayName?.charAt(0) || 'L'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-foreground">{instructor.lecturer?.displayName}</p>
                                                                {instructor.isPrimary && (
                                                                    <Badge variant="secondary" className="h-4 px-1.5 rounded-md bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-bold uppercase tracking-wider">
                                                                        Chủ nhiệm
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground/60 font-medium">{instructor.lecturer?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className={cn(
                                                                "h-8 w-8 rounded-lg transition-colors",
                                                                instructor.isPrimary ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-500/5"
                                                            )}
                                                            onClick={() => handleTogglePrimary(instructor.id, instructor.isPrimary)}
                                                            disabled={updatePrimaryMutation.isPending}
                                                            title="Đặt làm chủ nhiệm">
                                                            <Crown className={cn("h-4 w-4", instructor.isPrimary && "fill-current")} />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                                                            onClick={() => handleUnassign(instructor.id)}
                                                            disabled={unassignMutation.isPending}
                                                            title="Gỡ bỏ giảng viên">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6 pt-6 relative">
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                                    <div className="space-y-4 p-6 rounded-2xl bg-muted/20 border border-border/10">
                                        <Field className="space-y-2.5">
                                            <FieldLabel htmlFor="lecturer-select" className="text-xs font-bold text-muted-foreground/70 ml-1 uppercase tracking-wider">Thêm giảng viên</FieldLabel>
                                            <Select
                                                value={selectedLecturerId}
                                                onValueChange={setSelectedLecturerId}
                                            >
                                                <SelectTrigger id="lecturer-select" className="h-11 border-border/40 bg-background hover:bg-background/80 focus:ring-primary/20 rounded-xl transition-all shadow-sm">
                                                    <SelectValue placeholder="Chọn giảng viên..." />
                                                </SelectTrigger>
                                                <SelectContent className="border-border/10 shadow-xl bg-background/95 backdrop-blur-xl rounded-xl overflow-hidden p-1">
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

                                        <Field className="space-y-2.5">
                                            <FieldLabel htmlFor="role-select" className="text-xs font-bold text-muted-foreground/70 ml-1 uppercase tracking-wider">Vai trò</FieldLabel>
                                            <Select
                                                value={selectedRole}
                                                onValueChange={(val) => setSelectedRole(val as InstructorRole)}
                                            >
                                                <SelectTrigger id="role-select" className="h-11 border-border/40 bg-background hover:bg-background/80 focus:ring-primary/20 rounded-xl transition-all shadow-sm">
                                                    <SelectValue placeholder="Chọn vai trò..." />
                                                </SelectTrigger>
                                                <SelectContent className="border-border/10 shadow-xl bg-background/95 backdrop-blur-xl rounded-xl overflow-hidden p-1">
                                                    <SelectItem value={InstructorRole.MAIN} className="rounded-lg cursor-pointer text-xs font-medium py-2.5">Giảng viên chính</SelectItem>
                                                    <SelectItem value={InstructorRole.ASSISTANT} className="rounded-lg cursor-pointer text-xs font-medium py-2.5">Trợ giảng</SelectItem>
                                                    <SelectItem value={InstructorRole.RECORDER} className="rounded-lg cursor-pointer text-xs font-medium py-2.5">Người ghi hình (VOD)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>

                                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background border border-border/20 cursor-pointer hover:bg-muted/30 transition-all shadow-sm" onClick={() => isPrimary.setValue(!isPrimary.value)}>
                                            <Checkbox
                                                id="is-primary"
                                                checked={isPrimary.value}
                                                onCheckedChange={(checked: boolean) => isPrimary.setValue(checked)}
                                                className="h-4 w-4 rounded border-border/40 text-primary focus:ring-primary/20"
                                            />
                                            <label htmlFor="is-primary" className="text-xs font-medium text-foreground/80 cursor-pointer select-none">
                                                Đặt làm giảng viên chủ nhiệm
                                            </label>
                                        </div>

                                        <Button
                                            onClick={handleAssign}
                                            disabled={!selectedLecturerId || assignMutation.isPending}
                                            className="w-full rounded-xl h-11 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all">
                                            {assignMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
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
                            </div>
                        </ScrollArea>
                        <div className="h-6 bg-gradient-to-t from-background/50 to-transparent pointer-events-none absolute bottom-0 left-0 right-0 z-20" />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
