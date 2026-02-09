import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAssignment } from "@/api/services/assignments";
import { useSubmissions } from "@/api/services/submissions";
import { Button } from "@workspace/ui/components/button";
import { 
  ChevronLeft, 
  Clock, 
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { 
  Card
} from "@workspace/ui/components/card";
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
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="size-12 text-rose-500" />
        <h2 className="text-xl font-bold uppercase tracking-tighter italic">Không tìm thấy bài tập</h2>
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/assignments")}
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground font-bold uppercase text-[10px] tracking-widest transition-all"
        >
          <ChevronLeft className="mr-2 size-3" />
          Quay lại danh sách
        </Button>

        <PageHeader
          title={<>Quản lý <span className="text-primary italic">Bài Nộp</span></>}
          subtitle={<>Hệ sinh thái chấm điểm <span className="text-primary/60 font-medium font-sans italic tracking-wide">Torii Academy</span></>}
          stats={[
            { label: "Tổng bài nộp", value: total },
            { label: "Chờ chấm điểm", value: pending },
            { label: "Đã chấm điểm", value: graded },
            { label: "Đã trả lại", value: returned }
          ]}
        />
      </div>

      {/* Assignment Info Banner (Premium Style) */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/5 via-primary/5 to-background border border-border/40 p-8 md:p-10">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="rounded-lg uppercase text-[10px] font-black px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                  {assignment.type === AssignmentType.TEXT && "Văn bản"}
                  {assignment.type === AssignmentType.FILE && "Tệp tin"}
                  {assignment.type === AssignmentType.BOTH && "Văn bản & Tệp tin"}
                </Badge>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                  <span className="w-6 h-[1px] bg-border" />
                  <span className="font-mono text-muted-foreground/60 flex items-center gap-1.5">
                    <ArrowUpRight className="size-3" />
                    ID: {assignment.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground tracking-tight leading-tight">
                {assignment.title}
              </h2>
            </div>

            <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md p-4 rounded-2xl border border-border/40 shadow-sm shrink-0">
               <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-primary">
                 <Clock className="size-5" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-widest mb-0.5">Hạn nộp bài</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : 'Không giới hạn'}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -mr-24 -mt-24 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
      </div>

      {/* Submissions Table with Glassmorphism */}
      <Card className="rounded-[2rem] border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden shadow-sm">
        <SubmissionsTable 
          data={submissions || []} 
          isLoading={isLoadingSubmissions}
          onGrade={handleGrade}
          onView={handleView}
        />
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
