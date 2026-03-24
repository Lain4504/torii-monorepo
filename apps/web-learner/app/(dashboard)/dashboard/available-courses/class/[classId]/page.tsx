'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useAcademyClassCatalogById } from '@/lib/api/services/academy-course-api'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Spinner } from '@workspace/ui/components/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Clock,
  FileText,
  MonitorPlay,
  PlayCircle,
  Users,
} from 'lucide-react'
import { formatNumber } from '@/utils/format-utils'

const WEEKDAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function ClassCatalogDetailPage() {
  const params = useParams<{ classId: string }>()
  const classId = params?.classId
  const { data: klass, isLoading } = useAcademyClassCatalogById(classId)

  const isLIVE = klass?.mode === 'LIVE'
  const profile = klass?.courseProfile
  const chapters = Array.isArray(profile?.modules)
    ? profile.modules.map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        items: (mod.lessons ?? []).map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          kind: lesson.type || 'VIDEO',
        })),
      }))
    : []

  const lessonCount = chapters.reduce((acc: number, chapter: any) => {
    const chapterItems = Array.isArray(chapter?.items) ? chapter.items : []
    return acc + chapterItems.length
  }, 0)

  const sessions = Array.isArray(klass?.liveScheduleSessions)
    ? klass.liveScheduleSessions
    : []
  const schedules = Array.isArray(klass?.liveSchedules) ? klass.liveSchedules : []

  const checkoutHref =
    klass && classId
      ? isLIVE
        ? `/checkout/${klass.catalogOfferingId}?classId=${encodeURIComponent(classId)}`
        : `/checkout/${klass.catalogOfferingId}`
      : '#'

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    )
  }

  if (!klass) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold">Không tìm thấy lớp</h2>
        <p className="text-muted-foreground">
          Lớp không tồn tại hoặc đã ngừng mở bán.
        </p>
        <Button asChild>
          <Link href="/dashboard/available-courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    )
  }

  const thumb =
    profile?.thumbnailUrl || '/course-placeholder.jpg'
  const jlptLevel = profile?.level

  return (
    <div className="w-full space-y-8">
      <div>
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground pl-0" asChild>
          <Link href="/dashboard/available-courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Banner lớn đặt phía trên để phù hợp trang detail (VOD/Live) */}
          {isLIVE ? (
            <div className="relative aspect-video rounded-2xl overflow-hidden border">
              <Image src={thumb} alt="" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                {jlptLevel ? (
                  <Badge variant="secondary" className="px-3 py-1">
                    {jlptLevel}
                  </Badge>
                ) : null}
                <Badge variant="destructive" className="px-3 py-1">
                  Lớp Live
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {klass.code}
                </Badge>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {klass.name || profile?.title}
                </h1>
                {profile?.title && klass.name && klass.name !== profile.title ? (
                  <p className="text-sm text-muted-foreground mt-2">{profile.title}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="relative w-full sm:w-72 aspect-video rounded-2xl overflow-hidden border shrink-0">
                <Image src={thumb} alt="" fill className="object-cover" priority />
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {jlptLevel ? (
                    <Badge variant="secondary" className="px-3 py-1">
                      {jlptLevel}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary" className="px-3 py-1">
                    Khóa VOD
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {klass.code}
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{klass.name || profile?.title}</h1>

                {profile?.title && klass.name && klass.name !== profile.title ? (
                  <p className="text-base text-muted-foreground">{profile.title}</p>
                ) : null}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-wrap gap-y-4 gap-x-8 text-sm font-medium text-muted-foreground pt-2">
              {klass.term?.openingDate ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary/70" />
                  <span>
                    Khai giảng:{' '}
                    {new Date(klass.term.openingDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary/70" />
                <span>
                  {isLIVE ? 'Lớp trực tiếp có giảng viên hướng dẫn' : 'Học video theo tiến độ của bạn'}
                </span>
              </div>
            </div>

          </div>

          {isLIVE ? (
            <section id="instructor" className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight border-b pb-2">Giảng viên</h2>
              {klass.instructor?.id ? (
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={klass.instructor.avatarUrl || undefined} alt="" />
                    <AvatarFallback>
                      {(klass.instructor.displayName || '?').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/dashboard/instructors/${klass.instructor.id}?name=${encodeURIComponent(klass.instructor.displayName || '')}`}
                      className="font-semibold text-lg hover:underline underline-offset-4"
                    >
                      {klass.instructor.displayName || '—'}
                    </Link>
                    <p className="text-sm text-muted-foreground">Giảng viên</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Chưa cập nhật giảng viên.</p>
              )}
            </section>
          ) : null}

          {isLIVE && (schedules.length > 0 || sessions.length > 0) ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight border-b pb-2">Lịch học</h2>
              {schedules.length > 0 ? (
                <ul className="rounded-lg border divide-y">
                  {schedules.map((s: any) => (
                    <li key={s.id} className="flex justify-between gap-2 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">
                        {WEEKDAY_VI[s.weekday ?? 0] ?? '?'}
                      </span>
                      <span>
                        {s.startTime} – {s.endTime}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {sessions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Buổi học đã xếp lịch</p>
                  <ul className="space-y-1 text-sm max-h-80 overflow-auto rounded-md border p-3 bg-muted/20">
                    {sessions.slice(0, 32).map((s: any) => (
                      <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {new Date(s.sessionDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-muted-foreground">
                          {s.startTime} – {s.endTime}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight border-b pb-4">Giới thiệu</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
              {profile?.description ? (
                <div dangerouslySetInnerHTML={{ __html: profile.description }} />
              ) : (
                <p className="italic">Chưa có mô tả.</p>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4">
              <h2 className="text-2xl font-bold tracking-tight">Chương trình</h2>
              <div className="text-sm text-muted-foreground">
                {chapters.length} chương • {lessonCount} bài
              </div>
            </div>

            {chapters.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                Chưa có nội dung chương trình.
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {chapters.map((chapter: any, chapterIndex: number) => {
                  const chapterItems = Array.isArray(chapter?.items) ? chapter.items : []
                  return (
                    <AccordionItem
                      key={chapter.id ?? chapterIndex}
                      value={String(chapter.id ?? chapterIndex)}
                      className="border-b last:border-0"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-4 text-left">
                          <span className="font-semibold text-base">
                            {chapter.title || `Chương ${chapterIndex + 1}`}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                            {chapterItems.length} bài
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-4 bg-muted/10">
                        <div className="space-y-2">
                          {chapterItems.map((item: any, itemIndex: number) => (
                            <div
                              key={item.id ?? `${chapterIndex}-${itemIndex}`}
                              className="flex items-center gap-3 rounded-lg border bg-background p-3"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {item.kind === 'VIDEO' ? (
                                  <PlayCircle className="h-4 w-4" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                              </div>
                              <p className="text-sm font-medium flex-1">{item.title}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Học phí</p>
                  <p className="text-3xl font-bold text-primary">
                    {klass.catalogPrice === 0 ? 'Miễn phí' : `${formatNumber(klass.catalogPrice ?? 0)} đ`}
                  </p>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link href={checkoutHref}>
                    Đăng ký / Thanh toán <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <MonitorPlay className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Hỗ trợ học trên nền tảng Torii</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Theo dõi tiến độ và chứng nhận khi hoàn thành</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
