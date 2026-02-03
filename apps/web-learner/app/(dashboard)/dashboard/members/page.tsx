'use client'

import { Users } from 'lucide-react'

export default function MembersPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Thành viên cộng đồng</h1>
            <p className="text-muted-foreground max-w-md">
                Tính năng đang được phát triển. Bạn sẽ sớm có thể tìm kiếm và kết nối với các học viên khác!
            </p>
        </div>
    )
}
