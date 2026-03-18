'use client'

import React, { useState, useRef } from 'react'
import { User, Shield, Camera, Lock, Monitor, Eye, EyeOff } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
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
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@workspace/ui/components/field'
import { profileApi } from '@/lib/api/services/profile-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProfile } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import { SecurityTab } from './security-tab'
import { SessionsManagement } from './sessions-management'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs-lifted'
import { Input } from '@workspace/ui/components/input'
import { Spinner } from '@workspace/ui/components/spinner'
import { useChangePassword } from '@/lib/api/services/auth-api'

export default function ModernUserSettings() {
    const { user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    })
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) =>
            profileApi.updateProfile({
                displayName: data.displayName,
            }),
        onSuccess: async () => {
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            toast.success('Cập nhật cài đặt thành công!')
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Cập nhật thất bại')
        }
    })

    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => profileApi.uploadAvatar(file),
        onSuccess: async () => {
            await dispatch(fetchProfile())
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['auth'] })
            toast.success('Đã cập nhật ảnh đại diện!')
        }
    })

    const changePasswordMutation = useChangePassword()

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadAvatarMutation.mutate(file)
    }

    const handleCancel = () => {
        setFormData({
            displayName: user?.displayName || '',
            email: user?.email || '',
        })
    }

    const handleChangePassword = async () => {
        const currentPassword = passwordForm.currentPassword.trim()
        const newPassword = passwordForm.newPassword.trim()
        const confirmNewPassword = passwordForm.confirmNewPassword.trim()

        if (!currentPassword) {
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
        if (newPassword === currentPassword) {
            toast.error('Mật khẩu mới phải khác mật khẩu hiện tại')
            return
        }

        try {
            const res = await changePasswordMutation.mutateAsync({
                oldPassword: currentPassword,
                newPassword,
            })
            if (res.success) {
                toast.success('Đổi mật khẩu thành công')
                setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
                setShowCurrentPassword(false)
                setShowNewPassword(false)
                setShowConfirmNewPassword(false)
            } else {
                toast.error(res.message || 'Đổi mật khẩu thất bại')
            }
        } catch (error: any) {
            toast.error(error?.message || 'Đổi mật khẩu thất bại')
        }
    }

    const avatarSrc = useAvatarUrl(user?.avatarUrl || null)

    return (
        <div>
            <Tabs defaultValue="profile" className="space-y-6">
                <div className="overflow-x-auto pb-1">
                    <TabsList>
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="size-4" />
                            Hồ sơ
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="size-4" />
                            Bảo mật
                        </TabsTrigger>
                        <TabsTrigger value="password" className="gap-2">
                            <Lock className="size-4" />
                            Đổi mật khẩu
                        </TabsTrigger>
                        <TabsTrigger value="sessions" className="gap-2">
                            <Monitor className="size-4" />
                            Phiên đăng nhập
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="mt-0 outline-none">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-4 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hồ sơ</CardTitle>
                                    <CardDescription>
                                        Ảnh đại diện và thông tin hiển thị công khai.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="h-20 w-20 rounded-full bg-muted overflow-hidden ring-1 ring-border">
                                                <img
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
                                                    src={
                                                        avatarSrc ||
                                                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
                                                    }
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
                                                aria-label="Đổi ảnh đại diện"
                                            >
                                                <Camera className="size-4" />
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold leading-tight truncate">
                                                {user?.displayName || 'Người dùng'}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {user?.email || ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                                        JPG, PNG, GIF. Tối đa 2MB.
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="sm:flex-1"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadAvatarMutation.isPending}
                                        >
                                            {uploadAvatarMutation.isPending ? 'Đang tải...' : 'Tải ảnh lên'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-8 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin tài khoản</CardTitle>
                                    <CardDescription>
                                        Cập nhật thông tin cơ bản của bạn.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FieldGroup>
                                        <FieldSet>
                                            <FieldLegend>Thông tin cơ bản</FieldLegend>
                                            <FieldDescription>
                                                Tên hiển thị sẽ được dùng trong học tập và tương tác.
                                            </FieldDescription>

                                            <Field>
                                                <FieldLabel htmlFor="displayName">Tên hiển thị</FieldLabel>
                                                <Input
                                                    id="displayName"
                                                    value={formData.displayName}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, displayName: e.target.value })
                                                    }
                                                />
                                            </Field>

                                            <Field>
                                                <FieldLabel htmlFor="email">Địa chỉ email</FieldLabel>
                                                <Input id="email" type="email" value={formData.email} disabled />
                                                <FieldDescription>
                                                    Email được dùng để đăng nhập và nhận thông báo hệ thống.
                                                </FieldDescription>
                                            </Field>
                                        </FieldSet>

                                        <Field orientation="horizontal">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={updateMutation.isPending}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => updateMutation.mutate(formData)}
                                                disabled={updateMutation.isPending}
                                            >
                                                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-0 outline-none">
                    <SecurityTab />
                </TabsContent>

                <TabsContent value="password" className="space-y-6 mt-0 outline-none">
                    <Card>
                        <CardHeader>
                            <CardTitle>Đổi mật khẩu</CardTitle>
                            <CardDescription>
                                Cập nhật mật khẩu đăng nhập của bạn. Mật khẩu mới phải có ít nhất 8 ký tự.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Mật khẩu</FieldLegend>
                                    <FieldDescription>
                                        Vì lý do bảo mật, vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.
                                    </FieldDescription>

                                    <Field>
                                        <FieldLabel htmlFor="currentPassword">Mật khẩu hiện tại</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwordForm.currentPassword}
                                                onChange={(e) =>
                                                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                                                }
                                                placeholder="••••••••"
                                                className="pr-10"
                                                autoComplete="current-password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword((v) => !v)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">Hiện/ẩn mật khẩu</span>
                                            </Button>
                                        </div>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="newPassword">Mật khẩu mới</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordForm.newPassword}
                                                onChange={(e) =>
                                                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                                                }
                                                placeholder="••••••••"
                                                className="pr-10"
                                                autoComplete="new-password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword((v) => !v)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">Hiện/ẩn mật khẩu</span>
                                            </Button>
                                        </div>
                                        <FieldDescription>
                                            Tối thiểu 8 ký tự. Nên dùng kết hợp chữ hoa, chữ thường và số.
                                        </FieldDescription>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                id="confirmNewPassword"
                                                type={showConfirmNewPassword ? 'text' : 'password'}
                                                value={passwordForm.confirmNewPassword}
                                                onChange={(e) =>
                                                    setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                                                }
                                                placeholder="••••••••"
                                                className="pr-10"
                                                autoComplete="new-password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmNewPassword((v) => !v)}
                                            >
                                                {showConfirmNewPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">Hiện/ẩn mật khẩu</span>
                                            </Button>
                                        </div>
                                    </Field>
                                </FieldSet>

                                <Field orientation="horizontal">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
                                        }
                                        disabled={changePasswordMutation.isPending}
                                    >
                                        Xóa
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleChangePassword}
                                        disabled={changePasswordMutation.isPending}
                                    >
                                        {changePasswordMutation.isPending ? (
                                            <>
                                                <Spinner className="mr-2 h-4 w-4" />
                                                Đang cập nhật...
                                            </>
                                        ) : (
                                            'Cập nhật mật khẩu'
                                        )}
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6 mt-0 outline-none">
                    <SessionsManagement />
                </TabsContent>
            </Tabs>
        </div>
    )
}
