'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useAppSelector } from '@/hooks/hooks'
import { certificateApi } from '@/lib/api/services/certificate-api'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Award, Download, Share2, ShieldCheck, Printer, ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react'
import { formatDate } from '@/utils/format-utils'
import Link from 'next/link'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { CertificateResponseDTO } from '@workspace/schemas'
import { cn } from '@workspace/ui/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function VerifyCertificatePage() {
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    const params = useParams()
    const code = params.code as string
    const [cert, setCert] = useState<CertificateResponseDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const certificateRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchCert = async () => {
            try {
                setLoading(true)
                const result = await certificateApi.verifyCertificate(code)
                if (result.valid && result.certificate) {
                    setCert(result.certificate)
                } else {
                    setError('Không tìm thấy chứng chỉ hoặc mã xác thực không hợp lệ.')
                }
            } catch (err) {
                console.error('Failed to verify certificate:', err)
                setError('Đã có lỗi xảy ra khi xác thực chứng chỉ.')
            } finally {
                setLoading(false)
            }
        }

        if (code) {
            fetchCert()
        }
    }, [code])

    const handlePrint = () => {
        toast.info('Đang chuẩn bị bản in PDF...')
        setTimeout(() => {
            window.print()
        }, 500)
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        toast.success('Đã sao chép liên kết xác thực!')
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="max-w-4xl w-full space-y-8">
                    <div className="text-center space-y-4">
                        <Skeleton className="h-12 w-64 mx-auto rounded-full" />
                        <Skeleton className="h-6 w-96 mx-auto rounded-full" />
                    </div>
                    <Card className="aspect-[1.414/1] w-full bg-white shadow-2xl border-none overflow-hidden relative rounded-2xl">
                        <Skeleton className="absolute inset-0" />
                    </Card>
                </div>
            </div>
        )
    }

    if (error || !cert) {
        return (
            <div className="flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    <Card className="p-10 text-center space-y-8 shadow-2xl border-none rounded-[2rem] bg-white">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50">
                            <Award className="w-12 h-12 text-red-400" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-slate-900">Xác thực thất bại</h2>
                            <p className="text-slate-500 font-medium px-4">{error || 'Chứng chỉ không tồn tại hoặc đã bị thu hồi.'}</p>
                        </div>
                        <Button asChild className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Link href="/dashboard/certificates">Quay lại danh sách</Link>
                        </Button>
                    </Card>
                </motion.div>
            </div>
        )
    }

    const userName = (cert as any).user?.displayName || 'Người dùng Torii'
    const courseName = (cert as any).class?.name || (cert as any).vodPackage?.title || 'Khóa học Torii Academy'
    const issueDate = formatDate(cert.issueDate)
    const score = cert.score != null ? Math.round(cert.score) : null

    return (
        <div className="py-4 px-4 print:p-0 print:bg-white selection:bg-primary/10">
            {/* Action Toolbar (Integrated) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto mb-8 print:hidden"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/50 px-4 sm:px-0">
                    <div className="flex items-center gap-5">
                        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-100 transition-colors" data-guest-allow="true">
                            <Link href={isAuthenticated ? "/dashboard/certificates" : "/"}>
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                        </Button>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                                Chứng chỉ hợp lệ 
                                <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID Verification: {cert.certificateCode}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={copyLink}
                            variant="ghost"
                            data-guest-allow="true"
                            className="h-12 w-12 sm:w-auto sm:px-6 rounded-full font-bold transition-all gap-2"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                            <span className="hidden sm:inline">Sao chép link</span>
                        </Button>
                        <Button 
                            onClick={handlePrint}
                            data-guest-allow="true"
                            className="h-12 px-8 rounded-full font-black shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all gap-2 bg-[#2563EB] hover:bg-blue-700 text-white"
                        >
                            <Printer className="w-4 h-4" />
                            Tải xuống PDF
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* The Certificate Canvas */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-5xl mx-auto"
            >
                <div 
                    ref={certificateRef}
                    className="relative aspect-[1.414/1] w-full bg-white shadow-[0_40px_100px_rgba(0,0,0,0.12)] border-none overflow-hidden print:shadow-none print:m-0 print:rounded-none group rounded-[1.5rem]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 0% 0%, #fff 0%, #f1f5f9 100%)',
                    }}
                >
                    {/* Intricate Decorative Corners (SVG) */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                         <svg width="100%" height="100%" viewBox="0 0 1000 707" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 100 V0 H100 M900 0 H1000 V100 M1000 607 V707 H900 M100 707 H0 V607" stroke="#1E293B" strokeWidth="2" />
                            <circle cx="50" cy="50" r="30" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                            <circle cx="950" cy="50" r="30" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                            <circle cx="950" cy="657" r="30" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                            <circle cx="50" cy="657" r="30" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                         </svg>
                    </div>

                    {/* Double Border Frame */}
                    <div className="absolute inset-6 border-[12px] border-[#1E293B]/5 rounded-sm" />
                    <div className="absolute inset-10 border border-[#1E293B]/10 rounded-sm" />
                    
                    {/* Background Texture/Pattern */}
                    <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply pointer-events-none" 
                         style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/linen-paper.png")' }} />

                    {/* Certificate Content Wrapper */}
                    <div className="absolute inset-0 flex flex-col items-center justify-between py-12 px-32 z-10">
                        
                        {/* Header Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-4 mb-2"
                            >
                                <div className="h-0.5 w-16 bg-[#2563EB]/30 rounded-full" />
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#2563EB] rounded-2xl flex items-center justify-center rotate-6 shadow-xl ring-4 ring-blue-50">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-2xl font-black tracking-tighter text-slate-900">TORII <span className="text-[#2563EB]">ACADEMY</span></span>
                                </div>
                                <div className="h-0.5 w-16 bg-[#2563EB]/30 rounded-full" />
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h2 className="text-[2.5rem] font-black tracking-[0.15em] text-slate-800 uppercase leading-none">
                                    CHỨNG CHỈ HOÀN THÀNH
                                </h2>
                                <p className="text-center mt-2 text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
                                    Certificate of Achievement
                                </p>
                            </motion.div>
                        </div>

                        {/* Recipient Section */}
                        <div className="flex flex-col items-center space-y-3 pt-4">
                            <p className="text-base italic font-semibold text-[#64748B]">
                                Chúng tôi trân trọng trao tặng chứng nhận này cho
                            </p>
                            <motion.h3 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8, type: 'spring', damping: 12 }}
                                className="text-[3.5rem] sm:text-[4rem] font-black text-[#1E293B] tracking-tight py-2"
                            >
                                {userName}
                            </motion.h3>
                            <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent" />
                        </div>

                        {/* Course & Metadata Section */}
                        <div className="flex flex-col items-center text-center max-w-3xl pt-2">
                            <p className="text-lg font-medium text-slate-600 leading-relaxed">
                                Đã hoàn thành xuất sắc khóa học <span className="font-extrabold text-[#2563EB]">"{courseName}"</span>
                                <br />
                                với sự cống hiến và nỗ lực bền bỉ trong hành trình chinh phục tiếng Nhật tại Torii Academy.
                            </p>
                            
                            {score !== null && (
                                <div className="mt-3 px-6 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                                        Kết quả học tập: {score}% • Xếp loại: {score >= 90 ? 'Xuất sắc' : score >= 80 ? 'Giỏi' : 'Khá'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer Section */}
                        <div className="w-full grid grid-cols-3 items-end pt-8">
                            {/* Left: Verification Link */}
                            <div className="space-y-3 pb-2 text-left">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã xác thực (Verification Code)</p>
                                    <p className="text-xs font-bold text-slate-700 font-mono">{cert.certificateCode}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website xác thực</p>
                                    <p className="text-xs font-bold text-[#2563EB]">torii-academy.vn/verify</p>
                                </div>
                            </div>

                            {/* Center: Golden Seal */}
                            <div className="flex justify-center relative scale-110">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                                    className="absolute -inset-4 opacity-30 border border-dashed border-amber-400 rounded-full"
                                />
                                <div className="relative z-10">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-2xl ring-4 ring-amber-100 shadow-amber-500/20">
                                        <div className="w-full h-full rounded-full border-4 border-white/40 flex flex-col items-center justify-center bg-transparent">
                                            <ShieldCheck className="w-12 h-12 text-white mb-1 drop-shadow-md" />
                                            <span className="text-[8px] font-black tracking-widest uppercase text-white/90">Verified</span>
                                        </div>
                                    </div>
                                    {/* Ribbon Decorations */}
                                    <div className="absolute top-20 left-1/2 -ml-6 w-12 h-10 bg-blue-600 -z-10 skew-x-3 rounded-b-sm border-b-4 border-blue-800 opacity-90 shadow-lg" />
                                    <div className="absolute top-20 left-1/2 -ml-2 w-12 h-10 bg-blue-700 -z-10 -skew-x-3 rounded-b-sm border-b-4 border-blue-900 opacity-90 shadow-lg" />
                                </div>
                            </div>

                            {/* Right: Date & Authority */}
                            <div className="text-right space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Ngày {issueDate}</p>
                                    <p className="text-xs font-black text-slate-900 uppercase">Thay mặt ban điều hành</p>
                                </div>
                                <div className="space-y-1">
                                   <div className="h-[1px] w-48 bg-slate-200 ml-auto" />
                                   <p className="text-2xl font-black text-slate-900 italic tracking-tight">Torii Academy CEO</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Hint & Quality Assurance */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-12 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 print:hidden"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-slate-900">Chứng nhận này đạt tiêu chuẩn quốc tế</h4>
                            <p className="text-sm text-slate-500">Đã được mã hóa và xác thực vĩnh viễn trên nền tảng Torii Academy Core V2.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none h-12 px-6 rounded-xl font-bold gap-2" asChild>
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4" />
                                Trang chủ
                            </Link>
                        </Button>
                        <Button 
                            className="flex-1 md:flex-none h-12 px-6 rounded-xl font-bold gap-2 bg-slate-900 text-white hover:bg-slate-800" 
                            onClick={copyLink}
                            data-guest-allow="true"
                        >
                            <Share2 className="w-4 h-4" />
                            Chia sẻ ngay
                        </Button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Print Styles (Strict landscape orientation) */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    html, body {
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        margin: 0;
                        padding: 0;
                        background: #fff;
                    }
                    /* Ensure high quality images/colors */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    )
}
