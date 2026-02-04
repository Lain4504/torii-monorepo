'use client'

import { FileText, ChevronRight, GraduationCap } from 'lucide-react'

interface CertificatesListProps {
    certificates: any[]
}

export function CertificatesList({ certificates }: CertificatesListProps) {
    if (!certificates || certificates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-3xl border border-dashed border-muted-foreground/20 bg-muted/5">
                <div className="p-4 bg-muted rounded-full">
                    <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold">Chưa có chứng chỉ</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Hoàn thành các khóa học để nhận chứng chỉ công nhận nhé!
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {certificates.map((cert) => (
                <div
                    key={cert.id}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground transition-colors group-hover:text-primary">
                                {cert.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Cấp ngày {cert.date}
                            </p>
                        </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:translate-x-1">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            ))}
        </div>
    )
}
