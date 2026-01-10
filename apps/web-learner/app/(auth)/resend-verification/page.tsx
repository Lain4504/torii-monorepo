import Link from 'next/link'
import { ResendVerificationForm } from "@/components/auth/resend-verification-form"
import { Mail, Sparkles, ChevronLeft, RefreshCcw } from 'lucide-react'
import { cn } from "@workspace/ui/lib/utils"

export default function ResendVerificationPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 lg:p-0 bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
            {/* Zen Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/[0.02] blur-[100px] rounded-full" />
            </div>

            <div className="container relative z-10 max-w-7xl mx-auto h-[min(900px,calc(100vh-2rem))] lg:grid lg:grid-cols-2 lg:px-0 bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border/40 shadow-2xl shadow-primary/5 overflow-hidden">

                {/* Left Panel - Narrative */}
                <div className="relative hidden h-full flex-col p-16 lg:flex overflow-hidden">
                    <div className="absolute inset-0 bg-primary/[0.02] -z-10" />

                    {/* Logo & Branding */}
                    <Link href="/" className="relative z-20 flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M3 10h18" strokeLinecap="round" />
                                <path d="M5 10v8" strokeLinecap="round" />
                                <path d="M19 10v8" strokeLinecap="round" />
                                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter uppercase italic leading-none">Torii <span className="text-primary not-italic">Nihongo</span></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-1">Nihongo Center</span>
                        </div>
                    </Link>

                    {/* Center Content - Narrative */}
                    <div className="relative z-20 flex-1 flex flex-col justify-center max-w-md">
                        <div className="space-y-6 mb-16 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                                <RefreshCcw className="w-3 h-3" />
                                <span>Identity Sync</span>
                            </div>
                            <h2 className="text-6xl font-black tracking-[0.02em] leading-[0.85] text-foreground uppercase italic mb-8">
                                Gửi lại mã <br />
                                <span className="text-primary/20 not-italic">Xác thực</span> <br />
                                <span className="text-foreground">Tài khoản</span>
                            </h2>
                            <p className="text-sm font-bold text-muted-foreground/60 leading-relaxed italic border-l-2 border-primary/20 pl-6">
                                "Nếu bạn chưa nhận được email kích hoạt sau 5 phút, vui lòng yêu cầu mã mới để đảm bảo tunnel học tập được thiết lập."
                            </p>
                        </div>

                        {/* Security Visual */}
                        <div className="relative animate-in fade-in slide-in-from-left-12 duration-1000">
                            <div className="p-10 rounded-[2.5rem] bg-background/40 border border-border/20 backdrop-blur-xl group hover:border-primary/20 transition-all shadow-sm">
                                <div className="space-y-6">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-primary/5 flex items-center justify-center border border-primary/10">
                                        <Mail className="w-8 h-8 text-primary group-hover:scale-110 transition-all duration-500" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground">Cloud Identity Gateway</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground/40 leading-relaxed italic">Hệ thống sẽ tái cấp mã xác thực duy nhất cho email của bạn. Hãy chắc chắn email là chính xác.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex items-center justify-center p-8 lg:p-20 relative bg-background/20 lg:border-l border-border/20 overflow-y-auto">
                    <div className="w-full max-w-[420px] space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto lg:mx-0 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mb-8 border border-primary/10">
                                <RefreshCcw className="w-8 h-8 text-primary" />
                            </div>

                            <div className="space-y-2 text-center lg:text-left">
                                <h1 className="text-4xl font-black tracking-[0.02em] uppercase italic text-foreground">Gửi lại <br /><span className="text-primary not-italic italic">Mã Kích hoạt</span></h1>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Nhập email để đồng bộ lại trạng thái</p>
                            </div>
                        </div>

                        {/* Form */}
                        <ResendVerificationForm />

                        {/* Navigation Links */}
                        <div className="space-y-6 pt-6 border-t border-border/20">
                            <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                Quay lại trang đăng nhập?{" "}
                                <Link
                                    href="/login"
                                    className="text-primary hover:text-primary/80 transition-colors ml-2"
                                >
                                    Đăng nhập
                                </Link>
                            </p>

                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-foreground transition-all group"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
