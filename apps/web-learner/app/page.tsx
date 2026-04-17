import Link from "next/link"
import { BookOpen, GraduationCap, Languages, Sparkles } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

export default function RootPage() {
  const highlights = [
    {
      icon: GraduationCap,
      title: "Lộ trình JLPT rõ ràng",
      description: "Học theo cấp độ N5-N1 với nội dung được sắp xếp bài bản.",
    },
    {
      icon: BookOpen,
      title: "Live class + VOD",
      description: "Kết hợp học trực tiếp và học chủ động theo lịch cá nhân.",
    },
    {
      icon: Languages,
      title: "Thực hành toàn diện",
      description: "Luyện từ vựng, ngữ pháp, đọc hiểu và nghe hiểu mỗi ngày.",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
        <Card className="border-border/60 shadow-none">
          <CardContent className="px-5 py-10 md:px-10 md:py-14">
            <div className="mx-auto max-w-3xl text-center space-y-5">
          <Badge variant="outline" className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            Torii Nihongo E-Learning
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Học tiếng Nhật bài bản,
            <br />
            chinh phục JLPT từng bước
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Nền tảng học trực tuyến của trung tâm Nhật ngữ Torii, giúp bạn xây nền vững chắc
            và tăng tốc đạt mục tiêu JLPT.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <Button asChild size="lg" className="min-w-[170px]">
              <Link href="/register">Đăng ký học thử</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-w-[140px]">
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="min-w-[150px]">
              <Link href="/dashboard/available-courses">Xem khóa học</Link>
            </Button>
          </div>
        </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="shadow-none">
                <CardContent className="p-5">
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <h2 className="text-base font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </main>
  )
}
