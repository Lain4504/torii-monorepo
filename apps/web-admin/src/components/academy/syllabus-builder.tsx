import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Info } from "lucide-react"

export function SyllabusBuilder() {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Syllabus Builder (legacy)</AlertTitle>
      <AlertDescription>
        Công cụ syllabus dựa trên Course Edition / Chapter đã được thay thế bởi Class Syllabus mới.
        Vui lòng sử dụng trang &quot;Class Syllabus&quot; trong màn hình Lớp học.
      </AlertDescription>
    </Alert>
  )
}
