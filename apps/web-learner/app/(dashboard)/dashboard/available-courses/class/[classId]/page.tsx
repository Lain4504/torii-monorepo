'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

import { useAcademyClassCatalogById } from '@/lib/api/services/academy-course-api'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Spinner } from '@workspace/ui/components/spinner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import { useAcademyEnrollmentCheck } from '@/lib/api/services/academy-enrollment-api'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  PlayCircle,
  Users,
} from 'lucide-react'
import { formatNumber } from '@/utils/format-utils'
import { useAppSelector } from '@/hooks/hooks'

const WEEKDAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function ClassCatalogDetailPage() {
  const params = useParams<{ classId: string }>()
  const searchParams = useSearchParams()
  const classId = params?.classId
  const modeParam = (searchParams.get('mode') || '').toUpperCase()
  const mode = modeParam === 'LIVE' || modeParam === 'VOD' ? (modeParam as 'LIVE' | 'VOD') : undefined
  const { data: klass, isLoading } = useAcademyClassCatalogById(classId, mode)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // Kiểm tra người dùng đã ghi danh/chưa (đã mua) cho class này
  const enrollmentCheckClassId = isAuthenticated && classId ? classId : ''
  const { data: enrollmentData, isLoading: enrollmentLoading } = useAcademyEnrollmentCheck(enrollmentCheckClassId)

  const isLIVE = klass?.mode === 'LIVE'
  const isVOD = mode === 'VOD' || klass?.mode === 'VOD'
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
  const activeEnrollmentCount =
    klass?.liveEnrollment?.activeEnrollmentCount ?? klass?._count?.enrollments ?? 0

  const checkoutHref =
    klass && classId
      ? isLIVE
        ? `/checkout/${klass.cohortId ?? classId}?type=LIVE&classId=${encodeURIComponent(classId)}`
        : `/checkout/${classId}?type=VOD`
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
  const title = klass.name || klass.title || profile?.title || 'Khóa học'
  const subtitle = profile?.title && title !== profile.title ? profile.title : null

  const isEnrolled = !!enrollmentData?.isEnrolled

  const ctaButton = (() => {
    if (isVOD) {
      if (enrollmentLoading) {
        return (
          <Button className="w-full" size="lg" disabled>
            Đang kiểm tra...
          </Button>
        )
      }

      if (isEnrolled) {
        return (
          <Button className="w-full" size="lg" asChild>
            <Link href={classId ? `/courses/${classId}/learn` : '#'}>
              Tiếp tục học <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )
      }

      return (
        <Button
          className="w-full"
          size="lg"
          asChild
          data-requires-auth={!isAuthenticated ? 'true' : undefined}
        >
          <Link href={checkoutHref}>
            Mua khóa học <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )
    }

    // LIVE: giữ nguyên luồng hiện tại (dẫn tới checkout hoặc luồng phù hợp)
    return (
      <Button
        className="w-full"
        size="lg"
        asChild
        data-requires-auth={!isAuthenticated ? 'true' : undefined}
      >
        <Link href={checkoutHref}>
          Bắt đầu học <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    )
  })()

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {jlptLevel ? <Badge variant="secondary">{jlptLevel}</Badge> : null}
              <Badge variant={isLIVE ? 'destructive' : 'secondary'}>
                {isLIVE ? 'LIVE' : 'VOD'}
              </Badge>
              <Badge variant="outline" className="font-mono">{klass.code}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {klass.instructor?.displayName ? (
                <span>Giảng viên: {klass.instructor.displayName}</span>
              ) : null}
              {klass.term?.openingDate ? (
                <span>Khai giảng: {new Date(klass.term.openingDate).toLocaleDateString('vi-VN')}</span>
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Giới thiệu khóa học</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
              {profile?.description ? (
                <div dangerouslySetInnerHTML={{ __html: profile.description }} />
              ) : (
                <p>Khóa học này giúp bạn luyện tập theo đúng lộ trình và tiến độ cá nhân.</p>
              )}
            </div>
          </section>

          {isLIVE && schedules.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Lịch học</h2>
              <ul className="rounded-lg border divide-y">
                {schedules.map((s: any) => (
                  <li key={s.id} className="flex justify-between gap-2 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{WEEKDAY_VI[s.weekday ?? 0] ?? '?'}</span>
                    <span>{s.startTime} - {s.endTime}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Course Outline</h2>
              <span className="text-sm text-muted-foreground">{lessonCount} lessons</span>
            </div>

            {chapters.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Chưa có chương trình học.
              </div>
            ) : (
              <Accordion type="multiple" className="w-full rounded-lg border px-3">
                {chapters.map((chapter: any, chapterIndex: number) => {
                  const chapterItems = Array.isArray(chapter?.items) ? chapter.items : []
                  return (
                    <AccordionItem key={chapter.id ?? chapterIndex} value={String(chapter.id ?? chapterIndex)}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex-1 text-left font-medium">
                          {chapter.title || `Chương ${chapterIndex + 1}`}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {chapterItems.map((item: any, itemIndex: number) => (
                          <div
                            key={item.id ?? `${chapterIndex}-${itemIndex}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            {item.kind === 'VIDEO' ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            <span>{item.title}</span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1">
          <Card className="sticky top-24 overflow-hidden">
            <div className="relative aspect-video w-full">
              <Image src={thumb} alt={title} fill className="object-cover" />
            </div>
            <CardContent className="p-4 space-y-4">
              {ctaButton}
              <div className="rounded-md border p-3 text-sm space-y-2">
                <div className="font-semibold">Khóa học có:</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{lessonCount} bài học</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{activeEnrollmentCount} học viên</span>
                </div>
                {klass.term?.openingDate ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Khai giảng {new Date(klass.term.openingDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                ) : null}
                <div className="text-lg font-bold text-primary pt-2">
                  {klass.catalogPrice === 0 ? 'Miễn phí' : `${formatNumber(klass.catalogPrice ?? 0)} đ`}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {isLIVE ? 'Lớp học trực tiếp có giảng viên hướng dẫn.' : 'Học mọi lúc, mọi nơi theo tiến độ của bạn.'}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
