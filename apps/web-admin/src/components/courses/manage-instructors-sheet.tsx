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
import { type CourseResponseDTO, UserRole } from '@workspace/schemas';
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
            toast.success('Personnel Assigned', {
                description: 'Lecturer successfully allocated to course repository.',
            });
            setSelectedLecturerId('');
            isPrimary.setFalse();
        } catch (error: any) {
            toast.error('Assignment Failed', {
                description: error.response?.data?.message || 'Could not assign lecturer.',
            });
        }
    };

    const handleUnassign = async (id: string) => {
        try {
            await unassignMutation.mutateAsync(id);
            toast.success('Personnel Removed', {
                description: 'Lecturer access revoked from course repository.',
            });
        } catch (error: any) {
            toast.error('Removal Failed', {
                description: error.response?.data?.message || 'Could not remove lecturer.',
            });
        }
    };

    const handleTogglePrimary = async (id: string, currentPrimary: boolean) => {
        try {
            await updatePrimaryMutation.mutateAsync({
                id,
                dto: { isPrimary: !currentPrimary },
            });
            toast.success('Privileges Updated', {
                description: `Primary instructor status have been ${!currentPrimary ? 'granted' : 'revoked'}.`,
            });
        } catch (error: any) {
            toast.error('Update Failed', {
                description: error.response?.data?.message || 'Could not update instructor status.',
            });
        }
    };

    if (!course) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col p-0 gap-0 border-l border-border/10 shadow-2xl bg-background/95 backdrop-blur-xl overflow-hidden">
                <SheetHeader className="px-8 py-6 border-b border-border/10 relative overflow-hidden">
                    <div className="relative flex items-center gap-4 z-10">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                            <SheetTitle className="text-xl font-semibold tracking-tight">
                                Manage Instructors
                            </SheetTitle>
                            <SheetDescription className="text-xs font-medium text-muted-foreground/60">
                                Assignment for <span className="text-foreground">{course.title}</span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 h-full px-8 py-8">
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

                        {/* Current Instructors */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                Current Team
                            </h4>

                            {loadingInstructors ? (
                                <div className="flex items-center justify-center py-12 rounded-3xl border border-border/20 bg-muted/5">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
                                </div>
                            ) : !instructors || instructors.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-muted-foreground/20 p-8 text-center bg-muted/5">
                                    <UserIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
                                    <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground/60">
                                        No instructors assigned
                                    </p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground/40 mt-1 tracking-widest">
                                        Assign personnel below to initialize
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {instructors.map((instructor) => (
                                        <div
                                            key={instructor.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/5 hover:bg-muted/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-border/10">
                                                    <AvatarImage src={instructor.lecturer?.avatarUrl || undefined} />
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                        {instructor.lecturer?.displayName?.charAt(0) || 'L'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-foreground">{instructor.lecturer?.displayName}</p>
                                                        {instructor.isPrimary && (
                                                            <Badge variant="secondary" className="h-4 px-1.5 rounded-md bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-medium uppercase tracking-wider">
                                                                Lead
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/60">{instructor.lecturer?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={cn(
                                                        "h-8 w-8 rounded-lg transition-colors",
                                                        instructor.isPrimary ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-500/5"
                                                    )}
                                                    onClick={() => handleTogglePrimary(instructor.id, instructor.isPrimary)}
                                                    disabled={updatePrimaryMutation.isPending}
                                                >
                                                    <Crown className={cn("h-3.5 w-3.5", instructor.isPrimary && "fill-current")} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                                                    onClick={() => handleUnassign(instructor.id)}
                                                    disabled={unassignMutation.isPending}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 pt-6">
                            <div className="space-y-4 p-6 rounded-2xl bg-muted/10 border border-border/10">
                                <Field className="space-y-2.5">
                                    <FieldLabel htmlFor="lecturer-select" className="text-xs font-medium text-muted-foreground ml-1">New Assignment</FieldLabel>
                                    <Select
                                        value={selectedLecturerId}
                                        onValueChange={setSelectedLecturerId}
                                    >
                                        <SelectTrigger id="lecturer-select" className="h-10 border-border/20 bg-background/50 hover:bg-muted/50 focus:ring-primary/20 rounded-xl transition-all">
                                            <SelectValue placeholder="Select a lecturer..." />
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
                                                    <p className="text-xs text-muted-foreground/60 italic">No available lecturers</p>
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/50 border border-border/10 cursor-pointer hover:bg-muted/30 transition-all" onClick={() => isPrimary.setValue(!isPrimary.value)}>
                                    <Checkbox
                                        id="is-primary"
                                        checked={isPrimary.value}
                                        onCheckedChange={(checked: boolean) => isPrimary.setValue(checked)}
                                        className="h-4 w-4 rounded border-border/40 text-primary focus:ring-primary/20"
                                    />
                                    <label htmlFor="is-primary" className="text-xs font-medium text-muted-foreground/80 cursor-pointer select-none">
                                        Designate as Primary Instructor
                                    </label>
                                </div>

                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedLecturerId || assignMutation.isPending}
                                    className="w-full rounded-xl h-10 bg-primary text-primary-foreground text-xs font-medium shadow-lg shadow-primary/10 hover:bg-primary/95 transition-all"
                                >
                                    {assignMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-3.5 w-3.5" />
                                            Assign Instructor
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="h-6 bg-gradient-to-t from-background/50 to-transparent pointer-events-none absolute bottom-0 left-0 right-0 z-20" />
            </SheetContent>
        </Sheet>
    );
}
