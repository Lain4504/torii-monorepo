'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { ArrowLeft } from 'lucide-react'

export default function InstructorPublicPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const name = searchParams.get('name')

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8">
      <Button variant="ghost" className="pl-0" asChild>
        <Link href="/dashboard/available-courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại khám phá khóa học
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{name || 'Giảng viên'}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Trang hồ sơ giảng viên đang được hoàn thiện. Bạn có thể xem thông tin lớp và lịch học từ trang chi tiết
            khóa học.
          </p>
          <p className="font-mono text-xs">id: {params.id}</p>
        </CardContent>
      </Card>
    </div>
  )
}
