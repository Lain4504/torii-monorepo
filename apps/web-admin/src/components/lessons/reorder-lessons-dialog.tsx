import { useEffect, useState } from 'react';
import {
    DndContext,
    PointerSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { useReorderLessons } from "@/lib/api/services/lesson";
import type { LessonResponseDTO } from '@workspace/schemas';
import { Spinner } from "@workspace/ui/components/spinner";
import { GripVertical } from 'lucide-react';

interface ReorderLessonsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    moduleId: string;
    lessons: LessonResponseDTO[];
}

function SortableLessonItem({ lesson, index }: { lesson: LessonResponseDTO; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: lesson.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/40 ${isDragging ? 'opacity-80' : ''}`}
        >
            <button
                type="button"
                className="text-muted-foreground cursor-grab active:cursor-grabbing"
                aria-label={`Kéo để đổi vị trí bài học ${lesson.title}`}
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
            <span className="flex-1 px-2 truncate">{lesson.title}</span>
        </div>
    );
}

export function ReorderLessonsDialog({
    open,
    onOpenChange,
    moduleId,
    lessons,
}: ReorderLessonsDialogProps) {
    const reorderLessons = useReorderLessons();
    const [showConfirm, setShowConfirm] = useState(false);
    const [orderedLessons, setOrderedLessons] = useState<LessonResponseDTO[]>(lessons);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
    );

    useEffect(() => {
        if (open) {
            setOrderedLessons(lessons);
            setShowConfirm(false);
        }
    }, [open, lessons]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setOrderedLessons((currentLessons) => {
            const oldIndex = currentLessons.findIndex((lesson) => lesson.id === active.id);
            const newIndex = currentLessons.findIndex((lesson) => lesson.id === over.id);

            if (oldIndex === -1 || newIndex === -1) {
                return currentLessons;
            }

            return arrayMove(currentLessons, oldIndex, newIndex);
        });
    };

    const handleContinue = () => {
        if (!orderedLessons.length) {
            onOpenChange(false);
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        try {
            const lessonOrders = orderedLessons.map((l, index) => ({
                id: l.id,
                orderIndex: index + 1,
            }));

            await reorderLessons.mutateAsync({ moduleId, lessonOrders });
            setShowConfirm(false);
            onOpenChange(false);
        } catch {
            // toast handled globally nếu cần
        }
    };

    return (
        <>
            <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Sắp xếp lại thứ tự bài học</DialogTitle>
                        <DialogDescription>
                            Xác nhận lưu lại thứ tự hiện tại của các bài học trong học phần.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-2 max-h-[260px] overflow-y-auto text-sm">
                        {orderedLessons.length > 0 && (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={orderedLessons.map((l) => l.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {orderedLessons.map((l, index) => (
                                            <SortableLessonItem key={l.id} lesson={l} index={index} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                        {orderedLessons.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">
                                Chưa có bài học nào để sắp xếp.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy bỏ
                        </Button>
                        <Button onClick={handleContinue} disabled={!orderedLessons.length}>
                            Tiếp tục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận lưu thứ tự mới?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ cập nhật thứ tự các bài học theo danh sách hiện tại. Thao tác này
                            có thể ảnh hưởng tới lộ trình học của học viên.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={reorderLessons.isPending}>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirm();
                            }}
                            disabled={reorderLessons.isPending}
                        >
                            {reorderLessons.isPending ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Xác nhận cập nhật"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

