'use client'

import { useEffect, useState } from 'react'
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
import { academyClassReviewHooks } from '@/lib/api/services/academy-class-reviews'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  PlayCircle,
  Users,
  ShieldCheck,
  Star,
  Zap,
  ChevronRight,
  GraduationCap,
  Gift
} from 'lucide-react'
import { formatNumber } from '@/utils/format-utils'
import { useAppSelector } from '@/hooks/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Separator } from '@workspace/ui/components/separator'
import { cn } from '@workspace/ui/lib/utils'

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

  const isLIVE = mode === 'LIVE' || klass?.mode === 'LIVE'
  const isVOD = mode === 'VOD' || klass?.mode === 'VOD'

  const cohortId = klass?.cohortId || klass?.cohort?.id || '';
  const { data: liveReviewsResponse } = academyClassReviewHooks.useListByClass(cohortId, { limit: 10, offset: 0 })
  const { data: vodReviewsResponse } = academyClassReviewHooks.useListByVodPackage(classId || '', { limit: 10, offset: 0 })

  const reviews = isLIVE 
    ? (liveReviewsResponse?.data?.data?.items ?? [] as any[]) 
    : (vodReviewsResponse?.data?.data?.items ?? [] as any[])
    
  const totalReviews = isLIVE 
    ? (liveReviewsResponse?.data?.data?.total ?? 0) 
    : (vodReviewsResponse?.data?.data?.total ?? 0)
  
  const avgRating = reviews && reviews.length > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) 
    : "5.0"

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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="size-10 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground animate-pulse">Đang tải thông tin khóa học...</p>
      </div>
    )
  }

  if (!klass) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-card border border-dashed rounded-3xl">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShieldCheck className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Không tìm thấy lớp</h2>
        <p className="text-muted-foreground text-sm mt-2 max-w-md">Lớp không tồn tại hoặc đã ngừng mở bán.</p>
        <Button className="mt-8 font-bold rounded-xl px-8" variant="default" asChild>
          <Link href="/dashboard/available-courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    )
  }

  const thumb = klass.thumbnailUrl || profile?.thumbnailUrl || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop"
  const jlptLevel = profile?.level
  const title = klass.name || klass.title || profile?.title || 'Khóa học'
  const subtitle = profile?.title && title !== profile.title ? profile.title : null
  const isEnrolled = !!enrollmentData?.isEnrolled
  const enrollment = enrollmentData?.enrollment as any;
  const progress = enrollment?.progress || (enrollmentData as any)?.progress || 0;

  const openingDate = klass.cohort?.startDate || klass.term?.openingDate;
  const instructorName = klass.instructor?.displayName || profile?.instructorName || "Torii Instructor";

  const ctaButton = (() => {
    const giftHref = `${checkoutHref}${checkoutHref.includes('?') ? '&' : '?'}gift=true`

    if (isVOD) {
      if (enrollmentLoading) {
        return (
          <Button className="w-full h-12 font-bold rounded-xl" size="lg" disabled>
            Đang kiểm tra...
          </Button>
        )
      }

      if (isEnrolled) {
        return (
          <div className="space-y-3">
            <Button className="w-full h-12 font-bold rounded-xl" size="lg" asChild>
              <Link href={classId ? `/courses/${classId}/learn` : '#'}>
                Tiếp tục học <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button className="w-full h-12 font-bold rounded-xl border-primary text-primary hover:bg-primary/5" variant="outline" size="lg" asChild>
              <Link href={giftHref}>
                Tặng khóa học <Gift className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )
      }
    }

    if (isEnrolled) {
      return (
        <div className="space-y-3">
          <Button
            className="w-full h-12 font-bold rounded-xl text-md shadow-lg shadow-primary/20"
            size="lg"
            asChild
          >
            <Link href={classId ? `/courses/${classId}/learn` : '#'}>
              Tiếp tục học <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button className="w-full h-12 font-bold rounded-xl border-primary text-primary hover:bg-primary/5" variant="outline" size="lg" asChild>
            <Link href={giftHref}>
              Tặng khóa học <Gift className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <Button
        className="w-full h-12 font-bold rounded-xl text-md shadow-lg shadow-primary/20"
        size="lg"
        asChild
        data-requires-auth={!isAuthenticated ? 'true' : undefined}
      >
        <Link href={checkoutHref}>
          {isLIVE ? "Đăng ký học ngay" : "Mua khóa học"} 
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    )
  })()

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6">
      {/* 1. Standardized Hero Section */}
      <section className="relative overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Content Left (8/12) */}
          <div className="lg:col-span-7 p-6 md:p-10 space-y-8 self-center">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 px-2 rounded-md text-xs" asChild>
                  <Link href="/dashboard/available-courses">
                    <ArrowLeft className="mr-1.5 h-3 w-3" />
                    Quay lại
                  </Link>
                </Button>
                <Badge variant={isLIVE ? "destructive" : "default"} className="px-2.5 py-0.5 rounded-md font-medium text-[10px]">
                  {isLIVE ? 'LỚP HỌC TRỰC TIẾP' : 'KHÓA HỌC VOD'}
                </Badge>
                {jlptLevel && (
                  <Badge variant="secondary" className="px-2.5 py-0.5 rounded-md font-medium text-[10px]">
                    JLPT {jlptLevel}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border/10">
                  {klass.code}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-lg text-muted-foreground font-normal">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:flex md:items-center gap-x-8 gap-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage src={klass.instructor?.avatarUrl} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                    {instructorName[0] || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider leading-none">Giảng viên</p>
                  <p className="text-sm font-semibold">{instructorName}</p>
                </div>
              </div>

              {openingDate && (
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider leading-none flex items-center gap-1.5">
                    <Calendar className="size-3" /> Khai giảng
                  </p>
                  <p className="text-sm font-semibold">{new Date(openingDate).toLocaleDateString('vi-VN')}</p>
                </div>
              )}

              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider leading-none flex items-center gap-1.5">
                  <BookOpen className="size-3" /> Nội dung
                </p>
                <p className="text-sm font-semibold">{lessonCount} bài giảng</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider leading-none flex items-center gap-1.5">
                  <Users className="size-3" /> Đã tham gia
                </p>
                <p className="text-sm font-semibold">{activeEnrollmentCount} học viên</p>
              </div>
            </div>
          </div>

          {/* Media Right (5/12) */}
          <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full border-t lg:border-t-0 lg:border-l">
            <Image 
              src={thumb} 
              alt={title} 
              fill 
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-10">
          
          {/* Section: Overview */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              Tổng quan khóa học
            </h2>
            <Card className="rounded-xl border shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed font-normal">
                  {profile?.description ? (
                    <div dangerouslySetInnerHTML={{ __html: profile.description }} />
                  ) : (
                    <p>Khóa học này được thiết kế để cung cấp cho bạn một lộ trình học tập hiệu quả, tập trung vào thực tế và các kiến thức trọng tâm.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section: Schedule (If LIVE) */}
          {isLIVE && schedules.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Lịch học trực tiếp
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schedules.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-card border shadow-sm hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold">
                        {WEEKDAY_VI[s.weekday ?? 0] ?? '?'}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Thời gian</p>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Clock className="size-3.5 opacity-60" />
                          {s.startTime} - {s.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Curriculum */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Chương trình đào tạo
              </h2>
              <span className="text-xs font-medium text-muted-foreground">{lessonCount} bài học</span>
            </div>

            {chapters.length === 0 ? (
              <Card className="rounded-xl border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">Chương trình học đang được cập nhật.</p>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-3">
                {chapters.map((chapter: any, index: number) => (
                  <AccordionItem 
                    key={chapter.id || index} 
                    value={`item-${index}`}
                    className="border rounded-xl bg-card px-4 md:px-6 overflow-hidden shadow-sm"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-col items-start gap-0.5 text-left">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Phần {index + 1}</span>
                        <span className="font-semibold">{chapter.title || `Module ${index + 1}`}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-2 border-t pt-4">
                      {chapter.items?.map((item: any, itemIdx: number) => (
                        <div key={item.id || itemIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                          <div className="size-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors border">
                            {item.kind === 'VIDEO' ? <PlayCircle className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                          </div>
                          <p className="flex-1 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] font-medium text-muted-foreground/40">{item.kind}</span>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </section>

          {/* Section: Reviews */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Star className="size-5 text-primary" />
                Đánh giá học viên
              </h2>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Star className="size-4 fill-yellow-500 text-yellow-500" />
                <span>{avgRating} ({totalReviews})</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <Card className="rounded-xl border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">Chưa có đánh giá nào.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reviews.map((r: any) => (
                  <Card key={r.id} className="rounded-xl border shadow-sm group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={r.user?.avatarUrl} />
                            <AvatarFallback className="text-[10px] font-bold">
                              {(r.user?.displayName || 'U')[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold">{r.user?.displayName || 'Học viên Torii'}</p>
                            <p className="text-[10px] font-medium text-muted-foreground">Hồ sơ đã xác thực</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "size-3",
                                i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/10"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {r.title && <h4 className="text-sm font-semibold">{r.title}</h4>}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {r.content}
                        </p>
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground/40 border-t pt-3">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Purchase Widget */}
        <aside className="space-y-6 xl:sticky xl:top-24">
          {isEnrolled && (
            <Card className="rounded-xl border shadow-lg border-primary/10 overflow-hidden bg-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-tight">TIẾN TRÌNH HỌC</h3>
                  <Badge variant="secondary" className="h-5 px-1.5 rounded text-[10px]">{progress}%</Badge>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic text-center">Tiếp tục nỗ lực để hoàn thành khóa học nhé!</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-xl border shadow-xl shadow-primary/5 overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Học phí trọn gói</p>
                {(() => {
                  const basePrice = Number(klass?.price ?? 0)
                  const discountPrice = Number(klass?.discountPrice ?? 0)
                  const hasDiscount = discountPrice > 0 && discountPrice < basePrice
                  const displayPrice = hasDiscount ? discountPrice : basePrice
                  return (
                    <div className="space-y-1.5">
                      <div className="text-3xl font-bold text-primary tracking-tighter">
                        {displayPrice === 0 ? 'Miễn phí' : `${formatNumber(displayPrice)}đ`}
                      </div>
                      {hasDiscount && (
                        <p className="text-xs text-muted-foreground line-through opacity-60">
                          {formatNumber(basePrice)}đ
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>

              <div className="space-y-3">
                {ctaButton}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 font-medium italic">
                  <ShieldCheck className="size-3" /> Cam kết chất lượng từ Torii
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Đặc quyền khóa học</p>
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <Zap className="size-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Tương tác thực tế</p>
                      <p className="text-[10px] text-muted-foreground">Môi trường học tập hiện đại</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="size-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Chứng chỉ Torii</p>
                      <p className="text-[10px] text-muted-foreground">Cấp sau khi hoàn thành khóa học</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gift className="size-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Học liệu độc quyền</p>
                      <p className="text-[10px] text-muted-foreground">PDF và tài liệu thực hành</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="w-full text-xs h-10 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all border border-border/50" asChild>
                <Link href="#">
                  Nhận tư vấn lộ trình học
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
