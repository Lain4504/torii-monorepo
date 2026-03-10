import { useMemo } from "react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/schemas"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

export default function MyClassesPage() {
  const { user } = useAuth()
  const isLecturer = user?.role === UserRole.LECTURER
  const { data: allClasses = [], isLoading } = useAcademyClasses({})

  const data = useMemo(() => {
    if (!isLecturer || !user?.id) return []
    return allClasses
      .filter((c) => c.mode === "LIVE" && c.liveClass?.instructorId === user.id)
      .sort((a, b) => String(a.code).localeCompare(String(b.code)))
  }, [allClasses, isLecturer, user?.id])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lớp của tôi"
        subtitle="Chỉ hiển thị các lớp LIVE bạn được phân công giảng dạy."
      />

      <div className="rounded-md bg-background border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead>Mã lớp</TableHead>
              <TableHead>Tên lớp</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-56" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data.length ? (
              data.map((it, idx) => (
                <TableRow key={it.id}>
                  <TableCell className="text-muted-foreground font-medium">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    <Link to={`/academy/classes/${it.id}`} className="hover:underline text-primary">
                      {it.code}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{it.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="shadow-none">{it.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/academy/classes/${it.id}`} className="text-primary hover:underline text-sm">
                      Mở
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Bạn chưa được phân công lớp LIVE nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

