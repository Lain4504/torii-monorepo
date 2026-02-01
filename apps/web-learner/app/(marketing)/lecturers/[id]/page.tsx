'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
    Users,
    Star,
    PlayCircle,
    Award,
    Globe,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    MapPin,
    CheckCircle2,
    Share2,
    MessageSquare,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { CourseCard } from '@/components/catalog/course-card'
import { Separator } from '@workspace/ui/components/separator'
import { apiClient } from '@/apis/api-client'

// Types
interface InstructorProfile {
    id: string
    name: string
    headline: string
    bio: string
    avatarUrl: string
    location: string
    email: string
    socials: {
        website?: string
        facebook?: string
        twitter?: string
        linkedin?: string
        youtube?: string
    }
    stats: {
        totalStudents: number
        totalReviews: number
        totalCourses: number
        averageRating: number
    }
    courses: any[]
}

export default function InstructorProfilePage() {
    const params = useParams()
    const [profile, setProfile] = useState<InstructorProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return

            try {
                setLoading(true)
                const instructorId = Array.isArray(params.id) ? params.id[0] : params.id

                // Fetch instructor profile
                const profileRes = await apiClient.get(`/api/profiles/${instructorId}`)
                const userData = profileRes.data.data.user

                // Fetch instructor courses
                const coursesRes = await apiClient.get('/api/courses', {
                    params: {
                        instructorId: instructorId,
                        limit: 100 // Get all courses for now
                    }
                })
                const coursesData = coursesRes.data.data

                // Calculate stats
                const totalStudents = coursesData.reduce((acc: number, course: any) => acc + (course.totalStudents || 0), 0)
                const totalReviews = coursesData.reduce((acc: number, course: any) => acc + (course.totalReviews || 0), 0)
                const averageRating = coursesData.length > 0
                    ? coursesData.reduce((acc: number, course: any) => acc + (course.averageRating || 0), 0) / coursesData.length
                    : 0

                // Parse user metadata if it exists
                let bio = ''
                let headline = ''
                let location = 'Việt Nam'
                let socialLinks = {}

                if (userData.userMetadata) {
                    try {
                        const metadata = typeof userData.userMetadata === 'string'
                            ? JSON.parse(userData.userMetadata)
                            : userData.userMetadata

                        bio = metadata.bio || ''
                        headline = metadata.title || 'Giảng viên Torii'
                        location = metadata.location || 'Việt Nam'
                        socialLinks = metadata.socials || {}
                    } catch (e) {
                        console.error('Failed to parse user metadata', e)
                    }
                }

                setProfile({
                    id: userData.id,
                    name: userData.displayName || 'Giảng viên',
                    headline: headline,
                    bio: bio || '<p>Giảng viên chưa cập nhật thông tin giới thiệu.</p>',
                    avatarUrl: userData.avatarUrl || '',
                    location: location,
                    email: userData.email,
                    socials: socialLinks,
                    stats: {
                        totalStudents: totalStudents,
                        totalReviews: totalReviews,
                        totalCourses: coursesData.length,
                        averageRating: parseFloat(averageRating.toFixed(1))
                    },
                    courses: coursesData.map((course: any) => ({
                        id: course.id,
                        title: course.title,
                        slug: course.slug,
                        thumbnail: course.thumbnailUrl,
                        level: course.jlptLevel,
                        instructor: { name: userData.displayName, avatar: userData.avatarUrl },
                        rating: course.averageRating || 0,
                        reviewCount: course.totalReviews || 0,
                        students: course.totalStudents || 0,
                        price: course.price,
                        originalPrice: course.originalPrice || course.price, // Assuming originalPrice exists or fallback
                        totalLessons: course.totalLessons || 0,
                        totalQuizzes: course.totalQuizzes || 0,
                        isLive: course.type === 'live'
                    }))
                })
            } catch (err) {
                console.error('Failed to fetch instructor data', err)
                setError('Không tìm thấy giảng viên hoặc có lỗi xảy ra.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen pt-20">
                <PageLoading />
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Không tìm thấy giảng viên</h2>
                    <p className="text-muted-foreground">{error || 'Vui lòng kiểm tra lại đường dẫn.'}</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
                        Quay lại
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Hero Section - Udemy Style (but nicer) */}
            <div className="bg-primary/5 border-b border-background/10">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-6xl mx-auto">
                        {/* Avatar Column (Mobile: Top, Desktop: Left) */}
                        <div className="flex-shrink-0 mx-auto md:mx-0">
                            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 md:border-8 border-background shadow-lg">
                                <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
                                <AvatarFallback className="text-xl md:text-3xl bg-primary/10 text-primary font-bold">{profile.name[0]}</AvatarFallback>
                            </Avatar>

                            <div className="flex justify-center gap-3 mt-6">
                                {profile.socials.website && (
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background hover:bg-primary hover:text-white transition-colors border-primary/20" asChild>
                                        <a href={profile.socials.website} target="_blank" rel="noopener noreferrer">
                                            <Globe className="w-4 h-4" />
                                        </a>
                                    </Button>
                                )}
                                {profile.socials.linkedin && (
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-colors border-primary/20" asChild>
                                        <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    </Button>
                                )}
                                {profile.socials.twitter && (
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background hover:bg-black hover:text-white hover:border-black transition-colors border-primary/20" asChild>
                                        <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer">
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                    </Button>
                                )}
                                {profile.socials.youtube && (
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors border-primary/20" asChild>
                                        <a href={profile.socials.youtube} target="_blank" rel="noopener noreferrer">
                                            <Youtube className="w-4 h-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Information Column */}
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-primary mb-2">Giảng viên / Chuyên gia</h4>
                                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
                                    {profile.name}
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground font-medium">{profile.headline}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-lg font-bold leading-none">{profile.stats.totalStudents.toLocaleString()}</p>
                                        <p className="text-xs font-medium text-muted-foreground">Học viên</p>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-border/40 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    <div>
                                        <p className="text-lg font-bold leading-none">{profile.stats.averageRating} ({profile.stats.totalReviews.toLocaleString()})</p>
                                        <p className="text-xs font-medium text-muted-foreground">Đánh giá</p>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-border/40 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-lg font-bold leading-none">{profile.stats.totalCourses}</p>
                                        <p className="text-xs font-medium text-muted-foreground">Khóa học</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                                <Button className="h-10 px-6 rounded-lg font-semibold">
                                    Theo dõi
                                </Button>
                                <Button variant="outline" className="h-10 px-6 rounded-lg font-semibold border-primary/20 text-primary hover:bg-primary/5">
                                    Gửi tin nhắn
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: About & Courses */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* About Me */}
                        <section className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
                            <h2 className="text-2xl font-bold text-foreground">
                                Giới thiệu
                            </h2>
                            <div
                                className="prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: profile.bio }}
                            />
                        </section>

                        <Separator className="bg-border/40" />

                        {/* Courses */}
                        <section className="space-y-6 animate-in slide-in-from-bottom-5 duration-700 delay-100">
                            <h2 className="text-2xl font-bold text-foreground">
                                Khóa học của tôi ({profile.courses.length})
                            </h2>

                            {profile.courses.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {profile.courses.map((course) => (
                                        <div key={course.id} className="h-full">
                                            <CourseCard {...course} className="h-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Chưa có khóa học nào.</p>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8 animate-in fade-in duration-1000 delay-200">
                        {/* Highlights Card */}
                        <div className="bg-muted/30 border border-border/40 rounded-3xl p-6 md:p-8 space-y-6 sticky top-24">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Thành tựu nổi bật</h3>

                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-sm">Vị trí</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{profile.location}</p>
                                    </div>
                                </li>
                            </ul>

                            <Separator className="bg-border/30" />

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Liên kết chia sẻ</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="w-full justify-start text-xs border-dashed gap-2">
                                        <Share2 className="w-3 h-3" />
                                        Copy Link
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start text-xs border-dashed gap-2">
                                        <MessageSquare className="w-3 h-3" />
                                        Report
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
