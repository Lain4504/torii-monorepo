'use client'

import React, { useState, useRef } from 'react'
import { User, Shield, Camera, Lock } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'

export default function ModernUserSettings() {
    const { user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
    })

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

    const avatarSrc = useAvatarUrl(user?.avatarUrl || null)

    return (
        <div className="max-w-4xl mx-auto py-6">
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
                            <Shield className="size-4" />
                            Phiên đăng nhập
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="mt-0 outline-none">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt hồ sơ</CardTitle>
                            <CardDescription>
                                Quản lý cách hiển thị của bạn trên toàn nền tảng.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Thông tin cơ bản</FieldLegend>
                                    <FieldDescription>
                                        Cập nhật tên hiển thị của bạn.
                                    </FieldDescription>

                                    <Field orientation="horizontal">
                                        <FieldLabel>Ảnh đại diện</FieldLabel>
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="relative">
                                                <div className="h-24 w-24 rounded-full bg-muted overflow-hidden">
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
                                                    className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
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
                                            <div className="text-sm text-muted-foreground">
                                                <p>JPG, PNG, GIF. Tối đa 2MB.</p>
                                                <div className="mt-2 flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        Tải lên
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Field>

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
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-0 outline-none">
                    <SecurityTab />
                </TabsContent>

                <TabsContent value="password" className="space-y-6 mt-0 outline-none">
                    <Card>
                        <CardHeader>
                            <CardTitle>Đổi mật khẩu</CardTitle>
                            <CardDescription>
                                Để đổi mật khẩu, hãy yêu cầu email đặt lại mật khẩu. Chúng tôi sẽ gửi cho bạn một liên kết an toàn.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Vui lòng sử dụng chức năng &quot;Quên mật khẩu&quot; ở màn hình đăng nhập để nhận email đặt lại mật khẩu.
                            </p>
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
