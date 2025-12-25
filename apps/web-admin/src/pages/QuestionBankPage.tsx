import { useState } from 'react';
import {
    useQuestionBanks,
    useCreateQuestionBank,
    useUpdateQuestionBank,
    useDeleteQuestionBank,
} from '../api';
import type {
    QuestionBankDto,
    QuestionBankQueryDto,
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
    CreateQuestionBankDto,
} from '@workspace/dtos';

export function QuestionBankPage() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [questionType, setQuestionType] = useState<QuestionType | ''>('');
    const [jlptLevel, setJlptLevel] = useState<QuestionJlptLevel | ''>('');
    const [difficulty, setDifficulty] = useState<QuestionDifficultyLevel | ''>('');
    const [status, setStatus] = useState<QuestionStatus | ''>('');
    const [category, setCategory] = useState('');

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateQuestionBankDto>>({
        questionText: '',
        questionType: 'multiple_choice' as QuestionType,
        tags: [],
    });
    const [tagsInput, setTagsInput] = useState('');

    // Build query params
    const queryParams: QuestionBankQueryDto = {
        page,
        limit,
        ...(search && { search }),
        ...(questionType && { questionType: questionType as QuestionType }),
        ...(jlptLevel && { jlptLevel: jlptLevel as QuestionJlptLevel }),
        ...(difficulty && { difficulty: difficulty as QuestionDifficultyLevel }),
        ...(status && { status: status as QuestionStatus }),
        ...(category && { category }),
    };

    // Queries
    const { data, isLoading, error } = useQuestionBanks(queryParams);

    // Mutations
    const createQuestionBank = useCreateQuestionBank();
    const updateQuestionBank = useUpdateQuestionBank();
    const deleteQuestionBank = useDeleteQuestionBank();

    if (isLoading) return <div className="p-4">Loading questions...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

    const questions = (data?.data || []) as QuestionBankDto[];
    const meta = data?.meta;

    const handleCreate = () => {
        setIsCreateModalOpen(true);
        // Reset form
        setFormData({
            questionText: '',
            questionType: 'multiple_choice' as QuestionType,
            tags: [],
        });
        setTagsInput('');
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setFormData({
            questionText: '',
            questionType: 'multiple_choice' as QuestionType,
            tags: [],
        });
        setTagsInput('');
    };

    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.questionText || !formData.questionType) {
            alert('Please fill in required fields: Question Text and Question Type');
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

        createQuestionBank.mutate(questionData, {
            onSuccess: () => {
                handleCloseModal();
                // Reset to first page to see the new question
                setPage(1);
                // Query will be automatically refetched due to invalidation in the hook
                alert('Question created successfully!');
            },
            onError: (error: any) => {
                alert(`Failed to create question: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
            },
        });
    };

    const handleUpdate = (id: string) => {
        updateQuestionBank.mutate({
            id,
            question: { questionText: 'Updated Question Text' },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this question?')) {
            deleteQuestionBank.mutate(id);
        }
    };

    const handleResetFilters = () => {
        setSearch('');
        setQuestionType('');
        setJlptLevel('');
        setDifficulty('');
        setStatus('');
        setCategory('');
        setPage(1);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
                <p className="text-muted-foreground mt-1">Manage questions for quizzes and assessments</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-4 space-y-4">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border rounded"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Create Question
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Question Type</label>
                        <select
                            value={questionType}
                            onChange={(e) => {
                                setQuestionType(e.target.value as QuestionType | '');
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border rounded"
                        >
                            <option value="">All Types</option>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="fill_blank">Fill Blank</option>
                            <option value="matching">Matching</option>
                            <option value="essay">Essay</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">JLPT Level</label>
                        <select
                            value={jlptLevel}
                            onChange={(e) => {
                                setJlptLevel(e.target.value as QuestionJlptLevel | '');
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border rounded"
                        >
                            <option value="">All Levels</option>
                            <option value="N5">N5</option>
                            <option value="N4">N4</option>
                            <option value="N3">N3</option>
                            <option value="N2">N2</option>
                            <option value="N1">N1</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                        <select
                            value={difficulty}
                            onChange={(e) => {
                                setDifficulty(e.target.value as QuestionDifficultyLevel | '');
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border rounded"
                        >
                            <option value="">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as QuestionStatus | '');
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border rounded"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="review">Review</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <input
                            type="text"
                            placeholder="Category..."
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border rounded"
                        />
                    </div>
                </div>

                {(search || questionType || jlptLevel || difficulty || status || category) && (
                    <button
                        onClick={handleResetFilters}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Question
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                JLPT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Difficulty
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Usage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {questions.map((question) => (
                            <tr key={question.id}>
                                <td className="px-6 py-4 text-sm">
                                    <div className="max-w-md truncate" title={question.questionText}>
                                        {question.questionText}
                                    </div>
                                    {question.tags && question.tags.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {question.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {question.tags.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                    +{question.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                        {question.questionType.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {question.jlptLevel || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {question.difficulty ? (
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${
                                                question.difficulty === 'easy'
                                                    ? 'bg-green-100 text-green-800'
                                                    : question.difficulty === 'medium'
                                                      ? 'bg-yellow-100 text-yellow-800'
                                                      : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {question.difficulty}
                                        </span>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            question.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : question.status === 'review'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {question.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    {question.usageCount || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <button
                                        onClick={() => handleUpdate(question.id)}
                                        disabled={updateQuestionBank.isPending}
                                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(question.id)}
                                        disabled={deleteQuestionBank.isPending}
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {questions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                    No questions found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && (
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Total: {meta.total} questions | Page {meta.page} of {meta.totalPages}
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || !meta.hasPrev}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page === meta.totalPages || !meta.hasNext}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Create Question Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Create New Question</h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmitCreate} className="space-y-4">
                                {/* Question Text - Required */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Question Text <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.questionText || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, questionText: e.target.value })
                                        }
                                        required
                                        rows={3}
                                        className="w-full px-4 py-2 border rounded"
                                        placeholder="Enter the question text..."
                                    />
                                </div>

                                {/* Question Type - Required */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Question Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.questionType || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                questionType: e.target.value as QuestionType,
                                            })
                                        }
                                        required
                                        className="w-full px-4 py-2 border rounded"
                                    >
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="true_false">True/False</option>
                                        <option value="fill_blank">Fill Blank</option>
                                        <option value="matching">Matching</option>
                                        <option value="essay">Essay</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* JLPT Level */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            JLPT Level
                                        </label>
                                        <select
                                            value={formData.jlptLevel || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    jlptLevel: e.target.value as QuestionJlptLevel,
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded"
                                        >
                                            <option value="">Select Level</option>
                                            <option value="N5">N5</option>
                                            <option value="N4">N4</option>
                                            <option value="N3">N3</option>
                                            <option value="N2">N2</option>
                                            <option value="N1">N1</option>
                                        </select>
                                    </div>

                                    {/* Difficulty */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Difficulty
                                        </label>
                                        <select
                                            value={formData.difficulty || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    difficulty: e.target.value as QuestionDifficultyLevel,
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded"
                                        >
                                            <option value="">Select Difficulty</option>
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Category
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.category || ''}
                                            onChange={(e) =>
                                                setFormData({ ...formData, category: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border rounded"
                                            placeholder="Enter category..."
                                        />
                                    </div>

                                    {/* Subcategory */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Subcategory
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subcategory || ''}
                                            onChange={(e) =>
                                                setFormData({ ...formData, subcategory: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border rounded"
                                            placeholder="Enter subcategory..."
                                        />
                                    </div>
                                </div>

                                {/* Options (for multiple choice) */}
                                {formData.questionType === 'multiple_choice' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Options (JSON format: {"{A: 'option1', B: 'option2'}"})
                                        </label>
                                        <textarea
                                            value={
                                                formData.options
                                                    ? JSON.stringify(formData.options, null, 2)
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setFormData({ ...formData, options: parsed });
                                                } catch {
                                                    // Invalid JSON, keep as is for now
                                                }
                                            }}
                                            rows={3}
                                            className="w-full px-4 py-2 border rounded font-mono text-sm"
                                            placeholder='{"A": "Option 1", "B": "Option 2", "C": "Option 3"}'
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter options as JSON object with keys (A, B, C, etc.)
                                        </p>
                                    </div>
                                )}

                                {/* Correct Answer */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Correct Answer
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.correctAnswer || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, correctAnswer: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border rounded"
                                        placeholder="Enter correct answer..."
                                    />
                                </div>

                                {/* Explanation */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Explanation
                                    </label>
                                    <textarea
                                        value={formData.explanation || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, explanation: e.target.value })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 border rounded"
                                        placeholder="Enter explanation for the answer..."
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tags</label>
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        className="w-full px-4 py-2 border rounded"
                                        placeholder="Enter tags separated by commas (e.g., grammar, vocabulary)"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Separate multiple tags with commas
                                    </p>
                                </div>

                                {/* Error Display */}
                                {createQuestionBank.isError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        Error: {createQuestionBank.error?.message || 'Failed to create question'}
                                    </div>
                                )}

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createQuestionBank.isPending}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {createQuestionBank.isPending ? 'Creating...' : 'Create Question'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}




