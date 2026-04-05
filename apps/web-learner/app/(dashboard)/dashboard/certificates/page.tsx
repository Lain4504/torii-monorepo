'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Award, Download, Share2, FileText, Calendar, ExternalLink } from 'lucide-react'
import { formatDate } from '@/utils/format-utils'
import Link from 'next/link'
import { useCertificates } from '@/lib/api/services/certificate-api'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { CertificateResponseDTO } from '@workspace/schemas'

export default function CertificatesPage() {
    const { data: response, isLoading } = useCertificates({ limit: '50' })
    const certificates = response?.data || []

    const handleShare = (cert: CertificateResponseDTO) => {
        const verifyUrl = `${window.location.origin}/verify/${cert.certificateCode}`
        const title = (cert as any)?.class?.name ?? 'Torii Academy'
        if (navigator.share) {
            navigator.share({
                title: 'Chứng chỉ Torii Academy',
                text: `Tôi đã hoàn thành khóa học ${title}!`,
                url: verifyUrl,
            }).catch(console.error)
        } else {
            navigator.clipboard.writeText(verifyUrl)
            alert('Đã sao chép link xác thực vào bộ nhớ tạm!')
        }
    }

    return (
        <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Chứng chỉ của tôi
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl leading-relaxed font-medium">
                    Những cột mốc quan trọng ghi dấu ấn nỗ lực và sự nỗ lực không ngừng nghỉ của bạn trên hành trình chinh phục tri thức tại Torii Academy.
                </p>
            </div>

            {/* Certificates List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        Danh sách chứng chỉ 
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 rounded-full font-bold">
                            {certificates.length}
                        </Badge>
                    </h2>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="rounded-xl border-border/40 shadow-sm overflow-hidden flex flex-col">
                                <Skeleton className="w-full h-36 rounded-none" />
                                <div className="p-5 flex-1 space-y-4 flex flex-col">
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <div className="space-y-2 mt-auto pt-4">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <div className="pt-4 border-t flex items-center gap-2">
                                        <Skeleton className="h-10 flex-1 rounded-full" />
                                        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : certificates.length === 0 ? (
                    <div className="py-24 text-center space-y-6 rounded-3xl border-2 border-dashed border-border bg-muted/10 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-muted/5">
                            <Award className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">Bạn chưa có chứng chỉ nào</h3>
                            <p className="text-base text-muted-foreground mt-1 max-w-sm mx-auto">Hãy hoàn thành các khóa học để nhận được những chứng chỉ vinh dự.</p>
                        </div>
                        <Link href="/dashboard/my-courses">
                            <Button className="rounded-full px-8 h-12 text-sm font-bold mt-4 shadow-lg hover:translate-y-[-2px] transition-all">Bắt đầu học ngay</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert: CertificateResponseDTO) => {
                            const certClass = (cert as any)?.class as { code?: string; name?: string } | undefined
                            const certName = certClass?.name || 'Chứng chỉ hoàn thành khóa học'
                            const certCode = cert.certificateCode

                            return (
                                <Card 
                                    key={cert.id} 
                                    className="group relative flex flex-col overflow-hidden bg-card hover:bg-muted/5 border-border/40 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                                >
                                    {/* Certificate Preview/Icon Top Banner */}
                                    <div className="relative w-full h-36 bg-[#F9FAFB] border-b border-border/30 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-blue-50/50">
                                        <div className="w-10 h-1 bg-muted-foreground/10 absolute top-3 left-3 rounded-full" />
                                        <div className="w-16 h-1 bg-muted-foreground/10 absolute top-5 left-3 rounded-full" />
                                        <div className="w-8 h-1 bg-muted-foreground/10 absolute top-7 left-3 rounded-full" />
                                        
                                        <FileText className="w-14 h-14 text-muted-foreground/20 group-hover:text-blue-300 transition-colors duration-300" strokeWidth={1.5} />
                                        
                                        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full border border-amber-300 flex items-center justify-center bg-amber-50 shadow-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                                            <Award className="w-4 h-4 text-amber-500" />
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex flex-col flex-1 p-5 gap-4">
                                        <div className="space-y-1">
                                            <Link 
                                                href={cert.fileUrl || `/verify/${cert.certificateCode}`} 
                                                target={cert.fileUrl ? "_blank" : undefined} 
                                                className="text-lg font-bold text-[#2563EB] hover:text-blue-700 leading-tight transition-colors inline-block group-hover:underline decoration-blue-200 line-clamp-2"
                                            >
                                                {certName}
                                            </Link>
                                            <p className="text-sm font-semibold text-muted-foreground">Torii Academy</p>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-auto pt-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                <span>Ngày cấp: {formatDate(cert.issueDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span>Đã cấp chính thức</span>
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground/60 px-2 py-1 rounded bg-muted/40 uppercase tracking-normaler break-all w-fit mt-1">
                                                ID: {certCode}
                                            </div>
                                        </div>

                                        {/* Actions Part */}
                                        <div className="flex items-center gap-2 pt-4 mt-2 border-t border-border/40">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 h-10 rounded-full border-border/60 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all font-bold text-xs shadow-sm bg-blue-50/30"
                                            >
                                                <Link 
                                                    href={cert.fileUrl || `/verify/${cert.certificateCode}`} 
                                                    target={cert.fileUrl ? "_blank" : undefined}
                                                >
                                                    {cert.fileUrl ? <Download className="w-3.5 h-3.5 mr-2" /> : <ExternalLink className="w-3.5 h-3.5 mr-2" />}
                                                    {cert.fileUrl ? 'Tải PDF' : 'Xem & Tải về'}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 shrink-0 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all text-muted-foreground border border-transparent hover:border-blue-100"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleShare(cert)
                                                }}
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
