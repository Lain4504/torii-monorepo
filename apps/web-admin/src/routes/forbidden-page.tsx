import { Button } from '@workspace/ui/components/button';
import { ShieldAlert, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background font-sans antialiased selection:bg-primary/20 relative overflow-hidden">
            {/* Zen Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-40" />
            </div>

            <div className="relative z-10 text-center space-y-12 max-w-lg w-full px-6 animate-in fade-in zoom-in-95 duration-1000">
                {/* Branding Indicator */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive text-white shadow-2xl shadow-destructive/20 group-hover:scale-105 transition-transform duration-500">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Access <span className="text-destructive not-italic">Blocked</span></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-1">Matrix Permission Violation</span>
                    </div>
                </div>

                {/* Main Error Node */}
                <div className="relative group">
                    <div className="absolute -inset-10 bg-destructive/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <span className="text-[10rem] md:text-[14rem] font-sans font-black text-destructive/[0.03] leading-none select-none tracking-tighter italic">
                        403
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-24 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/10 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                            <Sparkles className="size-10 text-destructive animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-black tracking-tight text-foreground uppercase italic leading-none">Truy cập <span className="text-destructive not-italic">Bị từ chối</span></h2>
                    <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                        Mã định danh của bạn không có đủ thẩm quyền lớp 4 để truy cập cổng thông tin này.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto h-14 px-10 rounded-2xl border-border/10 bg-muted/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-foreground hover:bg-muted/10 transition-all duration-300"
                    >
                        <ArrowLeft className="mr-3 size-4 opacity-50" />
                        QUAY LẠI
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto h-14 px-12 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all duration-500"
                    >
                        <Home className="mr-3 size-4 opacity-50" />
                        TRANG CHỦ
                    </Button>
                </div>
            </div>

            {/* Footer Meta */}
            <div className="absolute bottom-12 flex flex-col items-center gap-4">
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-border/10 to-transparent" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/10 italic">
                    Security Incident Logged • Protocol 403-B
                </span>
            </div>
        </div>
    );
}
