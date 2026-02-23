import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { AuthLayout } from '@/components/auth/auth-layout'
import { ShieldCheck, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            title="Quên mật khẩu"
            description="Nhập email để nhận link khôi phục mật khẩu"
            footerText={
                <>
                    Nhớ mật khẩu rồi?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                        Đăng nhập ngay
                    </Link>
                </>
            }
            leftPanel={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-bold tracking-tight leading-tight">
                            Khôi phục{' '}
                            <span className="text-primary">Tài khoản.</span>
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Chúng tôi sẽ gửi link đặt lại mật khẩu tới email đã đăng ký của bạn.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                            <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <KeyRound className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Link bảo mật</p>
                                <p className="text-xs text-muted-foreground">Liên kết hết hạn sau 60 phút</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                            <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">An toàn tuyệt đối</p>
                                <p className="text-xs text-muted-foreground">Mã hóa AES-256 end-to-end</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <ForgotPasswordForm />
        </AuthLayout>
    )
}
