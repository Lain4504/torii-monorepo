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

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Loader2, User as UserIcon, Trash2, Crown, Users, Plus, ShieldCheck, Mail } from 'lucide-react';
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
            <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl overflow-hidden">
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative flex items-center gap-4 z-10">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                Manage <span className="text-primary not-italic">Instructors</span>
                            </SheetTitle>
                            <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                Repository: <span className="font-mono text-primary">{course.title}</span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 h-full px-8 py-8">
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

                        {/* Current Instructors */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                <div className="h-px flex-1 bg-border/20" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" />
                                    Active Personnel
                                </h4>
                                <div className="h-px flex-1 bg-border/20" />
                            </div>

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
                                            className="flex items-center justify-between p-4 rounded-2xl bg-muted/5 border border-border/10 hover:bg-muted/10 hover:border-primary/20 transition-all shadow-sm group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                                    <AvatarImage src={instructor.lecturer?.avatarUrl || undefined} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                                                        {instructor.lecturer?.displayName?.charAt(0) || 'L'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-foreground uppercase tracking-tight">{instructor.lecturer?.displayName}</p>
                                                        {instructor.isPrimary && (
                                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                                                                <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Lead</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-xs font-medium text-muted-foreground/60">
                                                        <Mail className="h-3 w-3" />
                                                        {instructor.lecturer?.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={cn(
                                                        "h-9 w-9 rounded-xl hover:bg-amber-500/10 hover:text-amber-500 transition-colors",
                                                        instructor.isPrimary && "text-amber-500 bg-amber-500/5"
                                                    )}
                                                    onClick={() => handleTogglePrimary(instructor.id, instructor.isPrimary)}
                                                    disabled={updatePrimaryMutation.isPending}
                                                    title={instructor.isPrimary ? "Revoke Lead Status" : "Grant Lead Status"}
                                                >
                                                    <Crown className={cn("h-4 w-4", instructor.isPrimary && "fill-current")} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
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

                        {/* Assign New Instructor */}
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                <div className="h-px flex-1 bg-border/20" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center flex items-center gap-2">
                                    <Plus className="h-3 w-3" />
                                    Add Personnel
                                </h4>
                                <div className="h-px flex-1 bg-border/20" />
                            </div>

                            <div className="space-y-5 p-5 rounded-3xl bg-muted/5 border border-border/10">
                                <Field className="space-y-2">
                                    <FieldLabel htmlFor="lecturer-select" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Select Lecturer</FieldLabel>
                                    <Select
                                        value={selectedLecturerId}
                                        onValueChange={setSelectedLecturerId}
                                    >
                                        <SelectTrigger id="lecturer-select" className="h-12 border-none bg-background/50 hover:bg-background/80 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all shadow-sm">
                                            <SelectValue placeholder="CHOOSE A LECTURER..." />
                                        </SelectTrigger>
                                        <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                            {availableLecturers.map((lecturer) => (
                                                <SelectItem key={lecturer.id} value={lecturer.id} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">
                                                    <span className="mr-2">{lecturer.displayName}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium lowercase opacity-70">uid:{lecturer.id.substring(0, 4)}</span>
                                                </SelectItem>
                                            ))}
                                            {availableLecturers.length === 0 && (
                                                <div className="p-6 text-center">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">No available personnel</p>
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/10 cursor-pointer hover:bg-background/80 transition-all" onClick={() => isPrimary.setValue(!isPrimary.value)}>
                                    <Checkbox
                                        id="is-primary"
                                        checked={isPrimary.value}
                                        onCheckedChange={(checked) => isPrimary.setValue(checked as boolean)}
                                        className="h-5 w-5 rounded-md border-border/60 text-primary focus:ring-primary/20"
                                    />
                                    <label htmlFor="is-primary" className="text-xs font-bold uppercase tracking-wide text-muted-foreground cursor-pointer select-none">
                                        Grant Lead Privileges
                                    </label>
                                </div>

                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedLecturerId || assignMutation.isPending}
                                    className="w-full rounded-xl h-12 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                                >
                                    {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Allocate Personnel
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
