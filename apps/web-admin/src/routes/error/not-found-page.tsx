import { useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Search, ArrowLeft, Home, Sparkles } from "lucide-react"

export default function NotFoundPage() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6 text-center animate-in fade-in duration-700">
            <div className="space-y-12 max-w-lg w-full">
                {/* Branding Indicator */}
                <div className="flex flex-col items-center gap-4">
                    <div className="size-16 flex items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                        <Search className="size-8" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold uppercase tracking-tight italic">Không tìm thấy <span className="text-primary font-bold">Trang</span></h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Resource Discovery Failure</p>
                    </div>
                </div>

                {/* Main Error Node */}
                <div className="relative">
                    <span className="text-[10rem] md:text-[14rem] font-black text-primary/[0.03] italic leading-none select-none tracking-tighter">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-20 rounded-2xl bg-card border shadow-xl flex items-center justify-center">
                            <Sparkles className="size-8 text-primary animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                        Đường dẫn bạn yêu cầu không tồn tại trong hệ thống quản trị Torii Academy.
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
                    Discovery Protocol Engaged • Entry 404-X
                </span>
            </div>
        </div>
    )
}
