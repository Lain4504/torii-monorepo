'use client'

import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@workspace/ui/components/card'
import {
    Field,
    FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { Spinner } from '@workspace/ui/components/spinner'
import { useChangePassword, useLinkedProviders } from '@/lib/api/services/auth-api'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"

export function PasswordTab() {
    const { data: linkedProviders } = useLinkedProviders()
    const hasPassword = linkedProviders?.hasPassword ?? true
    const changePasswordMutation = useChangePassword()

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    })

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

    const handleChangePassword = async () => {
        const currentPassword = passwordForm.currentPassword.trim()
        const newPassword = passwordForm.newPassword.trim()
        const confirmNewPassword = passwordForm.confirmNewPassword.trim()

        if (hasPassword && !currentPassword) {
            toast.error('Vui lòng nhập mật khẩu hiện tại')
            return
        }
        if (newPassword.length < 8) {
            toast.error('Mật khẩu mới phải có ít nhất 8 ký tự')
            return
        }
        if (newPassword !== confirmNewPassword) {
            toast.error('Mật khẩu xác nhận không khớp')
            return
        }
        if (hasPassword && newPassword === currentPassword) {
            toast.error('Mật khẩu mới phải khác mật khẩu hiện tại')
            return
        }

        try {
            const res = await changePasswordMutation.mutateAsync({
                oldPassword: hasPassword ? currentPassword : '',
                newPassword,
            })
            if (res.success) {
                toast.success(hasPassword ? 'Đổi mật khẩu thành công' : 'Thiết lập mật khẩu thành công')
                setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
                setShowCurrentPassword(false)
                setShowNewPassword(false)
                setShowConfirmNewPassword(false)
            } else {
                toast.error(res.message || (hasPassword ? 'Đổi mật khẩu thất bại' : 'Thiết lập mật khẩu thất bại'))
            }
        } catch (error: any) {
            toast.error(error?.message || (hasPassword ? 'Đổi mật khẩu thất bại' : 'Thiết lập mật khẩu thất bại'))
        }
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-2xl border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
                    <CardTitle className="text-xl font-bold">{hasPassword ? 'Đổi mật khẩu' : 'Thiết lập mật khẩu'}</CardTitle>
                    <CardDescription className="text-sm font-medium">
                        {hasPassword 
                            ? 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn khỏi bị truy cập trái phép.'
                            : 'Thiết lập mật khẩu gốc để có thể đăng nhập trực tiếp bằng email.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    {hasPassword && (
                        <Field className="space-y-2">
                            <FieldLabel className="text-xs font-semibold text-muted-foreground mr-2">Mật khẩu hiện tại</FieldLabel>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) =>
                                        setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                                    }
                                    placeholder="Nhập mật khẩu đang sử dụng"
                                    className="h-12 rounded-xl"
                                    autoComplete="current-password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full w-12 hover:bg-transparent text-muted-foreground"
                                    onClick={() => setShowCurrentPassword((v) => !v)}
                                >
                                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </Button>
                            </div>
                        </Field>
                    )}

                    <Field className="space-y-2">
                        <FieldLabel className="text-xs font-semibold text-muted-foreground mr-2">Mật khẩu mới</FieldLabel>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                                }
                                placeholder="Tối thiểu 8 ký tự"
                                className="h-12 rounded-xl"
                                autoComplete="new-password"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full w-12 hover:bg-transparent text-muted-foreground"
                                onClick={() => setShowNewPassword((v) => !v)}
                            >
                                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </Button>
                        </div>
                    </Field>

                    <Field className="space-y-2">
                        <FieldLabel className="text-xs font-semibold text-muted-foreground mr-2">Xác nhận mật khẩu mới</FieldLabel>
                        <div className="relative">
                            <Input
                                id="confirmNewPassword"
                                type={showConfirmNewPassword ? 'text' : 'password'}
                                value={passwordForm.confirmNewPassword}
                                onChange={(e) =>
                                    setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                                }
                                placeholder="Xác nhận mật khẩu mới"
                                className="h-12 rounded-xl"
                                autoComplete="new-password"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full w-12 hover:bg-transparent text-muted-foreground"
                                onClick={() => setShowConfirmNewPassword((v) => !v)}
                            >
                                {showConfirmNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </Button>
                        </div>
                    </Field>

                    <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
                        <Button
                            type="button"
                            className="w-full h-12 rounded-xl text-md"
                            onClick={handleChangePassword}
                            disabled={changePasswordMutation.isPending}
                        >
                            {changePasswordMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                            {hasPassword ? 'Lưu mật khẩu mới' : 'Thiết lập mật khẩu'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full h-10 rounded-xl font-semibold text-xs"
                            onClick={() =>
                                setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
                            }
                            disabled={changePasswordMutation.isPending}
                        >
                            Xóa trường
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
