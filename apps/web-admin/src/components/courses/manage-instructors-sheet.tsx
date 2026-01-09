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
import { Separator } from '@workspace/ui/components/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Loader2, User as UserIcon, Trash2, Crown, Users } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { type CourseResponseDTO, UserRole } from '@workspace/schemas';
import { useUsers } from '@/api/services/users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Field, FieldLabel } from '@workspace/ui/components/field';

interface ManageInstructorsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
}

export function ManageInstructorsSheet({ open, onOpenChange, course }: ManageInstructorsSheetProps) {
    const [selectedLecturerId, setSelectedLecturerId] = useState<string>('');
    const isPrimary = useBoolean(false);

    const { data: instructors, isLoading: loadingInstructors } = useCourseInstructors(course?.id || '');
    const { data: usersData } = useUsers({ page: 1, limit: 100, search: '' });
    const assignMutation = useAssignLecturer();
    const unassignMutation = useUnassignLecturer();
    const updatePrimaryMutation = useUpdatePrimaryInstructor();

    // Filter only lecturers from users
    const lecturers = (usersData?.data || []).filter(user => user.role === UserRole.LECTURER);

    // Filter lecturers not already assigned
    const assignedLecturerIds = new Set(instructors?.map(i => i.lecturerId) || []);
    const availableLecturers = lecturers.filter(l => !assignedLecturerIds.has(l.id));

    const handleAssign = async () => {
        if (!course || !selectedLecturerId) return;

        try {
            await assignMutation.mutateAsync({
                courseId: course.id,
                lecturerId: selectedLecturerId,
                isPrimary: isPrimary.value,
            });
            toast.success('Lecturer assigned successfully');
            setSelectedLecturerId('');
            isPrimary.setFalse();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to assign lecturer');
        }
    };

    const handleUnassign = async (id: string) => {
        try {
            await unassignMutation.mutateAsync(id);
            toast.success('Lecturer unassigned successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to unassign lecturer');
        }
    };

    const handleTogglePrimary = async (id: string, currentPrimary: boolean) => {
        try {
            await updatePrimaryMutation.mutateAsync({
                id,
                dto: { isPrimary: !currentPrimary },
            });
            toast.success('Primary instructor updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update primary instructor');
        }
    };

    if (!course) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[600px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden">
                <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5 space-y-4">
                    <div className="space-y-1.5">
                        <SheetTitle className="text-2xl font-bold leading-tight tracking-tight text-foreground flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Manage Instructors
                        </SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground/80">
                            Assign and manage lecturers for <strong className="text-foreground">{course.title}</strong>
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 h-full">
                    <div className="px-6 py-6 space-y-6">
                        {/* Current Instructors */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                                <UserIcon className="h-3.5 w-3.5" />
                                Current Instructors
                            </h4>
                            {loadingInstructors ? (
                                <div className="flex items-center justify-center py-12 rounded-xl border border-border/40 bg-muted/20">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : !instructors || instructors.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-muted-foreground/20 p-8 text-center bg-muted/10">
                                    <UserIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        No instructors assigned yet
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        Assign lecturers below to get started
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {instructors.map((instructor) => (
                                        <div
                                            key={instructor.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:bg-card/80 hover:border-border/60 transition-all shadow-sm group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border/50">
                                                    <AvatarImage src={instructor.lecturer?.avatarUrl || undefined} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                        {instructor.lecturer?.displayName?.charAt(0) || 'L'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-foreground">{instructor.lecturer?.displayName}</p>
                                                        {instructor.isPrimary && (
                                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10">
                                                                <Crown className="h-3 w-3 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
                                                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Primary</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/80">{instructor.lecturer?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                                                    onClick={() => handleTogglePrimary(instructor.id, instructor.isPrimary)}
                                                    disabled={updatePrimaryMutation.isPending}
                                                    title={instructor.isPrimary ? "Remove as Primary" : "Set as Primary"}
                                                >
                                                    <Crown className={`h-4 w-4 ${instructor.isPrimary ? "fill-amber-500 text-amber-500" : ""}`} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleUnassign(instructor.id)}
                                                    disabled={unassignMutation.isPending}
                                                    title="Remove Instructor"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="bg-border/40" />

                        {/* Assign New Instructor */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Assign New Instructor</h4>
                            <div className="space-y-4">
                                <Field className="space-y-2">
                                    <FieldLabel htmlFor="lecturer-select" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Select Lecturer</FieldLabel>
                                    <Select
                                        value={selectedLecturerId}
                                        onValueChange={setSelectedLecturerId}
                                    >
                                        <SelectTrigger id="lecturer-select" className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all">
                                            <SelectValue placeholder="Choose a lecturer..." />
                                        </SelectTrigger>
                                        <SelectContent className="border-none shadow-xl bg-popover/95 backdrop-blur-xl rounded-xl">
                                            {availableLecturers.map((lecturer) => (
                                                <SelectItem key={lecturer.id} value={lecturer.id} className="rounded-lg focus:bg-primary/5 cursor-pointer">
                                                    <span className="font-medium">{lecturer.displayName}</span>
                                                    <span className="ml-2 text-muted-foreground text-xs">({lecturer.email})</span>
                                                </SelectItem>
                                            ))}
                                            {availableLecturers.length === 0 && (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No available lecturers
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <div className="flex items-center gap-2.5 ml-1">
                                    <Checkbox
                                        id="is-primary"
                                        checked={isPrimary.value}
                                        onCheckedChange={(checked) => isPrimary.setValue(checked as boolean)}
                                        className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <label htmlFor="is-primary" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                                        Set as primary instructor
                                    </label>
                                </div>

                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedLecturerId || assignMutation.isPending}
                                    className="w-full rounded-xl h-11 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform font-medium"
                                >
                                    {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Assign Lecturer
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
