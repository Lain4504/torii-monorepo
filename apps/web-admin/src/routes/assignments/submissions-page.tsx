import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAssignment } from "@/lib/api/services/assignments";
import { useSubmissions } from "@/lib/api/services/submissions";
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
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";



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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Empty>
          <EmptyMedia>
            <AlertCircle className="size-8" />
          </EmptyMedia>
          <EmptyContent>
            <EmptyTitle>Không tìm thấy bài tập</EmptyTitle>
            <EmptyDescription>
              Bài tập bạn yêu cầu không tồn tại hoặc đã bị xóa.
            </EmptyDescription>
            <Button onClick={() => navigate("/assignments")} variant="outline" className="mt-4">
              Quay lại danh sách
            </Button>
          </EmptyContent>
        </Empty>
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
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>{assignment.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {assignment.type === AssignmentType.TEXT && "Văn bản"}
                  {assignment.type === AssignmentType.FILE && "Tệp tin"}
                  {assignment.type === AssignmentType.BOTH && "Văn bản & Tệp tin"}
                </Badge>
                <span className="text-sm font-mono text-muted-foreground">ID: {assignment.id.slice(0, 8)}</span>
              </div>
            </div>
            <Item variant="outline" className="shrink-0 md:min-w-[250px]">
              <ItemMedia>
                <Clock className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Hạn nộp bài</ItemTitle>
                <ItemDescription className="font-semibold">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString('vi-VN') : 'Không giới hạn'}
                </ItemDescription>
              </ItemContent>
            </Item>
          </div>
        </CardHeader>
      </Card>

      {/* Submissions Table */}
      <Card className="overflow-hidden">
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
        open={showGradeSheet}
        onOpenChange={setShowGradeSheet}
        submission={selectedSubmission}
        maxScore={Number(assignment.maxScore) || 100}
      />
    </div>
  );
}
