'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { profileApi } from '@/lib/api/services/profile-api'
import { useAcademyClassCatalog } from '@/lib/api/services/academy-course-api'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Spinner } from '@workspace/ui/components/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  Star,
  GraduationCap,
  Clock,
  User
} from 'lucide-react'
import { formatNumber } from '@/utils/format-utils'
import { cn } from '@workspace/ui/lib/utils'

export default function InstructorPublicPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const instructorId = params.id
  const fallbackName = searchParams.get('name')

  // 1. Fetch instructor profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['public-profile', instructorId],
    queryFn: () => profileApi.getPublicProfile(instructorId),
    enabled: !!instructorId,
  })

  // 2. Fetch instructor's live classes
  const { data: liveCourses, isLoading: isLiveLoading } = useAcademyClassCatalog({
    mode: 'LIVE',
    instructorId: instructorId,
  })

  // 3. Fetch instructor's VOD courses
  const { data: vodCourses, isLoading: isVodLoading } = useAcademyClassCatalog({
    mode: 'VOD',
    instructorId: instructorId,
  })

  const isLoading = isProfileLoading || isLiveLoading || isVodLoading
  const name = profile?.displayName || fallbackName || 'Giảng viên'
  const bio = profile?.userMetadata?.bio || 'Giảng viên giàu kinh nghiệm tại Torii Academy.'
  const avatarUrl = profile?.avatarUrl
  const stats = profile?.stats || { totalCourses: 0, totalLearningHours: 0 }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Spinner className="size-8 text-primary/40" />
        <p className="text-xs font-bold text-muted-foreground animate-pulse">Đang tải hồ sơ giảng viên...</p>
      </div>
    )
  }

  const liveItems = liveCourses?.items || []
  const vodItems = vodCourses?.items || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-in fade-in duration-700">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground/60 hover:text-foreground text-[10px] font-bold uppercase tracking-wider h-8" asChild>
          <Link href="/dashboard/available-courses">
            <ArrowLeft className="mr-2 h-3 w-3" />
            Quay lại khám phá
          </Link>
        </Button>
      </div>

      {/* Profile Section - Premium Design */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-primary/10 p-8 md:p-12">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 size-96 bg-primary/10 rounded-full blur-[100px]" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10">
          {avatarUrl && (
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-2xl -rotate-6 scale-95" />
              <Avatar className="size-40 md:size-48 rounded-[2rem] border-4 border-white dark:border-zinc-900 shadow-2xl relative">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                  {name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 border-4 border-white dark:border-zinc-900">
                <GraduationCap className="size-6" />
              </div>
            </div>
          )}

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] uppercase font-black tracking-widest px-3 py-1">
                Expert Instructor
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-tight">
                {name}
              </h1>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl font-medium">
              {bio}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Khóa học</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="size-5 text-primary/60" />
                  {liveItems.length + vodItems.length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Đánh giá</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <Star className="size-5 text-yellow-500/60" />
                  4.9
                </p>
              </div>
              {stats.totalLearningHours > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Thời gian dạy</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="size-5 text-primary/60" />
                    {stats.totalLearningHours}h
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <div className="grid grid-cols-1 space-y-20 pt-10">
        {/* Live Classes */}
        {liveItems.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1.5 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              <h2 className="text-2xl font-black tracking-tight uppercase italic">Lớp Live đang mở</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveItems.map((klass: any) => (
                <CourseCard key={klass.id} klass={klass} mode="LIVE" />
              ))}
            </div>
          </section>
        )}

        {/* VOD Courses */}
        {vodItems.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1.5 rounded-full bg-primary/40" />
              <h2 className="text-2xl font-black tracking-tight uppercase italic">Khóa học VOD</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vodItems.map((klass: any) => (
                <CourseCard key={klass.id} klass={klass} mode="VOD" />
              ))}
            </div>
          </section>
        )}

        {liveItems.length === 0 && vodItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/20">
              <BookOpen className="size-10" />
            </div>
            <p className="text-lg font-bold text-muted-foreground">Giảng viên hiện chưa có khóa học nào được đăng tải.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({ klass, mode }: { klass: any; mode: 'LIVE' | 'VOD' }) {
  const profile = klass.cohort?.courseProfile ?? klass.courseProfile
  const thumb = klass.thumbnailUrl || profile?.thumbnailUrl || '/course-placeholder.jpg'
  const title = klass.name || klass.title || profile?.title || 'Khóa học'
  const level = profile?.level || '—'

  // Normalize price
  const basePrice = Number(klass.price || 0)
  const discountPrice = klass.discountPrice ? Number(klass.discountPrice) : null
  const hasDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < basePrice
  const displayPrice = hasDiscount ? discountPrice : basePrice

  return (
    <Card className="group border-border/40 bg-card hover:bg-muted/5 hover:border-primary/20 transition-all duration-300 rounded-3xl overflow-hidden shadow-none h-full flex flex-col p-0">
      <CardContent className="p-0 flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full bg-muted/10 overflow-hidden">
          <Image src={thumb} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/90 backdrop-blur-md text-primary border-none px-2.5 py-1 rounded-xl font-black text-[9px] shadow-sm uppercase">
              {level}
            </Badge>
            <Badge className={cn(
              "text-white border-none px-2.5 py-1 rounded-xl font-black text-[9px] shadow-sm uppercase",
              mode === 'LIVE' ? "bg-red-500" : "bg-primary"
            )}>
              {mode}
            </Badge>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1 space-y-4">
          <div className="space-y-1">
            <h3 className="text-md font-bold tracking-tight text-foreground/90 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">{title}</h3>
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">{klass.code}</p>
          </div>

          {mode === 'LIVE' && klass.term?.openingDate && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/60">
              <Calendar className="size-3.5" />
              <span>Khai giảng: {new Date(klass.term.openingDate).toLocaleDateString('vi-VN')}</span>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-border/20 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className={cn(
                "text-md font-black tabular-nums tracking-tighter",
                hasDiscount ? "text-red-500" : "text-primary",
              )}>
                {formatNumber(displayPrice)} <span className="text-[9px] uppercase ml-0.5">đ</span>
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-muted-foreground/40 line-through font-bold">{formatNumber(basePrice)} đ</span>
              )}
            </div>
            <Button size="sm" className="h-8 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/10 group-hover:scale-[1.05] transition-all" asChild>
              <Link href={`/dashboard/available-courses/class/${klass.id}?mode=${mode}`}>Xem chi tiết</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
