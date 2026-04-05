'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { 
    Award, Download, Share2, 
    Calendar, ShieldCheck, 
    Copy, Trophy, GraduationCap
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : certificates.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-muted/5 border border-dashed rounded-2xl border-border/40">
                    <div className="size-16 rounded-xl bg-muted/10 flex items-center justify-center">
                        <Award className="size-8 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                        <h3 className="text-lg font-bold">Chưa có chứng chỉ nào</h3>
                        <p className="text-sm text-muted-foreground">Hoàn thành khóa học đầu tiên để nhận được chứng chỉ danh giá từ chúng tôi.</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl px-8 font-semibold text-[10px] shadow-none">
                        <Link href="/dashboard/my-courses">Bắt đầu học ngay</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {certificates.map((cert: CertificateResponseDTO) => {
                        const certClass = (cert as any)?.class as { code?: string; name?: string } | undefined
                        const certName = certClass?.name || 'Chứng chỉ hoàn thành'
                        const certCode = cert.certificateCode
                        const actionUrl = cert.fileUrl || `/verify/${cert.certificateCode}`

                        return (
                            <Card key={cert.id} className="overflow-hidden flex flex-col border-border/50 hover:shadow-md transition-shadow group">
                                <div className="relative aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                                     <Award className="size-16 text-muted-foreground/10 group-hover:scale-110 transition-transform duration-700" />
                                    
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <Badge className="bg-primary hover:bg-primary text-white border-none text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm w-fit">Chính thức</Badge>
                                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-none text-[9px] font-mono text-muted-foreground shadow-sm px-2 py-0.5 rounded-md w-fit tabular-nums">ID: {certCode.slice(0, 12)}</Badge>
                                    </div>

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                        <Button asChild size="sm" className="bg-white text-primary hover:bg-white/90 font-bold px-6 rounded-full shadow-lg">
                                            <Link href={actionUrl} target="_blank">Xác thực</Link>
                                        </Button>
                                    </div>
                                </div>

                                <CardContent className="p-5 flex-1 flex flex-col space-y-3">
                                    <h3 className="font-bold text-base leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                                        {certName}
                                    </h3>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                                        <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground/60">
                                            <Calendar className="size-3" />
                                            <span>{formatDate(cert.issueDate)}</span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="size-8 rounded-full hover:bg-primary/5 hover:text-primary"
                                            onClick={() => handleShare(cert)}
                                        >
                                            <Share2 className="size-3.5" />
                                        </Button>
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
