import { useState } from 'react';
import { Settings2, User, Shield, Clock, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ProfileTab } from '@/components/settings/profile-tab';
import { SecurityTab } from '@/components/settings/security-tab';
import { SessionsTab } from '@/components/settings/sessions-tab';
import { PasswordTab } from '@/components/settings/password-tab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings2 className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                Trung tâm <span className="text-primary not-italic">Cài đặt</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                Quản lý cấu hình tài khoản và bảo mật hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-auto gap-2 bg-muted/30 p-1.5 rounded-xl">
            <TabsTrigger
              value="profile"
              className="gap-2 rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="size-4" />
              <span className="font-sans font-bold italic uppercase tracking-wider">Hồ Sơ</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="gap-2 rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="size-4" />
              <span className="font-sans font-bold italic uppercase tracking-wider">Bảo Mật</span>
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="gap-2 rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Clock className="size-4" />
              <span className="font-sans font-bold italic uppercase tracking-wider">Phiên Đăng Nhập</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="gap-2 rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <KeyRound className="size-4" />
              <span className="font-sans font-bold italic uppercase tracking-wider">Mật Khẩu</span>
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
    </div>
  );
}
