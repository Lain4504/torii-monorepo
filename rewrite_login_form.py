import re

layout_content = """'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userLoginDTOSchema, type UserLoginDTO } from '@workspace/schemas'
import { useAppDispatch, useAppSelector } from '@/hooks/hooks'
import { login, checkAuth } from '@/store/slices/authSlice'
import { FieldError } from '@workspace/ui/components/field'
import { toast } from '@workspace/ui/components/sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useGoogleAuth } from '@/lib/api/services/auth-api'
import { Spinner } from '@workspace/ui/components/spinner'

export function LoginForm() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { status } = useAppSelector((state) => state.auth)
    const isLoading = status === 'loading'
    const [showPassword, setShowPassword] = useState(false)
    const googleAuthMutation = useGoogleAuth()
    const [googleLoading, setGoogleLoading] = useState(false)

    const form = useForm<UserLoginDTO>({
        resolver: zodResolver(userLoginDTOSchema),
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = async (data: UserLoginDTO) => {
        try {
            const resultAction = await dispatch(login(data))

            if (login.fulfilled.match(resultAction)) {
                await dispatch(checkAuth())
                toast.success('Đăng nhập thành công', {
                    description: 'Chào mừng quay trở lại Torii Nihongo!',
                })
                router.push(searchParams.get('from') || '/dashboard')
            } else {
                if (
                    resultAction.payload &&
                    typeof resultAction.payload === 'object' &&
                    'requiresTwoFactor' in resultAction.payload
                ) {
                    const payload = resultAction.payload as { requiresTwoFactor: boolean; tempToken?: string }
                    if (payload.tempToken) {
                        sessionStorage.setItem('2fa_tempToken', payload.tempToken)
                        const fromParam = searchParams.get('from')
                        router.push(
                            fromParam
                                ? `/verify-2fa?token=${payload.tempToken}&from=${encodeURIComponent(fromParam)}`
                                : `/verify-2fa?token=${payload.tempToken}`
                        )
                        return
                    }
                }
                toast.error('Đăng nhập thất bại', {
                    description:
                        typeof resultAction.payload === 'string'
                            ? resultAction.payload
                            : 'Thông tin đăng nhập không chính xác',
                })
            }
        } catch {
            toast.error('Đã có lỗi xảy ra', { description: 'Vui lòng thử lại sau' })
        }
    }

    const handleGoogleButtonClick = () => {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!googleClientId) {
            toast.error('Google OAuth chưa được cấu hình')
            return
        }
        setGoogleLoading(true)
        if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
            toast.error('Google Sign-In chưa tải. Vui lòng tải lại trang.')
            setGoogleLoading(false)
            return
        }
        ; (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
                try {
                    const result = await googleAuthMutation.mutateAsync(response.credential)
                    await dispatch(checkAuth())
                    toast.success(`Chào mừng, ${result.user.displayName || 'Người dùng'}!`)
                    router.push(searchParams.get('from') || '/dashboard')
                } catch (error: any) {
                    toast.error(error?.message || 'Đăng nhập Google thất bại')
                } finally {
                    setGoogleLoading(false)
                }
            },
        })
        const buttonWrapper = document.createElement('div')
        buttonWrapper.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0'
        document.body.appendChild(buttonWrapper)
            ; (window as any).google.accounts.id.renderButton(buttonWrapper, { type: 'standard', size: 'large' })
        setTimeout(() => {
            const btn = buttonWrapper.querySelector('div[role="button"]') as HTMLElement
            if (btn) btn.click()
            else {
                try { (window as any).google.accounts.id.prompt() }
                catch { setGoogleLoading(false); toast.error('Không thể khởi tạo Google Sign-In') }
            }
        }, 200)
    }

    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.body.appendChild(script)
    }, [])

    return (
        <div className="space-y-6">
            {/* BEGIN: OAuth Section */}
            <div className="space-y-4">
                <button 
                  onClick={handleGoogleButtonClick}
                  disabled={isLoading || googleLoading}
                  className="w-full h-11 flex items-center justify-center gap-3 px-4 border border-border rounded-xl bg-white hover:bg-muted/50 active:scale-95 transition-all duration-200 font-medium text-foreground disabled:opacity-50 disabled:pointer-events-none" 
                  type="button"
                >
                    {googleLoading ? (
                        <Spinner className="size-5" />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                    )}
                    Tiếp tục với Google
                </button>
                <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                    </div>
                    <span className="relative bg-white px-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">Hoặc</span>
                </div>
            </div>
            {/* END: OAuth Section */}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Email Field */}
                <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <div className={`relative flex items-center input-focus-ring border ${fieldState.invalid ? 'border-destructive' : 'border-transparent'} bg-muted/20 rounded-xl transition-all h-11 group`}>
                                <div className="absolute left-3 flex items-center pointer-events-none">
                                    <svg className={`h-5 w-5 ${fieldState.invalid ? 'text-destructive' : 'text-muted-foreground'} group-focus-within:text-primary transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                    </svg>
                                </div>
                                <input 
                                    {...field}
                                    id={field.name}
                                    className="block w-full h-full pl-10 pr-3 bg-transparent border-none rounded-xl text-sm focus:ring-0 placeholder:text-muted-foreground font-medium outline-none" 
                                    placeholder="Email" 
                                    required
                                    type="email"
                                    autoComplete="email"
                                />
                            </div>
                            <FieldError errors={[fieldState.error]} />
                        </div>
                    )}
                />

                {/* Password Field */}
                <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <div className={`relative flex items-center input-focus-ring border ${fieldState.invalid ? 'border-destructive' : 'border-transparent'} bg-muted/20 rounded-xl transition-all h-11 group`}>
                                <div className="absolute left-3 flex items-center pointer-events-none">
                                    <svg className={`h-5 w-5 ${fieldState.invalid ? 'text-destructive' : 'text-muted-foreground'} group-focus-within:text-primary transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                    </svg>
                                </div>
                                <input 
                                    {...field}
                                    id={field.name}
                                    className="block w-full h-full pl-10 pr-10 bg-transparent border-none rounded-xl text-sm focus:ring-0 placeholder:text-muted-foreground font-medium outline-none" 
                                    placeholder="Mật khẩu" 
                                    required 
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                />
                                <button 
                                    className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none" 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        {showPassword ? (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.882 9.882L4.273 4.273M19.727 19.727l-5.609-5.609" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7a10.028 10.028 0 01-1.258 2.768" />
                                            </>
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                            <FieldError errors={[fieldState.error]} />
                        </div>
                    )}
                />

                {/* Options Row */}
                <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                        <input className="w-4 h-4 rounded border-border text-primary focus:ring-primary transition-all cursor-pointer" type="checkbox"/>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Ghi nhớ đăng nhập</span>
                    </label>
                    <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                        Quên mật khẩu?
                    </Link>
                </div>
                
                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isLoading || googleLoading}
                  className="w-full flex items-center justify-center h-11 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-4"
                >
                    {isLoading && <Spinner className="mr-2" />}
                    Đăng nhập
                </button>
            </form>
        </div>
    )
}
"""

with open('e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/components/auth/login-form.tsx', 'w', encoding='utf-8') as f:
    f.write(layout_content)
