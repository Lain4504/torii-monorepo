import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Search, BrainCircuit } from 'lucide-react';
import { useQuestions } from '@/lib/api/services/questions';
import { QuestionJlptLevel, QuestionStatus } from '@workspace/schemas';

import { cn } from '@workspace/ui/lib/utils';

interface QuestionSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (questionIds: string[]) => void;
    initialSelectedIds?: string[];
    poolId?: string;
    jlptLevel?: string;
    type?: string;
}

export function QuestionSelectionDialog({
    open,
    onOpenChange,
    onSelect,
    initialSelectedIds = [],
    poolId,
    jlptLevel,
    type,
}: QuestionSelectionDialogProps) {
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

    const { data: questionsData, isLoading } = useQuestions({
        page: 1,
        limit: 100, // Show a good amount to pick from
        search: search || undefined,
        poolId: poolId || undefined,
        jlptLevel: (jlptLevel && jlptLevel !== 'GLOBAL') ? jlptLevel as QuestionJlptLevel : undefined,
        questionType: type as any,
        status: QuestionStatus.ACTIVE, // Only active questions can be picked

    });


    const questions = questionsData?.data || [];

    const toggleId = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        onSelect(selectedIds);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <BrainCircuit className="size-5 text-primary" />
                        Chọn câu hỏi thủ công
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-3 border-b bg-muted/20">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm nội dung câu hỏi..."
                            className="pl-9 bg-background"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-2">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))
                        ) : questions.length > 0 ? (
                            questions.map(q => {
                                const isSelected = selectedIds.includes(q.id);
                                return (
                                    <div
                                        key={q.id}
                                        onClick={() => toggleId(q.id)}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group",
                                            isSelected
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        )}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => toggleId(q.id)}
                                            className="pointer-events-none"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase">
                                                    {q.questionType}
                                                </Badge>
                                                <Badge variant="secondary" className="text-[9px] font-black uppercase">
                                                    {q.jlptLevel}
                                                </Badge>
                                            </div>

                                            <p className="text-sm font-medium line-clamp-2 leading-relaxed">
                                                {q.questionText}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                <Search className="size-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Không tìm thấy câu hỏi nào phù hợp.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t bg-muted/10 gap-2">
                    <div className="mr-auto flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Đã chọn:
                        </span>
                        <Badge variant="default" className="rounded-full px-2 py-0.5 font-bold">
                            {selectedIds.length}
                        </Badge>
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>
                        Xác nhận ({selectedIds.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
