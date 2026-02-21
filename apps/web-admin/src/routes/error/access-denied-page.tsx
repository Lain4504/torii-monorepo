import { useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { ShieldAlert, ArrowLeft, Home, Sparkles } from "lucide-react"

export default function AccessDeniedPage() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6 text-center animate-in fade-in duration-700">
            <div className="space-y-12 max-w-lg w-full">
                {/* Branding Indicator */}
                <div className="flex flex-col items-center gap-4">
                    <div className="size-16 flex items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
                        <ShieldAlert className="size-8" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold uppercase tracking-tight italic">Truy cập <span className="text-destructive font-bold">Bị từ chối</span></h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Matrix Permission Violation</p>
                    </div>
                </div>

                {/* Main Error Node */}
                <div className="relative">
                    <span className="text-[10rem] md:text-[14rem] font-black text-destructive/[0.03] italic leading-none select-none tracking-tighter">
                        403
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-20 rounded-2xl bg-card border shadow-xl flex items-center justify-center">
                            <Sparkles className="size-8 text-destructive animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                        Tài khoản của bạn không có đủ quyền hạn để truy cập vào vùng dữ liệu này.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto"
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        QUAY LẠI
                    </Button>
                    <Button
                        size="lg"
                        onClick={() => navigate("/")}
                        className="w-full sm:w-auto"
                    >
                        <Home className="mr-2 size-4" />
                        TRANG CHỦ
                    </Button>
                </div>
            </div>

            {/* Footer Meta */}
            <div className="mt-20">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/10 italic">
                    Security Incident Logged • Protocol 403-B
                </span>
            </div>
        </div>
    )
}
