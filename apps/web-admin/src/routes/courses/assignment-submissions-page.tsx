import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '@/lib/api/services/courses';
import { useAssignment } from '@/lib/api/services/assignments';
import { useSubmissions } from '@/lib/api/services/submissions';
import { PageHeader } from '@/components/common/page-header';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { SubmissionsTable } from '@/components/submissions/submissions-table';
import type { SubmissionResponseDTO } from '@workspace/schemas';
import { GradeSubmissionSheet } from '@/components/submissions/grade-submission-sheet';
import { useState } from 'react';

export default function AssignmentSubmissionsPage() {
    const { id: courseId, assignmentId } = useParams<{ id: string; assignmentId: string }>();
    const navigate = useNavigate();

    const { data: course, isLoading: isLoadingCourse } = useCourse(courseId || '');
    const { data: assignment, isLoading: isLoadingAssignment } = useAssignment(assignmentId || '');
    const { data: submissions, isLoading: isLoadingSubmissions } = useSubmissions(assignmentId || '');

    const [gradingSubmission, setGradingSubmission] = useState<SubmissionResponseDTO | null>(null);

    const handleGrade = (submission: SubmissionResponseDTO) => {
        setGradingSubmission(submission);
    };

    const handleView = (submission: SubmissionResponseDTO) => {
        // For now view is same as grade
        setGradingSubmission(submission);
    };


    if (isLoadingCourse || isLoadingAssignment) {
        return <PageLoading text="Đang tải thông tin..." />;
    }

    if (!course || !assignment) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <p className="text-muted-foreground">Không tìm thấy thông tin bài tập hoặc khóa học</p>
                <Button onClick={() => navigate(`/courses/${courseId}`)}>Quay lại chi tiết khóa học</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-muted-foreground hover:text-foreground gap-2 transition-colors hover:bg-transparent -ml-2 w-fit"
                    onClick={() => navigate(`/courses/${courseId}`)}
                >
                    <ChevronLeft className="size-4" />
                    <span className="text-xs font-sans font-bold italic uppercase tracking-wider">Quay lại chi tiết khóa học</span>
                </Button>
                <PageHeader
                    title="Danh sách bài nộp"
                    subtitle={`Bài tập: ${assignment.title} | Khóa học: ${course.title}. Bài nộp từ học viên theo từng đợt khai giảng (Course Run).`}
                    stats={[
                        {
                            label: 'Tổng số bài nộp',
                            value: submissions?.length || 0,
                        },
                        {
                            label: 'Đã chấm',
                            value: submissions?.filter(s => s.score !== undefined && s.score !== null).length || 0,
                        }
                    ]}
                />
            </div>
            <Card className="overflow-hidden shadow-sm border-border">
                <CardContent className="p-0">
                    <SubmissionsTable
                        data={submissions || []}
                        isLoading={isLoadingSubmissions}
                        onGrade={handleGrade}
                        onView={handleView}
                    />
                </CardContent>
            </Card>

            <GradeSubmissionSheet
                open={!!gradingSubmission}
                onOpenChange={(open) => !open && setGradingSubmission(null)}
                submission={gradingSubmission}
                maxScore={assignment.maxScore}
            />
        </div>
    );
}

