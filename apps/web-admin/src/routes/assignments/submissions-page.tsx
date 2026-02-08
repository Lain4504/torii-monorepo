import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAssignment } from "@/api/services/assignments";
import { useSubmissions } from "@/api/services/submissions";
import { Button } from "@workspace/ui/components/button";
import { 
  ChevronLeft, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { 
  AssignmentType,
  SubmissionStatus,
  type SubmissionResponseDTO 
} from "@workspace/schemas";
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { GradeSubmissionSheet } from "@/components/submissions/grade-submission-sheet";

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
    // For now, view is the same as grade sheet
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

  const stats = [
    {
      label: "Tổng bài nộp",
      value: submissions?.length || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "Đã chấm điểm",
      value: submissions?.filter(s => s.status === SubmissionStatus.GRADED).length || 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Chờ chấm điểm",
      value: submissions?.filter(s => s.status === SubmissionStatus.SUBMITTED).length || 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      label: "Đã trả lại",
      value: submissions?.filter(s => s.status === SubmissionStatus.RETURNED).length || 0,
      icon: AlertCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    }
  ];

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 animate-in fade-in duration-500 pb-20 text-left">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/assignments")}
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground font-bold uppercase text-[10px] tracking-widest"
        >
          <ChevronLeft className="mr-2 size-4" />
          Quay lại danh sách
        </Button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                Quản lý <span className="text-primary not-italic">Bài Nộp</span>
              </h1>
              <Badge variant="outline" className="rounded-lg uppercase text-[10px] font-bold py-0.5 border-primary/20 bg-primary/5 text-primary">
                {assignment.type === AssignmentType.TEXT && "Văn bản"}
                {assignment.type === AssignmentType.FILE && "Tệp tin"}
                {assignment.type === AssignmentType.BOTH && "Văn bản & Tệp tin"}
              </Badge>
            </div>
            <p className="text-lg font-bold text-foreground/80">{assignment.title}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
              ID: {assignment.id.slice(0, 16)}... | Hạn nộp: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'Không có'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4 rounded-2xl border-border/50 bg-card/40 backdrop-blur-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden">
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
