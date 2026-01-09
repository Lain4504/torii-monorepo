'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Award, Download, Share2, Calendar, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function CertificatesPage() {
    // Mock data - replace with actual API calls
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

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Chứng chỉ của tôi</h1>
                <p className="text-muted-foreground mt-2">
                    Xem và tải xuống các chứng chỉ bạn đã nhận được
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng chứng chỉ</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {certificates.length}
                                </p>
                            </div>
                            <Award className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {Math.round(
                                        certificates.reduce((sum, c) => sum + c.score, 0) /
                                            certificates.length
                                    )}
                                </p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Cấp độ cao nhất</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {certificates[certificates.length - 1]?.level || 'N/A'}
                                </p>
                            </div>
                            <Award className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Certificates List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((certificate) => (
                    <Card
                        key={certificate.id}
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <div className="text-center">
                                <Award className="w-16 h-16 text-primary mx-auto mb-2" />
                                <Badge variant="secondary" className="text-sm">
                                    JLPT {certificate.level}
                                </Badge>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                                {certificate.courseTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {certificate.instructor}
                            </p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Điểm số</span>
                                    <span className="font-medium text-foreground">
                                        {certificate.score}/100
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Ngày cấp</span>
                                    <span className="font-medium text-foreground">
                                        {new Date(certificate.issuedDate).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Mã chứng chỉ</span>
                                    <span className="font-mono text-xs text-foreground">
                                        {certificate.certificateId}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 cursor-pointer"
                                >
                                    <Download className="mr-2 w-4 h-4" />
                                    Tải xuống
                                </Button>
                                <Button variant="outline" size="sm" className="cursor-pointer">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {certificates.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Chưa có chứng chỉ
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Hoàn thành khóa học để nhận chứng chỉ
                        </p>
                        <Link href="/courses">
                            <Button className="cursor-pointer">Khám phá khóa học</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

