import { useState } from 'react';
import { useBoolean } from '@workspace/ui/hooks/use-boolean';
import { useAssignLecturer, useCourseInstructors, useUnassignLecturer, useUpdatePrimaryInstructor } from '@/api/services/course-instructors';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Loader2, User as UserIcon, Trash2, Crown } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { type CourseResponseDTO, UserRole } from '@workspace/schemas';
import { useUsers } from '@/api/services/users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Field, FieldLabel } from '@workspace/ui/components/field';

interface ManageInstructorsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
}

export function ManageInstructorsDialog({ open, onOpenChange, course }: ManageInstructorsDialogProps) {
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-muted/30">
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Manage Instructors</DialogTitle>
                    <DialogDescription className="text-muted-foreground/70">
                        Assign lecturers to <strong>{course?.title}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 p-6 pt-2">
                    {/* Current Instructors */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Current Instructors</h4>
                        {loadingInstructors ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : !instructors || instructors.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted-foreground/20 p-8 text-center bg-muted/10">
                                <p className="text-sm text-muted-foreground">
                                    No instructors assigned yet
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[200px] rounded-xl border border-border/40 bg-muted/20">
                                <div className="p-4 space-y-3">
                                    {instructors.map((instructor) => (
                                        <div
                                            key={instructor.id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-border/40 hover:bg-background/80 transition-all shadow-sm group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border/50">
                                                    <AvatarImage src={instructor.lecturer?.avatarUrl || undefined} />
                                                    <AvatarFallback className="bg-primary/5 text-primary">
                                                        <UserIcon className="h-5 w-5" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-foreground">{instructor.lecturer?.displayName}</p>
                                                        {instructor.isPrimary && (
                                                            <div className="flex items-center">
                                                                <Crown className="h-3 w-3 text-amber-500 mr-1" />
                                                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Primary</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/80">{instructor.lecturer?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            </ScrollArea>
                        )}
                    </div>

                    {/* Assign New Instructor */}
                    <div className="space-y-4 pt-4 border-t border-border/40">
                        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Assign New Instructor</h4>
                        <div className="space-y-4">
                            <Field className="space-y-2">
                                <FieldLabel htmlFor="lecturer-select" className="ml-1">Select Lecturer</FieldLabel>
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
                                className="w-full rounded-xl h-11 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
                            >
                                {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Assign Lecturer
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
