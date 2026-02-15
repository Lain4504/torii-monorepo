'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Award, Download, Share2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useCertificates } from '@/apis/services/certificate-api'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { CertificateResponseDTO } from '@workspace/schemas'

export default function CertificatesPage() {
    const { data: response, isLoading } = useCertificates({ limit: '50' })
    const certificates = response?.data || []

    const stats = [
        { label: 'Chứng chỉ', value: certificates.length.toString(), icon: Award, color: 'text-amber-500' },
        { label: 'Điểm TB', value: '100', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Cấp độ', value: 'N/A', icon: Award, color: 'text-primary' },
    ]

    const handleShare = (cert: CertificateResponseDTO) => {
        const verifyUrl = `${window.location.origin}/verify/${cert.certificateCode}`
        if (navigator.share) {
            navigator.share({
                title: 'Chứng chỉ Torii Academy',
                text: `Tôi đã hoàn thành khóa học ${cert.course?.title}!`,
                url: verifyUrl,
            }).catch(console.error)
        } else {
            navigator.clipboard.writeText(verifyUrl)
            alert('Đã sao chép link xác thực vào bộ nhớ tạm!')
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-4 pb-2 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">
                    Chứng chỉ của tôi
                </h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Ghi nhận nỗ lực và thành quả học tập của bạn tại Torii Academy.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col items-center text-center space-y-1">
                            {isLoading ? (
                                <Skeleton className="h-4 w-4 rounded-full mb-1" />
                            ) : (
                                <Icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                            )}
                            <div className="text-xl font-bold text-foreground">
                                {isLoading ? <Skeleton className="h-6 w-8 mx-auto" /> : stat.value}
                            </div>
                            <div className="text-xs font-bold text-muted-foreground">{stat.label}</div>
                        </div>
                    )
                })}
            </div>

            {/* Certificates List */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="rounded-2xl overflow-hidden border-border space-y-4 p-4">
                            <Skeleton className="aspect-[1.4] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 flex-1 rounded-xl" />
                                <Skeleton className="h-9 w-9 rounded-xl" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert: CertificateResponseDTO) => (
                        <Card key={cert.id} className="border-border bg-card hover:shadow-lg transition-all group overflow-hidden flex flex-col cursor-pointer rounded-2xl">
                            <div className="aspect-[1.4] bg-muted/30 border-b border-border flex flex-col items-center justify-center p-6 text-center space-y-3 relative group-hover:bg-muted/50 transition-colors">
                                <div className="absolute top-3 right-3">
                                    <Badge className="text-xs font-bold bg-background text-foreground border-border shadow-sm">
                                        {cert.course?.jlptLevel || 'CERT'}
                                    </Badge>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-background shadow-md flex items-center justify-center border border-border/20 group-hover:scale-105 transition-transform duration-500">
                                    <Award className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground line-clamp-2 px-2 leading-snug">{cert.course?.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 font-mono">{cert.certificateCode}</p>
                                </div>
                            </div>
                            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                            <span className="text-xs text-muted-foreground font-medium">Trạng thái</span>
                                            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Đã cấp
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground font-medium">Ngày cấp</span>
                                            <span className="text-xs font-bold">{new Date(cert.issueDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 rounded-xl text-xs font-bold h-9 hover:bg-muted transition-all shadow-sm"
                                    >
                                        <Link href={cert.fileUrl} target="_blank" download>
                                            <Download className="w-3.5 h-3.5 mr-1.5" /> Tải về
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-xl w-9 h-9 hover:bg-muted transition-all shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleShare(cert)
                                        }}
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && certificates.length === 0 && (
                <div className="py-20 text-center space-y-4 rounded-2xl border border-dashed border-border bg-muted/5">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <Award className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Bạn chưa có chứng chỉ nào</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">Hãy hoàn thành các khóa học để nhận được những chứng chỉ danh giá nhất.</p>
                    </div>
                    <Link href="/dashboard/my-courses">
                        <Button className="rounded-xl px-6 h-10 text-xs font-bold mt-2">Bắt đầu học ngay</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
