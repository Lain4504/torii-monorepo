'use client'

import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Button } from '@workspace/ui/components/button'
import { Loader2 } from 'lucide-react'

interface ProfileDetailsTabProps {
    isEditing: boolean
    formData: any
    setFormData: (data: any) => void
    isUpdating: boolean
}

export function ProfileDetailsTab({
    isEditing,
    formData,
    setFormData,
    isUpdating
}: ProfileDetailsTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2 group">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Họ và tên</Label>
                        {isEditing ? (
                            <Input
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="h-12 text-sm rounded-2xl border-2 border-muted-foreground/10 bg-card focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                placeholder="Nhập tên hiển thị"
                            />
                        ) : (
                            <div className="h-12 flex items-center px-4 rounded-2xl bg-muted/30 border border-transparent">
                                <p className="text-sm font-bold text-foreground">{formData.displayName}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 group">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Số điện thoại</Label>
                        {isEditing ? (
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-12 text-sm rounded-2xl border-2 border-muted-foreground/10 bg-card focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                placeholder="Số điện thoại của bạn"
                                disabled={isUpdating}
                            />
                        ) : (
                            <div className="h-12 flex items-center px-4 rounded-2xl bg-muted/30 border border-transparent">
                                <p className="text-sm font-medium text-foreground">{formData.phone || 'Chưa cập nhật'}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 group">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Ngày sinh</Label>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                className="h-12 text-sm rounded-2xl border-2 border-muted-foreground/10 bg-card focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        ) : (
                            <div className="h-12 flex items-center px-4 rounded-2xl bg-muted/30 border border-transparent">
                                <p className="text-sm font-medium text-foreground">
                                    {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 group">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Địa chỉ</Label>
                        {isEditing ? (
                            <Input
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="h-12 text-sm rounded-2xl border-2 border-muted-foreground/10 bg-card focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                placeholder="Tỉnh/Thành phố bạn đang sống"
                                disabled={isUpdating}
                            />
                        ) : (
                            <div className="h-12 flex items-center px-4 rounded-2xl bg-muted/30 border border-transparent">
                                <p className="text-sm font-medium text-foreground">{formData.location || 'Chưa cập nhật'}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2 group h-full">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Tiểu sử cá nhân</Label>
                    {isEditing ? (
                        <Textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="h-[calc(100%-2rem)] min-h-[250px] text-sm rounded-2xl border-2 border-muted-foreground/10 bg-card resize-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all leading-relaxed p-4"
                            placeholder="Giới thiệu một chút về bản thân bạn..."
                        />
                    ) : (
                        <div className="min-h-[250px] text-sm text-foreground/80 leading-relaxed p-6 bg-gradient-to-br from-muted/50 to-muted/20 rounded-3xl border border-border italic flex items-center justify-center text-center">
                            "{formData.bio || 'Hãy viết gì đó để mọi người hiểu thêm về bạn...'}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
