'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { 
    Award, Share2, Calendar
} from 'lucide-react'
import { formatDate } from '@/utils/format-utils'
import Link from 'next/link'
import { useCertificates } from '@/lib/api/services/certificate-api'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { CertificateResponseDTO } from '@workspace/schemas'
import { toast } from 'sonner'


export default function CertificatesPage() {
    const { data: response, isLoading } = useCertificates({ limit: '50' })
    const certificates = response?.data || []

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Đã sao chép mã chứng chỉ!')
    }

    const handleShare = (cert: CertificateResponseDTO) => {
        const verifyUrl = `${window.location.origin}/verify/${cert.certificateCode}`
        const title = (cert as any)?.class?.name ?? 'Torii Academy'
        if (navigator.share) {
            navigator.share({
                title: 'Chứng chỉ Torii Nihongo',
                text: `Tôi đã hoàn thành khóa học ${title} tại Torii Nihongo!`,
                url: verifyUrl,
            }).catch(console.error)
        } else {
            navigator.clipboard.writeText(verifyUrl)
            toast.success('Đã sao chép link xác thực!')
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-8">
            {/* Standard Header */}
            <div className="space-y-4 pb-8 border-b border-border">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Chứng chỉ của tôi</h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Minh chứng cho sự nỗ lực và quá trình học tập bền bỉ của bạn tại Torii Academy.
                </p>
            </div>

            {/* List Section */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-md" />
                    ))}
                </div>
            ) : certificates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center space-y-2">
                        <Award className="mx-auto size-6 text-muted-foreground" />
                        <p className="text-sm">Chưa có chứng chỉ nào</p>
                        <p className="text-sm text-muted-foreground">
                            Hoàn thành khóa học để nhận chứng chỉ của bạn.
                        </p>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard/my-courses">Bắt đầu học</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {certificates.map((cert: CertificateResponseDTO) => {
                        const certClass = (cert as any)?.class as { code?: string; name?: string } | undefined
                        const certName = certClass?.name || 'Chứng chỉ hoàn thành'
                        const certCode = cert.certificateCode
                        const actionUrl = cert.fileUrl || `/verify/${cert.certificateCode}`

                        return (
                            <Card key={cert.id}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex items-center gap-3">
                                            <Award className="size-5 text-primary shrink-0" />
                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate text-sm">{certName}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    <span>ID: {certCode.slice(0, 12)}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(cert.issueDate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge variant="secondary">Chính thức</Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleShare(cert)}
                                            >
                                                <Share2 className="size-4" />
                                                Chia sẻ
                                            </Button>
                                            <Button asChild size="sm">
                                                <Link href={actionUrl} target="_blank">Xác thực</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
