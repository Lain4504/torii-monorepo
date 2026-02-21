import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAssignment } from "@/api/services/assignments";
import { useSubmissions } from "@/api/services/submissions";
import { Button } from "@workspace/ui/components/button";
import {
  ChevronLeft,
  Clock,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import {
  AssignmentType,
  SubmissionStatus,
  type SubmissionResponseDTO
} from "@workspace/schemas";
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { GradeSubmissionSheet } from "@/components/submissions/grade-submission-sheet";
import { PageHeader } from "@/components/common/page-header";


export default function SubmissionsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponseDTO | null>(null);
  const [showGradeSheet, setShowGradeSheet] = useState(false);

  const { data: assignment, isLoading: isLoadingAssignment } = useAssignment(assignmentId!);
  const { data: submissions, isLoading: isLoadingSubmissions } = useSubmissions(assignmentId!);

  const handleGrade = (submission: SubmissionResponseDTO) => {
    setSelectedSubmission(submission);
    setShowGradeSheet(true);
  };

  const handleView = (submission: SubmissionResponseDTO) => {
    setSelectedSubmission(submission);
    setShowGradeSheet(true);
  };

  if (isLoadingAssignment) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="size-12 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Không tìm thấy bài tập</h2>
          <p className="text-sm text-muted-foreground">Bài tập bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
        </div>
        <Button onClick={() => navigate("/assignments")} variant="outline">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const submissionsList = submissions || [];
  const total = submissionsList.length;
  const graded = submissionsList.filter(s => s.status === SubmissionStatus.GRADED).length;
  const pending = submissionsList.filter(s => s.status === SubmissionStatus.SUBMITTED).length;
  const returned = submissionsList.filter(s => s.status === SubmissionStatus.RETURNED).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/assignments")}
          className="w-fit -ml-2 text-muted-foreground"
        >
          <ChevronLeft className="mr-2 size-4" />
          Quay lại danh sách
        </Button>

        <PageHeader
          title="Quản lý Bài Nộp"
          subtitle="Hệ sinh thái chấm điểm Torii Academy"
          stats={[
            { label: "Tổng bài nộp", value: total },
            { label: "Chờ chấm điểm", value: pending },
            { label: "Đã chấm điểm", value: graded },
            { label: "Đã trả lại", value: returned }
          ]}
        />
      </div>

      {/* Assignment Info Banner */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {assignment.type === AssignmentType.TEXT && "Văn bản"}
                {assignment.type === AssignmentType.FILE && "Tệp tin"}
                {assignment.type === AssignmentType.BOTH && "Văn bản & Tệp tin"}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">Mã: {assignment.id.slice(0, 8)}</span>
            </div>
            <h2 className="text-xl font-bold">{assignment.title}</h2>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hạn nộp bài</p>
              <p className="text-sm font-semibold">
                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString('vi-VN') : 'Không giới hạn'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <SubmissionsTable
          data={submissions || []}
          isLoading={isLoadingSubmissions}
          onGrade={handleGrade}
          onView={handleView}
        />
      </div>

      <GradeSubmissionSheet
        open={showGradeSheet}
        onOpenChange={setShowGradeSheet}
        submission={selectedSubmission}
        maxScore={Number(assignment.maxScore) || 100}
      />
    </div>
  );
}
