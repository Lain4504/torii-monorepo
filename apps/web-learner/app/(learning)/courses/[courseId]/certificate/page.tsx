'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { formatDate } from '@/utils/format-utils'
import { Card, CardContent } from '@workspace/ui/components/card'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import { academyCourseApi as courseApi } from '@/lib/api/services/academy-course-api'
import { academyClassesApi } from '@/lib/api/services/academy-classes'
import { certificateApi } from '@/lib/api/services/certificate-api'
import { toast } from 'sonner'

export default function CourseCertificatePage() {
    const params = useParams()
    const classId = params.courseId as string
    const [course, setCourse] = useState<any>(null)
    const [certificate, setCertificate] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const classResult = await academyClassesApi.findById(classId)
                if (classResult) {
                    const courseData = await courseApi.getCourseById(classResult.courseProfileId)
                    if (courseData) {
                        setCourse(courseData)
                    }
                }

                // Fetch certificate for this course
                const certs = await certificateApi.getAllCertificates({ classId })
                if (certs.data && certs.data.length > 0) {
                    setCertificate(certs.data[0])
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (classId) {
            fetchData()
        }
    }, [classId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Không tìm thấy khóa học</p>
            </div>
        )
    }

    const handleDownload = async () => {
        if (!certificate) {
            toast.error("Chưa có thông tin chứng chỉ để tải xuống")
            return
        }

        try {
            setDownloading(true)
            const blob = await certificateApi.downloadCertificatePdfById(certificate.id)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `certificate-${certificate.certificateCode || certificate.id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success("Đã tải xuống chứng chỉ thành công")
        } catch (error) {
            console.error('Download error:', error)
            toast.error("Có lỗi xảy ra khi tải xuống chứng chỉ")
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${classId}/learn`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Chứng chỉ hoàn thành</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certificate */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <Card className="border-2">
                    <CardContent className="p-12">
                        <div className="text-center space-y-6">
                            <div className="border-b-2 border-primary pb-6">
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    Chứng chỉ hoàn thành
                                </h2>
                                <p className="text-muted-foreground">
                                    Chứng nhận rằng học viên đã hoàn thành thành công khóa học
                                </p>
                            </div>

                            <div className="py-8">
                                <h3 className="text-2xl font-semibold text-foreground mb-4">
                                    {course.title}
                                </h3>
                                <p className="text-muted-foreground mb-2">
                                    Ngày hoàn thành: {formatDate(new Date())}
                                </p>
                            </div>

                            <div className="border-t-2 border-primary pt-6">
                                <p className="text-sm text-muted-foreground">
                                    Chứng chỉ này được cấp bởi Torii Nihongo
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <Button size="lg" onClick={handleDownload} disabled={downloading || !certificate}>
                        <Download className="mr-2 w-4 h-4" />
                        {downloading ? "Đang xử lý..." : "Tải xuống PDF"}
                    </Button>
                    <Button variant="outline" size="lg">
                        <Share2 className="mr-2 w-4 h-4" />
                        Chia sẻ
                    </Button>
                </div>
            </div>
        </div>
    )
}
