'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Award, Download, Share2, FileText, Calendar, ExternalLink } from 'lucide-react'
import { formatDate } from '@/utils/format-utils'
import Link from 'next/link'
import { useCertificates } from '@/lib/api/services/certificate-api'
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
        <div className="max-w-5xl mx-auto space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="space-y-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
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
                            <Card key={i} className="rounded-xl border-border/40 p-5 shadow-sm">
                                <div className="flex gap-6 items-center">
                                    <Skeleton className="w-32 h-24 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <Skeleton className="h-6 w-1/2" />
                                        <Skeleton className="h-4 w-1/3" />
                                        <div className="flex gap-4 mt-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
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
                    <div className="space-y-5">
                        {certificates.map((cert: CertificateResponseDTO) => {
                            const certClass = (cert as any)?.class as { code?: string; name?: string } | undefined
                            const certName = certClass?.name || 'Chứng chỉ hoàn thành khóa học'
                            const certCode = cert.certificateCode

                            return (
                                <Card 
                                    key={cert.id} 
                                    className="group relative overflow-hidden bg-card hover:bg-muted/5 border-border/40 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                                >
                                    <div className="flex flex-col md:flex-row p-4 md:p-6 gap-6 md:items-center">
                                        {/* Certificate Preview/Icon Part */}
                                        <div className="relative group/icon shrink-0">
                                            <div className="w-36 h-28 bg-white border border-border/50 rounded-lg shadow-sm flex flex-col items-center justify-center p-3 transition-all duration-500 group-hover:scale-105 group-hover:border-blue-200">
                                                <div className="w-full h-full border border-dashed border-border/30 rounded flex flex-col items-center justify-center bg-[#F9FAFB] relative overflow-hidden">
                                                    <div className="w-10 h-1 bg-muted-foreground/10 absolute top-2 left-2 rounded-full" />
                                                    <div className="w-12 h-1 bg-muted-foreground/10 absolute top-4 left-2 rounded-full" />
                                                    <div className="w-8 h-1 bg-muted-foreground/10 absolute top-6 left-2 rounded-full" />
                                                    
                                                    <FileText className="w-10 h-10 text-muted-foreground/20" strokeWidth={1.5} />
                                                    
                                                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border border-amber-300 flex items-center justify-center bg-amber-50">
                                                        <Award className="w-3 h-3 text-amber-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Info */}
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex flex-col space-y-1">
                                                {cert.fileUrl ? (
                                                    <Link 
                                                        href={cert.fileUrl} 
                                                        target="_blank" 
                                                        className="text-xl font-bold text-[#2563EB] hover:text-blue-700 leading-tight transition-colors inline-flex items-center gap-2 group-hover:underline decoration-blue-200"
                                                    >
                                                        {certName}
                                                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </Link>
                                                ) : (
                                                    <h3 className="text-xl font-bold text-[#2563EB] leading-tight capitalize">
                                                        {certName}
                                                    </h3>
                                                )}
                                                <p className="text-sm font-semibold text-muted-foreground">Torii Academy</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                    <span>Ngày cấp: {formatDate(cert.issueDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span>Đã cấp</span>
                                                </div>
                                                <div className="hidden sm:block text-xs font-mono text-muted-foreground/60 px-2 py-0.5 rounded bg-muted/40 uppercase tracking-tighter">
                                                    ID: {certCode}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Part */}
                                        <div className="flex items-center gap-2 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/40">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                disabled={!cert.fileUrl}
                                                className="h-10 px-4 rounded-full border-border/60 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all font-bold text-xs shadow-sm"
                                            >
                                                {cert.fileUrl ? (
                                                    <Link href={cert.fileUrl} target="_blank" download>
                                                        <Download className="w-3.5 h-3.5 mr-2" /> Tải chứng chỉ
                                                    </Link>
                                                ) : (
                                                    <span className="cursor-not-allowed opacity-50">
                                                        <Download className="w-3.5 h-3.5 mr-2" /> Chưa có file
                                                    </span>
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all text-muted-foreground"
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
