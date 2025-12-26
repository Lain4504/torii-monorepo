import type {
    QuestionBankDto,
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
    CreateQuestionBankDto,
} from '@workspace/dtos';

export interface QuestionBankFilters {
    search: string;
    questionType: QuestionType | '';
    jlptLevel: QuestionJlptLevel | '';
    difficulty: QuestionDifficultyLevel | '';
    status: QuestionStatus | '';
    category: string;
}

export interface QuestionBankFormData extends Partial<CreateQuestionBankDto> {
    questionText: string;
    questionType: QuestionType;
    tags: string[];
    status?: QuestionStatus;
}

export interface QuestionBankTableProps {
    questions: QuestionBankDto[];
    isLoading?: boolean;
    onEdit: (id: string) => void;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
    isUpdating?: boolean;
    isDeleting?: boolean;
}

