import { ProfileTab } from '@/components/settings/profile-tab';
import { PageHeader } from '@/components/common/page-header';
import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Settings, Shield, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Thông tin cá nhân"
                subtitle="Quản lý thông tin hồ sơ của bạn"
                actions={
                    <Button variant="outline" onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt tài khoản
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ProfileTab />
                </div>

                <div className="space-y-6">
                    <Card>
                        <div className="p-6">
                            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                                <Shield className="h-4 w-4 text-primary" />
                                Truy cập nhanh
                            </h3>
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-xs"
                                    onClick={() => navigate('/settings?tab=security')}
                                >
                                    <Shield className="mr-2 h-3.5 w-3.5" />
                                    Bảo mật & 2FA
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-xs"
                                    onClick={() => navigate('/settings?tab=password')}
                                >
                                    <Key className="mr-2 h-3.5 w-3.5" />
                                    Đổi mật khẩu
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
