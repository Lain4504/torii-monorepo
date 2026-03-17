import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useDebounceValue } from "@workspace/ui/hooks/use-debounce-value"
import { ChevronRight, Search, Eye, Layers, Package, GraduationCap } from "lucide-react"
import {
  useAcademyCourseProfiles,
  type AcademyCourseProfile,
} from "@/lib/api/services/academy-course-profiles"
import {
  useAcademyCourseOfferings,
  type AcademyCourseOffering,
} from "@/lib/api/services/academy-course-offerings"
import { useAcademyClasses, type AcademyClass } from "@/lib/api/services/academy-classes"

type ApprovalTab = "courseProfiles" | "courseOfferings" | "classes"

function formatDateTime(d: string | null | undefined) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ApprovalsPage() {
  const [tab, setTab] = useState<ApprovalTab>("courseProfiles")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch] = useDebounceValue(searchTerm, 500)

  const { data: profiles = [], isLoading: isLoadingProfiles } =
    useAcademyCourseProfiles({
      status: "PENDING_APPROVAL",
      q: debouncedSearch || undefined,
    } as any)

  const { data: offerings = [], isLoading: isLoadingOfferings } =
    useAcademyCourseOfferings({
      status: "PENDING_APPROVAL",
      q: debouncedSearch || undefined,
    })

  const { data: classes = [], isLoading: isLoadingClasses } = useAcademyClasses({
    status: "PENDING_APPROVAL",
    q: debouncedSearch || undefined,
  } as any)

  const pendingProfiles = useMemo(
    () => profiles.filter((p) => p.status === "PENDING_APPROVAL"),
    [profiles],
  )
  const pendingOfferings = useMemo(
    () => offerings.filter((o) => o.status === "PENDING_APPROVAL"),
    [offerings],
  )
  const pendingClasses = useMemo(
    () => classes.filter((c) => c.status === "PENDING_APPROVAL"),
    [classes],
  )

  const isLoading =
    (tab === "courseProfiles" && isLoadingProfiles) ||
    (tab === "courseOfferings" && isLoadingOfferings) ||
    (tab === "classes" && isLoadingClasses)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/classes"
              className="hover:underline text-muted-foreground transition-colors"
            >
              Academy
            </Link>
            <ChevronRight className="size-4" />
            <span>Approval Center</span>
          </div>
        }
        subtitle="Xem trước và duyệt các nội dung/chính sách bán trước khi xuất bản."
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã hoặc tên..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ApprovalTab)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="courseProfiles" className="gap-2">
            <Layers className="size-4" />
            Course Profiles
            <Badge variant="secondary">{pendingProfiles.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="courseOfferings" className="gap-2">
            <Package className="size-4" />
            Offerings
            <Badge variant="secondary">{pendingOfferings.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2">
            <GraduationCap className="size-4" />
            Classes
            <Badge variant="secondary">{pendingClasses.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="courseProfiles">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead className="w-[120px]">Mã</TableHead>
                    <TableHead>Tên khóa học</TableHead>
                    <TableHead>Ngày gửi duyệt</TableHead>
                    <TableHead className="text-right w-[140px]">Xem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-6" />
                        </TableCell>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : pendingProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Không có Course Profile nào đang chờ duyệt.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingProfiles.map((p: AcademyCourseProfile, index: number) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold">
                          {p.code}
                        </TableCell>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(p.submittedForApprovalAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild className="gap-1">
                            <Link to={`/academy/approvals/course-profiles/${p.id}`}>
                              <Eye className="size-4" />
                              Preview
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="courseOfferings">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead className="w-[120px]">Mã</TableHead>
                    <TableHead>Tên gói</TableHead>
                    <TableHead>Ngày gửi duyệt</TableHead>
                    <TableHead className="text-right w-[140px]">Xem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-6" />
                        </TableCell>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : pendingOfferings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Không có Offering nào đang chờ duyệt.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingOfferings.map(
                      (o: AcademyCourseOffering, index: number) => (
                        <TableRow key={o.id}>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold">
                            {o.code}
                          </TableCell>
                          <TableCell className="font-medium">{o.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(o.submittedForApprovalAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild className="gap-1">
                              <Link to={`/academy/approvals/course-offerings/${o.id}`}>
                                <Eye className="size-4" />
                                Preview
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="classes">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead className="w-[120px]">Mã</TableHead>
                    <TableHead>Tên lớp</TableHead>
                    <TableHead className="w-[120px]">Mode</TableHead>
                    <TableHead>Ngày gửi duyệt</TableHead>
                    <TableHead className="text-right w-[140px]">Xem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-6" />
                        </TableCell>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : pendingClasses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Không có Class nào đang chờ duyệt.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingClasses.map((c: AcademyClass, index: number) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold">
                          {c.code}
                        </TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {c.mode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(c.submittedForApprovalAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild className="gap-1">
                            <Link to={`/academy/approvals/classes/${c.id}`}>
                              <Eye className="size-4" />
                              Preview
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

