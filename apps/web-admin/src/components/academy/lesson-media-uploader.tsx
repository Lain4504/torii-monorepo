import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldError,
} from "@workspace/ui/components/field"
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { storageApi } from "@/lib/api/services/storage-api"

interface LessonMediaUploaderProps {
  label?: string
  description?: string
  value?: string | null
  onChange: (url: string | null) => void
  accept?: string
  errorMessage?: string
}

export function LessonMediaUploader({
  label = "File nội dung",
  description,
  value,
  onChange,
  accept,
  errorMessage,
}: LessonMediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLocalError(null)
    setUploading(true)
    setProgress(10)

    try {
      const response = await storageApi.uploadFile(file, "academy-lessons")
      setProgress(90)
      onChange(response.fileUrl)
      setProgress(100)
    } catch (error: any) {
      console.error(error)
      setLocalError(error?.message || "Upload thất bại")
      onChange(null)
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => {
                const input = document.createElement("input")
                input.type = "file"
                if (accept) {
                  input.accept = accept
                }
                input.onchange = handleFileChange
                input.click()
              }}
            >
              {uploading ? "Đang upload..." : "Chọn file"}
            </Button>
            {value && !uploading && (
              <span className="text-sm text-muted-foreground truncate">
                {value}
              </span>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                Đang tải file lên, vui lòng chờ...
              </p>
            </div>
          )}

          {value && !uploading && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview</p>
              {value.match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={value}
                  controls
                  className="w-full rounded-md"
                />
              ) : value.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                <img
                  src={value}
                  alt="Lesson media"
                  className="w-full rounded-md"
                />
              ) : (
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  Mở file
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <FieldError>{errorMessage || localError}</FieldError>
    </Field>
  )
}

