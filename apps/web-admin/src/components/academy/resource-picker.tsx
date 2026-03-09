import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useAcademyLessons } from "@/lib/api/services/academy-lessons"
import { useAcademyQuizTemplates } from "@/lib/api/services/academy-quiz-templates"
import { useAcademyAssignmentTemplates } from "@/lib/api/services/academy-assignment-templates"
import { useAcademyExams } from "@/lib/api/services/academy-exams"

interface ResourcePickerProps {
  kind: "LESSON" | "QUIZ_TEMPLATE" | "ASSIGNMENT_TEMPLATE" | "EXAM"
  courseProfileId?: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ResourcePicker({
  kind,
  courseProfileId,
  value,
  onChange,
  disabled,
  placeholder = "Chọn tài nguyên...",
}: ResourcePickerProps) {
  // Queries
  const lessonsQuery = useAcademyLessons(
    courseProfileId ? { courseProfileId } : {}
  )
  const quizzesQuery = useAcademyQuizTemplates(
    courseProfileId ? { courseProfileId } : {}
  )
  const assignmentsQuery = useAcademyAssignmentTemplates(
    courseProfileId ? { courseProfileId } : {}
  )
  const examsQuery = useAcademyExams(courseProfileId ? { courseProfileId } : {})

  const { data, isLoading } = useMemo(() => {
    switch (kind) {
      case "LESSON":
        return {
          data: lessonsQuery.data?.map((l) => ({ id: l.id, title: l.title })),
          isLoading: lessonsQuery.isLoading,
        }
      case "QUIZ_TEMPLATE" as any:
      case "QUIZ" as any:
        return {
          data: quizzesQuery.data?.map((q) => ({ id: q.id, title: q.title })),
          isLoading: quizzesQuery.isLoading,
        }
      case "ASSIGNMENT_TEMPLATE" as any:
      case "ASSIGNMENT" as any:
        return {
          data: assignmentsQuery.data?.map((a) => ({ id: a.id, title: a.title })),
          isLoading: assignmentsQuery.isLoading,
        }
      case "EXAM":
        return {
          data: examsQuery.data?.map((e) => ({ id: e.id, title: e.title })),
          isLoading: examsQuery.isLoading,
        }
      default:
        return { data: [], isLoading: false }
    }
  }, [
    kind,
    lessonsQuery.data,
    lessonsQuery.isLoading,
    quizzesQuery.data,
    quizzesQuery.isLoading,
    assignmentsQuery.data,
    assignmentsQuery.isLoading,
    examsQuery.data,
    examsQuery.isLoading,
  ])

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Đang tải..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {data?.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.title}
          </SelectItem>
        ))}
        {data?.length === 0 && (
          <div className="p-2 text-center text-sm text-muted-foreground">
            Không có dữ liệu
          </div>
        )}
      </SelectContent>
    </Select>
  )
}
