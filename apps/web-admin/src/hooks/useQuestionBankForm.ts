import { useState, useEffect } from 'react';
import type {
    QuestionBankDto,
    QuestionType,
    CreateQuestionBankDto,
    UpdateQuestionBankDto,
} from '@workspace/dtos';
import type { QuestionBankFormData } from '../types/question-bank';

interface UseQuestionBankFormOptions {
    initialData?: QuestionBankDto;
    onSubmit: (data: CreateQuestionBankDto | UpdateQuestionBankDto) => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export function useQuestionBankForm({
    initialData,
    onSubmit,
    onSuccess,
    onError,
}: UseQuestionBankFormOptions) {
    const [formData, setFormData] = useState<QuestionBankFormData>({
        questionText: '',
        questionType: 'multiple_choice' as QuestionType,
        tags: [],
    });
    const [tagsInput, setTagsInput] = useState('');

    // Update form when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData({
                questionText: initialData.questionText,
                questionType: initialData.questionType,
                jlptLevel: initialData.jlptLevel,
                category: initialData.category,
                subcategory: initialData.subcategory,
                difficulty: initialData.difficulty,
                options: initialData.options,
                correctAnswer: initialData.correctAnswer,
                explanation: initialData.explanation,
                tags: initialData.tags || [],
                status: initialData.status,
            });
            setTagsInput(initialData.tags?.join(', ') || '');
        } else {
            // Reset form for create mode
            setFormData({
                questionText: '',
                questionType: 'multiple_choice' as QuestionType,
                tags: [],
            });
            setTagsInput('');
        }
    }, [initialData]);

    const updateField = <K extends keyof QuestionBankFormData>(
        key: K,
        value: QuestionBankFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setFormData({
            questionText: '',
            questionType: 'multiple_choice' as QuestionType,
            tags: [],
        });
        setTagsInput('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.questionText || !formData.questionType) {
            const error = new Error('Please fill in required fields: Question Text and Question Type');
            onError?.(error);
            return;
        }

        // Parse tags from comma-separated string
        const tags = tagsInput
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

        const questionData: CreateQuestionBankDto = {
            questionText: formData.questionText,
            questionType: formData.questionType as QuestionType,
            ...(formData.jlptLevel && { jlptLevel: formData.jlptLevel }),
            ...(formData.category && { category: formData.category }),
            ...(formData.subcategory && { subcategory: formData.subcategory }),
            ...(formData.difficulty && { difficulty: formData.difficulty }),
            ...(formData.options && { options: formData.options }),
            ...(formData.correctAnswer && { correctAnswer: formData.correctAnswer }),
            ...(formData.explanation && { explanation: formData.explanation }),
            ...(tags.length > 0 && { tags }),
        };

        onSubmit(questionData);
    };

    return {
        formData,
        tagsInput,
        setTagsInput,
        updateField,
        resetForm,
        handleSubmit,
    };
}

