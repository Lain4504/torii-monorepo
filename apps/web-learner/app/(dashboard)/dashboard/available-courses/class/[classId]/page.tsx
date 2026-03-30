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
  ShieldCheck,
  Star,
  Zap,
  ChevronRight,
  GraduationCap
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Đang tải thông tin khóa học...</p>
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
          <Button className="w-full h-12 font-bold rounded-xl" size="lg" asChild>
            <Link href={classId ? `/courses/${classId}/learn` : '#'}>
              Tiếp tục học <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )
      }
    }

    return (
      <Button
        className="w-full h-12 font-bold rounded-xl text-md shadow-lg shadow-primary/20"
        size="lg"
        asChild
        data-requires-auth={!isAuthenticated ? 'true' : undefined}
      >
        <Link href={checkoutHref}>
          {isEnrolled ? "Tiếp tục học" : isLIVE ? "Đăng ký học ngay" : "Mua khóa học"} 
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    )
  })()

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Dashboard-style Header Banner Redesigned with Thumb */}
      <header className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-[2.5rem] -z-10 blur-xl transition-all group-hover:blur-2xl duration-700 opacity-50" />
        <Card className="rounded-[2.5rem] border-none bg-card/60 backdrop-blur-md shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Info Left (8/12) */}
            <div className="lg:col-span-8 p-8 md:p-12 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="ghost" size="sm" className="rounded-full h-8 px-3 text-muted-foreground hover:bg-muted/50 -ml-2" asChild>
                  <Link href="/dashboard/available-courses">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Danh sách
                  </Link>
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <Badge className={cn(
                  "px-4 py-1 rounded-full font-black text-[10px] tracking-[0.1em] uppercase border-none",
                  isLIVE ? "bg-red-500/90 hover:bg-red-500 text-white" : "bg-primary/90 hover:bg-primary text-white"
                )}>
                  {isLIVE ? 'Live Class' : 'VOD Course'}
                </Badge>
                {jlptLevel && (
                  <Badge variant="outline" className="px-4 py-1 rounded-full font-black text-[10px] tracking-[0.1em] uppercase border-primary/20 text-primary">
                    JLPT {jlptLevel}
                  </Badge>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/50 px-3 py-1 rounded-full border border-border/40">
                  {klass.code}
                </span>
              </div>

              <div className="space-y-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[0.9] text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xl md:text-2xl text-muted-foreground font-medium tracking-tight">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage src={klass.instructor?.avatarUrl} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                      {instructorName[0] || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Giảng viên</div>
                    <div className="text-sm font-bold">{instructorName}</div>
                  </div>
                </div>

                {openingDate && (
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-1.5">
                      <Calendar className="size-3" /> Khai giảng
                    </div>
                    <div className="text-sm font-bold">{new Date(openingDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                )}

                <div className="space-y-0.5">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-1.5">
                    <BookOpen className="size-3" /> Nội dung
                  </div>
                  <div className="text-sm font-bold">{lessonCount} bài giảng</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-1.5">
                    <Users className="size-3" /> Học viên
                  </div>
                  <div className="text-sm font-bold">{activeEnrollmentCount} đã đăng ký</div>
                </div>
              </div>
            </div>

            {/* Thumbnail Right (4/12) */}
            <div className="lg:col-span-4 relative min-h-[340px] lg:min-h-full overflow-hidden group/image sm:rounded-b-[2.5rem] lg:rounded-r-[2.5rem] lg:rounded-bl-none">
              <Image 
                src={thumb} 
                alt={title} 
                fill 
                className="object-cover grayscale-[0.2] group-hover/image:grayscale-0 group-hover/image:scale-110 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-card/60 lg:to-card/80 hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start gap-2 lg:hidden">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 font-black text-[10px] tracking-widest">COURSE PREVIEW</Badge>
              </div>
            </div>
          </div>
        </Card>
      </header>

      {/* 2. Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        <div className="xl:col-span-2 space-y-12">
          
          {/* Section: Overview */}
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Zap className="size-6 text-primary fill-primary/20" />
                Tổng quan khóa học
              </h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest px-1">Tìm hiểu những gì bạn sẽ đạt được</p>
            </div>
            <Card className="rounded-[2rem] border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden p-8">
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed font-medium">
                {profile?.description ? (
                  <div dangerouslySetInnerHTML={{ __html: profile.description }} />
                ) : (
                  <p>Khóa học này được thiết kế để mang đến lộ trình tinh gọn, giúp bạn làm chủ kiến thức và kỹ năng Nhật ngữ một cách hiệu quả nhất thông qua tương tác và các bài giảng được biên soạn chuyên sâu.</p>
                )}
              </div>
            </Card>
          </section>

          {/* Section: Schedule (If LIVE) */}
          {isLIVE && schedules.length > 0 && (
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Calendar className="size-6 text-primary fill-primary/20" />
                  Lịch học trực tiếp
                </h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest px-1">Lịch sinh hoạt cố định hàng tuần</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-6 rounded-3xl bg-muted/40 border border-border/50 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                        {WEEKDAY_VI[s.weekday ?? 0] ?? '?'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thời gian</div>
                        <div className="text-sm font-bold flex items-center gap-2">
                          <Clock className="size-3.5" />
                          {s.startTime} - {s.endTime}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-[9px] tracking-[0.1em]">ACTIVE</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Curriculum */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-1">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <BookOpen className="size-6 text-primary fill-primary/20" />
                  Chương trình đào tạo
                </h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Lộ trình bài giảng chi tiết</p>
              </div>
              <Badge variant="secondary" className="rounded-xl px-4 py-1.5 font-bold">{lessonCount} bài học</Badge>
            </div>

            {chapters.length === 0 ? (
              <div className="rounded-[2.5rem] border border-dashed p-12 text-center text-muted-foreground font-medium bg-muted/20">
                Chương trình học đang được cập nhật.
              </div>
            ) : (
              <Accordion type="multiple" className="w-full space-y-4">
                {chapters.map((chapter: any, index: number) => (
                  <AccordionItem 
                    key={chapter.id || index} 
                    value={`item-${index}`}
                    className="border border-border/50 rounded-[2rem] bg-card px-6 overflow-hidden data-[state=open]:shadow-lg transition-all"
                  >
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex flex-col items-start text-left gap-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Chương {index + 1}</span>
                        <span className="text-lg font-black tracking-tight leading-tight">{chapter.title || `Module ${index + 1}`}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 space-y-2">
                      {chapter.items?.map((item: any, itemIdx: number) => (
                        <div key={item.id || itemIdx} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border/50 hover:bg-muted/50 transition-all group">
                          <div className="size-8 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            {item.kind === 'VIDEO' ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors overflow-hidden truncate">
                            {item.title}
                          </div>
                          <Badge variant="ghost" className="text-[9px] font-black text-muted-foreground/50">{item.kind}</Badge>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </section>
        </div>

        {/* Column: Sidebar */}
        <aside className="space-y-8">
          {/* Progress Widget (Only if Enrolled) */}
          {isEnrolled && (
            <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black">Tiến trình lớp học</h3>
                  <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-[9px] tracking-widest">LIVE</Badge>
                </div>
                <div className="p-6 rounded-[2rem] bg-muted/40 border border-border/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                    <Star className="size-16" />
                  </div>
                  <div className="relative space-y-4">
                    <div className="flex items-end justify-between">
                      <div className="text-4xl font-black text-primary tracking-tight">{progress}%</div>
                      <div className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">Hoàn thành</div>
                    </div>
                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(var(--primary),0.3)]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground italic leading-relaxed">
                      * Dựa trên số lượng bài giảng và file học liệu bạn đã truy cập.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="rounded-[2.5rem] border-none bg-card shadow-2xl shadow-primary/5 overflow-hidden ring-1 ring-border/50">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Giá niêm yết</div>
                <div className="text-4xl font-black text-primary tracking-tight">
                  {klass.catalogPrice === 0 ? 'Miễn phí' : `${formatNumber(klass.catalogPrice ?? 0)} đ`}
                </div>
              </div>

              <div className="space-y-4">
                {ctaButton}
                <p className="text-[10px] text-center text-muted-foreground font-bold italic">
                  * Thanh toán một lần, sở hữu vĩnh viễn
                </p>
              </div>

              <Separator />

              <div className="space-y-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Đặc quyền khóa học</div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                    <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="size-5 fill-orange-600/20" />
                    </div>
                    <div>
                      <div className="text-sm font-bold leading-tight">Giao diện học tập Torii</div>
                      <div className="text-[10px] text-muted-foreground font-medium">Trải nghiệm hiện đại & mượt mà</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="size-5 fill-blue-600/20" />
                    </div>
                    <div>
                      <div className="text-sm font-bold leading-tight">Chứng chỉ hoàn thành</div>
                      <div className="text-[10px] text-muted-foreground font-medium">Cấp bởi Torii Academy</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star className="size-5 fill-emerald-600/20" />
                    </div>
                    <div>
                      <div className="text-sm font-bold leading-tight">Học liệu độc quyền</div>
                      <div className="text-[10px] text-muted-foreground font-medium">PDF & bài tập tương tác AI</div>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="w-full justify-between h-auto py-5 px-6 rounded-3xl hover:bg-primary/5 group/share border border-transparent hover:border-primary/10 transition-all mt-4" asChild>
                <Link href="#">
                  <span className="text-xs font-bold text-muted-foreground group-hover/share:text-primary transition-colors">Yêu cầu tư vấn lộ trình</span>
                  <ChevronRight className="size-4 opacity-30 group-hover/share:translate-x-1 group-hover/share:opacity-100 transition-all text-primary" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
