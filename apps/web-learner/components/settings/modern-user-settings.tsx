'use client'

import React from 'react'
import { User, Shield, Lock, Monitor } from 'lucide-react'
import { useAppSelector } from '@/hooks/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useLinkedProviders } from '@/lib/api/services/auth-api'

// Tab Components
import { ProfileTab } from './profile-tab'
import { SecurityTab } from './security-tab'
import { PasswordTab } from './password-tab'
import { SessionsManagement } from './sessions-management'

export default function ModernUserSettings() {
    const { user } = useAppSelector((state) => state.auth)
    const { data: linkedProviders } = useLinkedProviders()
    const hasPassword = linkedProviders?.hasPassword ?? true

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Cài đặt tài khoản</h1>
                <p className="text-muted-foreground font-medium">Quản lý thông tin cá nhân, bảo mật và các phiên đăng nhập của bạn.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full space-y-6">
                <TabsList className="w-full flex justify-start h-12 bg-muted/50 p-1 rounded-xl overflow-x-auto scrollbar-none">
                    <TabsTrigger 
                        value="profile" 
                        className="flex-shrink-0 gap-2 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-xs transition-all"
                    >
                        <User className="size-4" />
                        Hồ sơ
                    </TabsTrigger>
                    
                    <TabsTrigger 
                        value="security" 
                        className="flex-shrink-0 gap-2 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-xs transition-all"
                    >
                        <Shield className="size-4" />
                        Bảo mật
                    </TabsTrigger>
                    
                    <TabsTrigger 
                        value="password" 
                        className="flex-shrink-0 gap-2 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-xs transition-all"
                    >
                        <Lock className="size-4" />
                        {hasPassword ? 'Mật khẩu' : 'Thiết lập mật khẩu'}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                        value="sessions" 
                        className="flex-shrink-0 gap-2 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-xs transition-all"
                    >
                        <Monitor className="size-4" />
                        Phiên đăng nhập
                    </TabsTrigger>
                </TabsList>

                <div className="pt-2">
                    <TabsContent value="profile" className="mt-0 outline-none">
                        <ProfileTab />
                    </TabsContent>

                    <TabsContent value="security" className="mt-0 outline-none">
                        <SecurityTab />
                    </TabsContent>

                    <TabsContent value="password" className="mt-0 outline-none">
                        <PasswordTab />
                    </TabsContent>

                    <TabsContent value="sessions" className="mt-0 outline-none">
                        <SessionsManagement />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

