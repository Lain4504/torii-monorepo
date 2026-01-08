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
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Loader2, User as UserIcon, Trash2, Crown } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import type { CourseResponseDTO } from '@workspace/schemas';
import { useUsers } from '@/api/services/users';

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
    const lecturers = (usersData?.data || []).filter(user => user.role === 'LECTURER');

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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manage Instructors</DialogTitle>
                    <DialogDescription>
                        Assign lecturers to <strong>{course?.title}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Instructors */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Current Instructors</h4>
                        {loadingInstructors ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : !instructors || instructors.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                No instructors assigned yet
                            </p>
                        ) : (
                            <ScrollArea className="h-[200px] rounded-lg border">
                                <div className="p-4 space-y-3">
                                    {instructors.map((instructor) => (
                                        <div
                                            key={instructor.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={instructor.lecturer?.avatarUrl || undefined} />
                                                    <AvatarFallback>
                                                        <UserIcon className="h-5 w-5" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{instructor.lecturer?.displayName}</p>
                                                    <p className="text-xs text-muted-foreground">{instructor.lecturer?.email}</p>
                                                </div>
                                                {instructor.isPrimary && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        <Crown className="h-3 w-3 mr-1" />
                                                        Primary
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleTogglePrimary(instructor.id, instructor.isPrimary)}
                                                    disabled={updatePrimaryMutation.isPending}
                                                >
                                                    <Crown className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleUnassign(instructor.id)}
                                                    disabled={unassignMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Assign New Instructor */}
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-semibold">Assign New Instructor</h4>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="lecturer-select">Select Lecturer</Label>
                                <select
                                    id="lecturer-select"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedLecturerId}
                                    onChange={(e) => setSelectedLecturerId(e.target.value)}
                                >
                                    <option value="">Choose a lecturer...</option>
                                    {availableLecturers.map((lecturer) => (
                                        <option key={lecturer.id} value={lecturer.id}>
                                            {lecturer.displayName} ({lecturer.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is-primary"
                                    checked={isPrimary.value}
                                    onCheckedChange={(checked) => isPrimary.setValue(checked as boolean)}
                                />
                                <Label htmlFor="is-primary" className="text-sm font-normal cursor-pointer">
                                    Set as primary instructor
                                </Label>
                            </div>

                            <Button
                                onClick={handleAssign}
                                disabled={!selectedLecturerId || assignMutation.isPending}
                                className="w-full"
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
