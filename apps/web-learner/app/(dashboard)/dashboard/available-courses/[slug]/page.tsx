'use client'

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"
import { Calendar, Users, ArrowLeft, BookOpen, Clock, FileText } from "lucide-react"
import { useAcademyOffering } from "@/lib/api/services/academy-course-api"
import { formatNumber } from "@/utils/format-utils"

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>()
  const offeringId = params?.slug
  const { data: offering, isLoading } = useAcademyOffering(offeringId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!offering) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/available-courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách khóa học
          </Link>
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Không tìm thấy khóa học.
          </CardContent>
        </Card>
      </div>
    )
  }

  const classes = Array.isArray(offering.classes) ? offering.classes : []
  const classCount = classes.length
  const primaryClass = classes.find((entry: any) => entry?.isPrimary)?.class ?? classes[0]?.class
  const chapters = Array.isArray(primaryClass?.courseEdition?.chapters)
    ? primaryClass.courseEdition.chapters
    : []
  const lessonCount = chapters.reduce((acc: number, chapter: any) => {
    const chapterItems = Array.isArray(chapter?.items) ? chapter.items : []
    return acc + chapterItems.length
  }, 0)
  const estimatedMinutes = chapters.reduce((acc: number, chapter: any) => {
    const raw = Number(chapter?.estimatedMinutes ?? 0)
    return acc + (Number.isFinite(raw) ? raw : 0)
  }, 0)

  return (
    <div className="space-y-6 pb-10">
      <Button variant="outline" asChild>
        <Link href="/dashboard/available-courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách khóa học
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={offering.thumbnailUrl || "/course-placeholder.jpg"}
              alt={offering.title}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{offering.jlptLevel || "N/A"}</Badge>
              <Badge>{offering.type === "LIVE" ? "LIVE" : "VOD"}</Badge>
            </div>
            <CardTitle>{offering.title}</CardTitle>
            <CardDescription>Mã khóa: {offering.code}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: offering.description || "<em>Chưa có mô tả cho khóa học này.</em>",
              }}
            />
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {classCount} lớp khả dụng
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {offering.validFrom ? new Date(offering.validFrom).toLocaleDateString("vi-VN") : "Ngay bây giờ"} -{" "}
                {offering.validTo ? new Date(offering.validTo).toLocaleDateString("vi-VN") : "Không giới hạn"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Thông tin mua khóa học</CardTitle>
            <CardDescription>Kiểm tra thông tin trước khi thanh toán.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Giá khóa học</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(offering.price || 0)} đ</p>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href={`/checkout/${offering.id}`}>Tiến hành thanh toán</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Syllabus công khai
          </CardTitle>
          <CardDescription>
            {chapters.length} chương • {lessonCount} bài học •{" "}
            {estimatedMinutes > 0 ? `${estimatedMinutes} phút ước tính` : "Đang cập nhật thời lượng"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chapters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Khóa học này chưa công khai syllabus chi tiết.
            </p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {chapters.map((chapter: any, chapterIndex: number) => {
                const chapterItems = Array.isArray(chapter?.items) ? chapter.items : []
                return (
                  <AccordionItem key={chapter.id ?? chapterIndex} value={String(chapter.id ?? chapterIndex)}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2 text-left">
                        <span>{chapter.title || `Chương ${chapterIndex + 1}`}</span>
                        <Badge variant="outline">{chapterItems.length} bài</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {chapter.description ? (
                          <p className="text-sm text-muted-foreground">{chapter.description}</p>
                        ) : null}
                        {chapterItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Chương này chưa có bài học công khai.</p>
                        ) : (
                          <div className="space-y-2">
                            {chapterItems.map((item: any, itemIndex: number) => (
                              <div
                                key={item.id ?? `${chapterIndex}-${itemIndex}`}
                                className="flex items-center justify-between rounded-md border p-3"
                              >
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    {item.title || `Bài ${itemIndex + 1}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Loại nội dung: {item.kind || "N/A"}
                                  </p>
                                </div>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin lớp học công khai</CardTitle>
          <CardDescription>Dữ liệu được tổng hợp từ class liên kết với offering.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-muted-foreground">Tên lớp</span>
            <span className="font-medium">{primaryClass?.name || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-muted-foreground">Mã lớp</span>
            <span className="font-medium">{primaryClass?.code || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-muted-foreground">Hình thức</span>
            <span className="font-medium">{primaryClass?.mode || offering.type || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Thời lượng dự kiến
            </span>
            <span className="font-medium">
              {primaryClass?.settings?.hours_count ? `${primaryClass.settings.hours_count} giờ` : "Đang cập nhật"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
