import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';

interface QuestionBankHeaderProps {
    onAddNew: () => void;
}

export function QuestionBankHeader({ onAddNew }: QuestionBankHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Question Bank Management</h1>
                <p className="text-muted-foreground mt-1">
                    Manage questions for quizzes and assessments
                </p>
            </div>
            <Button onClick={onAddNew} size="default">
                <Plus className="h-4 w-4" />
                Add New Question
            </Button>
        </div>
    );
}



