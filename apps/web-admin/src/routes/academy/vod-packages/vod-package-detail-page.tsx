import { useParams, Link, useSearchParams } from "react-router-dom"
import { useAcademyVodPackage, useUpdateAcademyVodPackage, usePublishVodPackageDirectly } from "@/lib/api/services/academy-vod-packages"
import { useAppSelector } from "@/hooks/hooks"
import { selectUser } from "@/store/slices/auth-slice"
import { UserRole, isStaffBranchRole } from "@workspace/schemas"
import { Rocket, Send, CheckCircle2, Info, BookOpen, Users, MessageSquare, Folder } from "lucide-react"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { PageHeader } from "@/components/common/page-header"
import {
    ChevronRight,
    Archive,
    ShieldAlert,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { formatCurrency } from "@/lib/format-utils"
import { toast } from "sonner"
import { useMemo, useEffect } from "react"
import { ClassStudentsTab } from "../live-classes/tabs/class-students-tab"
import { ClassResourcesTab } from "../live-classes/tabs/class-resources-tab"
import { ClassDiscussionTab } from "../live-classes/tabs/class-discussion-tab"
import { ClassSyllabusTab } from "../live-classes/tabs/class-syllabus-tab"
import { VodInfoTab } from "./tabs/vod-info-tab"

const TAB_INFO = "info"
const TAB_SYLLABUS = "syllabus"
const TAB_STUDENTS = "students"
const TAB_DISCUSSION = "discussion"
const TAB_RESOURCES = "resources"

const VOD_DETAIL_TABS = [TAB_INFO, TAB_SYLLABUS, TAB_STUDENTS, TAB_DISCUSSION, TAB_RESOURCES] as const

export default function VodPackageDetailPage() {
    const { id = "" } = useParams<{ id: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const { data: pkg, isLoading: isLoadingPkg } = useAcademyVodPackage(id)
    const { data: profile, isLoading: isLoadingProfile } = useAcademyCourseProfile(pkg?.courseProfileId)
    const user = useAppSelector(selectUser)
    const isStaff = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role);

    const updateMutation = useUpdateAcademyVodPackage()
    const publishDirectlyMutation = usePublishVodPackageDirectly()

    const defaultTab = TAB_INFO
    const tabParam = searchParams.get("tab") || defaultTab

    const rawTab = searchParams.get("tab")

    /** Gỡ `tab` không hợp lệ (vd. copy từ URL lớp LIVE `?tab=assignments`) — web-admin VOD không có tab bài tập/chấm điểm */
    useEffect(() => {
        if (rawTab && !VOD_DETAIL_TABS.includes(rawTab as (typeof VOD_DETAIL_TABS)[number])) {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev)
                    next.delete("tab")
                    return next
                },
                { replace: true },
            )
        }
    }, [rawTab, setSearchParams])

    const activeTab = useMemo(() => {
        if (
            tabParam === TAB_INFO ||
            tabParam === TAB_SYLLABUS ||
            tabParam === TAB_STUDENTS ||
            tabParam === TAB_DISCUSSION ||
            tabParam === TAB_RESOURCES
        ) {
            return tabParam
        }
        return defaultTab
    }, [tabParam])

    const setTab = (value: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            if (value === defaultTab) {
                next.delete("tab")
            } else {
                next.set("tab", value)
            }
            return next
        })
    }

    const handlePublishDirectly = async () => {
        if (!confirm("Xác nhận xuất bản gói VOD này trực tiếp lên sàn (không qua duyệt)?")) return
        try {
            await publishDirectlyMutation.mutateAsync(id)
            toast.success("Đã xuất bản gói VOD thành công! 🚀")
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không thể xuất bản trực tiếp")
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateMutation.mutateAsync({
                id,
                input: { status: newStatus as any }
            })
            toast.success(`Đã chuyển trạng thái sang ${newStatus}`)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không thể cập nhật trạng thái")
        }
    }

    if (isLoadingPkg || isLoadingProfile) {
        return (
            <div className="space-y-6 flex flex-col gap-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (!pkg) {
        return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin Gói VOD.</div>
    }

    return (
        <div className="flex flex-col gap-6 ">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Link
                            to="/academy/vod-packages"
                            className="hover:underline text-muted-foreground transition-colors"
                        >
                            Gói VOD
                        </Link>
                        <ChevronRight className="size-4" />
                        <span>Chi tiết gói</span>
                    </div>
                }
                subtitle={pkg.title}
                stats={[
                    { label: "Mã gói", value: pkg.code },
                    {
                        label: "Giá",
                        value: pkg.discountPrice
                            ? `${formatCurrency(pkg.discountPrice as any)} (${formatCurrency(pkg.price)})`
                            : formatCurrency(pkg.price)
                    },
                    { label: "Trạng thái", value: pkg.status === 'PUBLISHED' ? 'ĐANG BÁN' : pkg.status === 'PENDING_APPROVAL' ? 'CHỜ DUYỆT' : pkg.status === 'DRAFT' ? 'BẢN NHÁP' : 'LƯU TRỮ' },
                ]}
                actions={
                    <div className="flex gap-2">
                        {pkg.status === 'DRAFT' && (
                            <>
                                {isStaff ? (
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 shadow-none gap-2"
                                        onClick={handlePublishDirectly}
                                        disabled={publishDirectlyMutation.isPending}
                                    >
                                        <Rocket className="size-4" /> Xuất bản ngay
                                    </Button>
                                ) : (
                                    <Button
                                        className="bg-primary hover:bg-primary/90 shadow-none gap-2"
                                        onClick={() => handleStatusChange('PENDING_APPROVAL')}
                                        disabled={updateMutation.isPending}
                                    >
                                        <Send className="size-4" /> Gửi duyệt
                                    </Button>
                                )}
                            </>
                        )}

                        {pkg.status === 'PENDING_APPROVAL' && isStaff && (
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-none gap-2"
                                onClick={() => handleStatusChange('PUBLISHED')}
                                disabled={updateMutation.isPending}
                            >
                                <CheckCircle2 className="size-4" /> Phê duyệt & Mở bán
                            </Button>
                        )}

                        {pkg.status === 'PUBLISHED' && (
                            <Button
                                variant="outline"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 shadow-none"
                                onClick={() => handleStatusChange('DRAFT')}
                                disabled={updateMutation.isPending}
                            >
                                <ShieldAlert className="mr-2 h-4 w-4" /> Ngừng bán (Hạ nháp)
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="text-muted-foreground border-slate-200 hover:bg-slate-50 shadow-none"
                            onClick={() => handleStatusChange('ARCHIVED')}
                            disabled={updateMutation.isPending || pkg.status === 'ARCHIVED'}
                        >
                            <Archive className="mr-2 h-4 w-4" /> Lưu trữ
                        </Button>
                    </div>
                }
            />

            <Tabs value={activeTab} onValueChange={setTab} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
                    <TabsTrigger value={TAB_INFO} className="gap-2 px-6">
                        <Info className="size-4" /> Thông tin chung
                    </TabsTrigger>
                    <TabsTrigger value={TAB_SYLLABUS} className="gap-2 px-6">
                        <BookOpen className="size-4" /> Giáo trình
                    </TabsTrigger>
                    <TabsTrigger value={TAB_STUDENTS} className="gap-2 px-6">
                        <Users className="size-4" /> Học viên
                    </TabsTrigger>
                    <TabsTrigger value={TAB_DISCUSSION} className="gap-2 px-6">
                        <MessageSquare className="size-4" /> Thảo luận
                    </TabsTrigger>
                    <TabsTrigger value={TAB_RESOURCES} className="gap-2 px-6">
                        <Folder className="size-4" /> Tài liệu chia sẻ
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value={TAB_INFO}>
                        <VodInfoTab pkg={pkg} profile={profile} />
                    </TabsContent>
                    <TabsContent value={TAB_SYLLABUS}>
                        <ClassSyllabusTab courseProfileId={pkg.courseProfileId} />
                    </TabsContent>
                    <TabsContent value={TAB_STUDENTS}>
                        <ClassStudentsTab vodPackageId={id} canManageEnrollment={isStaff} />
                    </TabsContent>
                    <TabsContent value={TAB_DISCUSSION}>
                        <ClassDiscussionTab vodPackageId={id} />
                    </TabsContent>
                    <TabsContent value={TAB_RESOURCES}>
                        <ClassResourcesTab vodPackageId={id} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
