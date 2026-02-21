import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'
import { AuthLayout } from '@/components/auth/auth-layout'
import { Rocket, Users, Trophy } from 'lucide-react'

const features = [
    { icon: Rocket, title: 'Dùng thử Premium', desc: 'Trải nghiệm 7 ngày miễn phí' },
    { icon: Users, title: 'Đấu trường Kaiwa', desc: 'Luyện giao tiếp mỗi ngày' },
    { icon: Trophy, title: 'Chứng chỉ Torii', desc: 'Chứng nhận uy tín từ Torii' },
]

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Đăng ký"
            description="Bắt đầu hành trình chinh phục tiếng Nhật của bạn"
            footerText={
                <>
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                        Đăng nhập
                    </Link>
                </>
            }
            leftPanel={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-bold tracking-tight leading-tight">
                            Gia nhập{' '}
                            <span className="text-primary">Cộng đồng Tri thức.</span>
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Trở thành một phần của hệ sinh thái học tiếng Nhật chuyên nghiệp với 5000+ học viên.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <f.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{f.title}</p>
                                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        {[
                            { value: '5K+', label: 'Học viên' },
                            { value: '200+', label: 'Khóa học' },
                            { value: '4.9', label: 'Đánh giá' },
                        ].map((stat) => (
                            <div key={stat.label} className="space-y-0.5">
                                <p className="text-xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            }
        >
            <>
                <RegisterForm />
                <p className="text-xs text-center text-muted-foreground">
                    Bằng cách đăng ký, bạn đồng ý với{' '}
                    <Link href="/terms" className="underline underline-offset-4 hover:text-primary">Điều khoản</Link>{' '}
                    và{' '}
                    <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">Chính sách bảo mật</Link>.
                </p>
            </>
        </AuthLayout>
    )
}
