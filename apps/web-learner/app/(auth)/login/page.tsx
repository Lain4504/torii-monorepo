import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { AuthLayout } from '@/components/auth/auth-layout'
import { Video, Brain, GraduationCap, ShieldCheck } from 'lucide-react'

const features = [
    { icon: Video, title: 'Lớp học trực tuyến', desc: 'Tương tác thời gian thực' },
    { icon: Brain, title: 'AI Sensei trợ lực', desc: 'Trợ lý học tập 24/7' },
    { icon: GraduationCap, title: 'Lộ trình cá nhân', desc: 'Chinh phục JLPT N5 - N1' },
]

export default function LoginPage() {
    return (
        <AuthLayout
            title="Đăng nhập"
            description="Chào mừng quay trở lại Torii Nihongo"
            footerText={
                <>
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
                        Đăng ký ngay
                    </Link>
                </>
            }
            leftPanel={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-bold tracking-tight leading-tight">
                            Học tiếng Nhật{' '}
                            <span className="text-primary">Thông minh hơn.</span>
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Kết hợp sức mạnh của WebRTC và AI Sensei để chinh phục JLPT từ N5 tới N1.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                                <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <f.icon className="size-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{f.title}</p>
                                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4" />
                        Bảo mật chuẩn AES-256
                    </div>
                </div>
            }
        >
            <LoginForm />
        </AuthLayout>
    )
}
