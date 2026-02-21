import { useState } from 'react';
import { User, Shield, Clock, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ProfileTab } from '@/components/settings/profile-tab';
import { SecurityTab } from '@/components/settings/security-tab';
import { SessionsTab } from '@/components/settings/sessions-tab';
import { PasswordTab } from '@/components/settings/password-tab';

import { PageHeader } from '@/components/common/page-header';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cài đặt Tài khoản"
        subtitle="Quản lý cấu hình cá nhân và bảo mật Torii Academy"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/40 p-1 h-auto gap-1">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg"
          >
            <User className="size-4" />
            <span>Hồ Sơ</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg"
          >
            <Shield className="size-4" />
            <span>Bảo Mật</span>
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg"
          >
            <Clock className="size-4" />
            <span>Phiên Đăng Nhập</span>
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg"
          >
            <KeyRound className="size-4" />
            <span>Mật Khẩu</span>
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
