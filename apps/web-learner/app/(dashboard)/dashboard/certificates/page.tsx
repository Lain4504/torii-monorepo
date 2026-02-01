'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Award, Download, Share2, Calendar, CheckCircle2, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'

export default function CertificatesPage() {
    const certificates = [
        {
            id: 1,
            courseTitle: 'Tiếng Nhật N5 - Khóa học toàn diện',
            instructor: 'Nguyễn Văn A',
            issuedDate: '2024-01-15',
            certificateId: 'TORII-N5-2024-001',
            level: 'N5',
            score: 95,
        },
        {
            id: 2,
            courseTitle: 'Ngữ pháp N4',
            instructor: 'Trần Thị B',
            issuedDate: '2024-02-20',
            certificateId: 'TORII-N4-2024-002',
            level: 'N4',
            score: 88,
        },
        {
            id: 3,
            courseTitle: 'Từ vựng N3',
            instructor: 'Lê Văn C',
            issuedDate: '2024-03-10',
            certificateId: 'TORII-N3-2024-003',
            level: 'N3',
            score: 92,
        },
    ]

    const stats = [
        { label: 'Chứng chỉ', value: certificates.length.toString(), icon: Award, color: 'text-amber-500' },
        { label: 'Điểm TB', value: '92', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Cấp độ', value: 'N3', icon: Award, color: 'text-primary' },
    ]

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
                            <Icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                            <p className="text-xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Certificates List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                    <Card key={cert.id} className="border-border bg-card hover:shadow-lg transition-all group overflow-hidden flex flex-col cursor-pointer rounded-2xl">
                        <div className="aspect-[1.4] bg-muted/30 border-b border-border flex flex-col items-center justify-center p-6 text-center space-y-3 relative group-hover:bg-muted/50 transition-colors">
                            <div className="absolute top-3 right-3">
                                <Badge className="text-xs font-bold bg-background text-foreground border-border shadow-sm">
                                    {cert.level}
                                </Badge>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-background shadow-md flex items-center justify-center border border-border/20 group-hover:scale-105 transition-transform duration-500">
                                <Award className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground line-clamp-2 px-2 leading-snug">{cert.courseTitle}</h3>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">{cert.certificateId}</p>
                            </div>
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                        <span className="text-xs text-muted-foreground font-medium">Điểm số</span>
                                        <span className="text-sm font-bold text-emerald-600">{cert.score}/100</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground font-medium">Ngày cấp</span>
                                        <span className="text-xs font-bold">{new Date(cert.issuedDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs font-bold h-9 hover:bg-muted transition-all shadow-sm">
                                    <Download className="w-3.5 h-3.5 mr-1.5" /> Tải về
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-xl w-9 h-9 hover:bg-muted transition-all shadow-sm">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {certificates.length === 0 && (
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
