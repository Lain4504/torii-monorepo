'use client'

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

import { useAcademyOffering } from "@/lib/api/services/academy-course-api"
import { formatNumber } from "@/utils/format-utils"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Clock,
  FileText,
  MonitorPlay,
  PlayCircle,
  ShieldCheck,
  Users,
} from "lucide-react"

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>()
  const offeringId = params?.slug
  const { data: offering, isLoading } = useAcademyOffering(offeringId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    )
  }

  if (!offering) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold">Không tìm thấy khóa học</h2>
        <p className="text-muted-foreground">
          Khóa học bạn đang tìm kiếm có thể không tồn tại hoặc đã bị gỡ.
        </p>
        <Button asChild>
          <Link href="/dashboard/available-courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách khóa học
          </Link>
        </Button>
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
    <div className="w-full space-y-8">
      {/* Top Navigation */}
      <div>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground pl-0"
          asChild
        >
          <Link href="/dashboard/available-courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách khóa học
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Content Column */}
        <div className="lg:col-span-2 space-y-10">

          {/* Hero Section */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {offering.jlptLevel && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1">
                  {offering.jlptLevel}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`px-3 py-1 ${offering.type === "LIVE"
                  ? "border-red-500/50 text-red-500 bg-red-500/10 hover:bg-red-500/20"
                  : "border-blue-500/50 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                  }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  {offering.type === "LIVE" && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  {offering.type === "LIVE" ? "Trực tuyến" : "Video VOD"}
                </span>
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-muted-foreground">
                Mã: {offering.code}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              {offering.title}
            </h1>

            <div className="flex flex-wrap gap-y-4 gap-x-8 text-sm font-medium text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary/70" />
                <span>{classCount} lớp khả dụng</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary/70" />
                <span>
                  {offering.validFrom
                    ? new Date(offering.validFrom).toLocaleDateString("vi-VN")
                    : "Ngay bây giờ"}{" "}
                  -{" "}
                  {offering.validTo
                    ? new Date(offering.validTo).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </span>
              </div>
              {estimatedMinutes > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary/70" />
                  <span>Khoảng {Math.round(estimatedMinutes / 60)} giờ học</span>
                </div>
              )}
            </div>
          </div>

          {/* Hero Thumbnail */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-border/50 group">
            <Image
              src={offering.thumbnailUrl || "/course-placeholder.jpg"}
              alt={offering.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          </div>

          {/* About Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground border-b pb-4">
              Giới thiệu khóa học
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-muted-foreground text-base">
              {offering.description ? (
                <div dangerouslySetInnerHTML={{ __html: offering.description }} />
              ) : (
                <p className="italic">Chưa có mô tả cho khóa học này.</p>
              )}
            </div>
          </section>

          {/* Syllabus Section */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Nội dung chương trình
              </h2>
              <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-md">
                {chapters.length} chương • {lessonCount} bài học
              </div>
            </div>

            {chapters.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                Syllabus chi tiết chưa được cập nhật.
              </div>
            ) : (
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Accordion type="multiple" className="w-full">
                  {chapters.map((chapter: any, chapterIndex: number) => {
                    const chapterItems = Array.isArray(chapter?.items) ? chapter.items : []
                    return (
                      <AccordionItem
                        key={chapter.id ?? chapterIndex}
                        value={String(chapter.id ?? chapterIndex)}
                        className="border-b last:border-0"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-all data-[state=open]:bg-muted/30">
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-4 text-left">
                            <span className="font-semibold text-base">
                              {chapter.title || `Chương ${chapterIndex + 1}`}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                              {chapterItems.length} bài học
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 py-4 bg-muted/10">
                          <div className="space-y-4">
                            {chapter.description && (
                              <p className="text-sm text-muted-foreground bg-background rounded-lg p-3 border">
                                {chapter.description}
                              </p>
                            )}
                            {chapterItems.length === 0 ? (
                              <p className="text-sm italic text-muted-foreground">
                                Chưa có nội dung bài học.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {chapterItems.map((item: any, itemIndex: number) => (
                                  <div
                                    key={item.id ?? `${chapterIndex}-${itemIndex}`}
                                    className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:border-primary/50"
                                  >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                      {item.kind === "VIDEO" ? (
                                        <PlayCircle className="h-4 w-4" />
                                      ) : (
                                        <FileText className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                      <p className="text-sm font-medium leading-none">
                                        {item.title || `Bài học ${itemIndex + 1}`}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                      {item.kind || "TÀI LIỆU"}
                                    </Badge>
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
              </div>
            )}
          </section>

          {/* Class Information (if primaryClass exists) */}
          {primaryClass && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground border-b pb-4">
                Thông tin lớp học chính
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 shadow-sm">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tên lớp</span>
                  <span className="font-semibold text-base">{primaryClass.name || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 shadow-sm">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mã lớp</span>
                  <span className="font-semibold text-base tracking-tight">{primaryClass.code || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 shadow-sm">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hình thức học</span>
                  <span className="font-semibold text-base">{primaryClass.mode || offering.type || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 shadow-sm">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Thời lượng dự kiến</span>
                  <span className="font-semibold text-base">
                    {primaryClass.settings?.hours_count
                      ? `${primaryClass.settings.hours_count} giờ`
                      : "Đang cập nhật"}
                  </span>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Right Sticky Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-border shadow-2xl overflow-hidden rounded-2xl relative">
              {/* Highlight bar at top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 w-full bg-gradient-to-r from-primary to-primary/60" />

              <CardContent className="p-6 pt-10 space-y-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Phí đăng ký</p>
                  <h3 className="text-4xl sm:text-5xl font-black text-primary tracking-tighter">
                    {offering.price === 0 ? "Miễn phí" : `${formatNumber(offering.price || 0)} đ`}
                  </h3>
                </div>

                <div className="space-y-4 pt-2">
                  <Button
                    className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                    size="lg"
                    asChild
                  >
                    <Link href={`/checkout/${offering.id}`}>
                      Tiến hành thanh toán <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 py-2 px-3 rounded-lg mx-auto w-max">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Thanh toán an toàn 100%</span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/60">
                  <h4 className="font-semibold text-sm mb-4">Khóa học này bao gồm:</h4>
                  <ul className="space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-3">
                      <MonitorPlay className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Truy cập mọi lúc, mọi nơi trên đa nền tảng</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Tài liệu học tập và bài tập thực hành đi kèm</span>
                    </li>
                    {offering.type === "LIVE" && (
                      <li className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>Học trực tiếp và tương tác cùng giảng viên</span>
                      </li>
                    )}
                    <li className="flex items-start gap-3">
                      <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Nhận chứng nhận sau khi hoàn thành</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-xl border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Bạn cần hỗ trợ?{" "}
                <Link href="/contact" className="font-semibold text-primary hover:underline">
                  Liên hệ chúng tôi
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
