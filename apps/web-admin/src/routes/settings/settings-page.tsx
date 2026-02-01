import { useState } from 'react';
import { User, Shield, Clock, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { cn } from '@workspace/ui/lib/utils';
import { ProfileTab } from '@/components/settings/profile-tab';
import { SecurityTab } from '@/components/settings/security-tab';
import { SessionsTab } from '@/components/settings/sessions-tab';
import { PasswordTab } from '@/components/settings/password-tab';

import { PageHeader } from '@/components/common/page-header';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Cài đặt Tài khoản"
        subtitle="Quản lý cấu hình cá nhân và bảo mật Torii Academy"
      />


      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex h-auto w-full max-w-3xl gap-2 bg-muted/20 p-1 rounded-xl border border-border/50 backdrop-blur-sm overflow-x-auto no-scrollbar justify-start">
          <TabsTrigger
            value="profile"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all duration-200",
              "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-border/50",
              "hover:text-primary/70"
            )}
          >
            <User className="size-4" />
            <span className="hidden sm:inline">Hồ Sơ</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all duration-200",
              "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-border/50",
              "hover:text-primary/70"
            )}
          >
            <Shield className="size-4" />
            <span className="hidden sm:inline">Bảo Mật</span>
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all duration-200",
              "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-border/50",
              "hover:text-primary/70"
            )}
          >
            <Clock className="size-4" />
            <span className="hidden sm:inline">Phiên Đăng Nhập</span>
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all duration-200",
              "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-border/50",
              "hover:text-primary/70"
            )}
          >
            <KeyRound className="size-4" />
            <span className="hidden sm:inline">Mật Khẩu</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <SessionsTab />
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <PasswordTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
