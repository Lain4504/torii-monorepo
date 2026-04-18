import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Bot,
  CircleCheck,
  Clock3,
  GraduationCap,
  Languages,
  MessageSquareText,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item"
import { Separator } from "@workspace/ui/components/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

const homeNavLinks = [
  { href: "#lo-trinh", label: "Lộ trình" },
  { href: "#phuong-phap", label: "Phương pháp" },
  { href: "#danh-gia", label: "Đánh giá" },
  { href: "#faq", label: "FAQ" },
]

const highlightStats = [
  { icon: Users, value: "3.000+", label: "Học viên đang học" },
  { icon: Clock3, value: "500+", label: "Giờ nội dung tự học" },
  { icon: Trophy, value: "N5 → N1", label: "Lộ trình đầy đủ" },
  { icon: Target, value: "4 kỹ năng", label: "Nghe - Nói - Đọc - Viết" },
]

const benefits = [
  {
    icon: GraduationCap,
    title: "Lộ trình JLPT từ N5 đến N1",
    description: "Học theo cấp độ, biết rõ cần học gì ở từng giai đoạn để đi đúng hướng ngay từ đầu.",
  },
  {
    icon: PlayCircle,
    title: "Kết hợp lớp trực tiếp + tự học",
    description: "Học trực tiếp với giảng viên và chủ động ôn luyện lại bằng bài giảng ghi hình.",
  },
  {
    icon: Languages,
    title: "Luyện đủ 4 kỹ năng",
    description: "Từ vựng, ngữ pháp, đọc, nghe được tích hợp trong cùng lộ trình để tiến bộ đồng đều.",
  },
]

const jlptLevels = [
  {
    value: "n5",
    label: "N5",
    summary: "Làm quen bảng chữ cái, từ vựng nền tảng và mẫu câu giao tiếp cơ bản.",
    focus: ["Hiragana/Katakana", "Ngữ pháp nhập môn", "Phản xạ nghe - nói cơ bản"],
  },
  {
    value: "n4",
    label: "N4",
    summary: "Mở rộng vốn từ và cấu trúc câu để sử dụng trong học tập, công việc hằng ngày.",
    focus: ["Mẫu ngữ pháp thông dụng", "Đọc hiểu đoạn ngắn", "Luyện hội thoại tình huống"],
  },
  {
    value: "n3",
    label: "N3",
    summary: "Bước chuyển lên trung cấp với nội dung dài hơn và kỹ năng xử lý ngữ cảnh.",
    focus: ["Kanji và từ vựng học thuật", "Đọc hiểu trung cấp", "Nghe hiểu nhiều ngữ điệu"],
  },
  {
    value: "n2",
    label: "N2",
    summary: "Nâng cao khả năng xử lý tiếng Nhật trong môi trường học thuật và công việc thực tế.",
    focus: ["Ngữ pháp nâng cao", "Đọc báo và tài liệu dài", "Rèn tốc độ xử lý đề thi"],
  },
  {
    value: "n1",
    label: "N1",
    summary: "Tối ưu chiến lược làm bài và độ chính xác để chinh phục cấp độ cao nhất JLPT.",
    focus: ["Phân tích văn bản phức tạp", "Nghe hiểu học thuật", "Tổng ôn theo đề mô phỏng"],
  },
]

const learningFlow = [
  {
    icon: Users,
    title: "Học trực tiếp theo lịch lớp",
    description: "Tham gia lớp live để tương tác với giảng viên, hỏi đáp và sửa lỗi ngay trong buổi học.",
  },
  {
    icon: BookOpen,
    title: "Ôn tập chủ động với bài giảng tự học",
    description: "Xem lại bài đã học bất cứ lúc nào để củng cố phần kiến thức còn yếu.",
  },
  {
    icon: Bot,
    title: "AI Sensei hỗ trợ luyện tập",
    description: "Nhận hỗ trợ phản hồi nhanh khi luyện ngữ pháp, từ vựng và hội thoại thực hành.",
  },
  {
    icon: CircleCheck,
    title: "Theo dõi tiến độ rõ ràng",
    description: "Bám sát lộ trình theo từng giai đoạn để duy trì nhịp học và mục tiêu JLPT.",
  },
]

const testimonials = [
  {
    name: "Ngọc Anh",
    level: "Học viên JLPT N4",
    content: "Mình thích nhất là học trực tiếp xong có thể xem lại bài giảng tự học. Lịch học linh hoạt mà vẫn theo kịp chương trình.",
  },
  {
    name: "Minh Quân",
    level: "Học viên JLPT N3",
    content: "Lộ trình chia nhỏ rất dễ theo dõi, không còn cảm giác học lan man. Mỗi tuần đều thấy tiến bộ rõ.",
  },
  {
    name: "Thu Trang",
    level: "Học viên JLPT N2",
    content: "Giảng viên hỗ trợ sát và phần luyện tập giúp mình tự tin hơn khi làm đề đọc hiểu dài.",
  },
]

const faqs = [
  {
    question: "Torii Nihongo phù hợp với ai?",
    answer: "Nền tảng phù hợp cho cả người mới bắt đầu và học viên đã có nền tảng muốn đi tiếp từ N5 đến N1.",
  },
  {
    question: "Tôi có thể học theo lịch cá nhân không?",
    answer: "Có. Bạn có thể tham gia lớp trực tiếp theo lịch mở lớp và kết hợp bài giảng tự học theo thời gian riêng.",
  },
  {
    question: "Làm sao để bắt đầu ngay hôm nay?",
    answer: "Tạo tài khoản để đăng ký học, sau đó vào danh mục khóa học để chọn lớp hoặc gói học phù hợp.",
  },
  {
    question: "Tôi có thể theo dõi lộ trình JLPT như thế nào?",
    answer: "Sau khi tham gia học, bạn có thể theo dõi tiến độ từng phần để biết mình đang ở đâu trong lộ trình.",
  },
]

export function HomeLanding() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Languages className="size-4" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold">Torii Nihongo</p>
              <p className="text-[10px] text-muted-foreground">E-Learning Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {homeNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Đăng ký</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 md:space-y-14 md:py-14">
        <section>
          <Card className="border-border/60 shadow-none overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <CardContent className="space-y-6 px-5 py-10 md:px-10 md:py-14">
              <div className="mx-auto max-w-3xl space-y-5 text-center">
                <Badge variant="outline" className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5" />
                  Torii Nihongo E-Learning
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  Học tiếng Nhật bài bản,
                  <br />
                  chinh phục JLPT từ N5 đến N1
                </h1>
                <p className="text-sm text-muted-foreground md:text-base">
                  Nền tảng học trực tuyến của trung tâm Nhật ngữ Torii, kết hợp lớp trực tiếp và bài giảng tự học để bạn xây nền chắc
                  và đi xa hơn trên hành trình tiếng Nhật.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register" className="inline-flex items-center gap-2">
                    Đăng ký học ngay
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/dashboard/available-courses">Xem khóa học</Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                {highlightStats.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-lg border border-border/60 bg-muted/20 p-3 text-left">
                      <div className="mb-2 inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-3.5" />
                      </div>
                      <p className="text-base font-bold leading-none">{item.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="lo-trinh" className="space-y-4">
          <div className="space-y-2 text-center">
            <Badge variant="secondary">Điểm nổi bật</Badge>
            <h2 className="text-2xl font-semibold">Vì sao học viên chọn Torii?</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Mọi nội dung được thiết kế để học viên duy trì nhịp học ổn định và tiến bộ đều theo mục tiêu JLPT.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {benefits.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="shadow-none">
                  <CardHeader className="space-y-3">
                    <div className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </section>

        <Separator />

        <section id="phuong-phap" className="space-y-4">
          <div className="space-y-2">
            <Badge variant="secondary">Lộ trình học</Badge>
            <h2 className="text-2xl font-semibold">Lộ trình JLPT theo từng cấp độ</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Chọn cấp độ mục tiêu để xem trọng tâm học tập tương ứng.
            </p>
          </div>
          <Tabs defaultValue="n5" className="space-y-4">
            <TabsList className="w-full justify-start">
              {jlptLevels.map((level) => (
                <TabsTrigger key={level.value} value={level.value}>
                  {level.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {jlptLevels.map((level) => (
              <TabsContent key={level.value} value={level.value}>
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>Lộ trình {level.label}</CardTitle>
                    <CardDescription>{level.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {level.focus.map((focus) => (
                      <Item key={focus}>
                        <ItemMedia>
                          <CircleCheck className="size-4 text-primary" />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle className="text-sm">{focus}</ItemTitle>
                        </ItemContent>
                      </Item>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <Separator />

        <section id="danh-gia" className="space-y-4">
          <div className="space-y-2">
            <Badge variant="secondary">Phương pháp</Badge>
            <h2 className="text-2xl font-semibold">Học như thế nào trên Torii?</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Kết hợp hình thức học linh hoạt để tăng hiệu quả và duy trì động lực.
            </p>
          </div>
          <Card className="shadow-none">
            <CardContent className="space-y-3 p-6">
              {learningFlow.map((step) => {
                const Icon = step.icon
                return (
                  <Item key={step.title}>
                    <ItemMedia>
                      <div className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{step.title}</ItemTitle>
                      <ItemDescription>{step.description}</ItemDescription>
                    </ItemContent>
                  </Item>
                )
              })}
            </CardContent>
          </Card>
        </section>

        <section id="faq" className="space-y-4">
          <div className="space-y-2 text-center">
            <Badge variant="secondary">Feedback thực tế</Badge>
            <h2 className="text-2xl font-semibold">Học viên nói gì về Torii?</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Trải nghiệm học tập thực tế từ các học viên đang theo lộ trình JLPT.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="shadow-none">
                <CardHeader className="space-y-2">
                  <MessageSquareText className="size-4 text-primary" />
                  <CardDescription>{testimonial.content}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.level}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <Badge variant="secondary">Hỏi đáp</Badge>
            <h2 className="text-2xl font-semibold">Câu hỏi thường gặp</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Một số thông tin nhanh trước khi bạn bắt đầu.
            </p>
          </div>
          <Card className="shadow-none">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border/60 shadow-none bg-gradient-to-br from-primary/5 via-background to-background">
            <CardContent className="space-y-5 px-5 py-8 text-center md:px-10">
              <h2 className="text-2xl font-semibold md:text-3xl">Sẵn sàng bắt đầu hành trình tiếng Nhật cùng Torii?</h2>
              <p className="text-sm text-muted-foreground md:text-base">
                Tạo tài khoản để chọn khóa học phù hợp và bắt đầu lộ trình JLPT của bạn ngay hôm nay.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register" className="inline-flex items-center gap-2">
                    Đăng ký
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard/available-courses">Xem khóa học</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-base font-semibold">Torii Nihongo</p>
            <p className="text-sm text-muted-foreground">
              Nền tảng học tiếng Nhật theo lộ trình rõ ràng, kết hợp lớp trực tiếp, bài giảng tự học và công cụ luyện tập thông minh.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Điều hướng nhanh</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard/available-courses" className="transition-colors hover:text-foreground">Khóa học</Link>
              <Link href="/dashboard/blogs" className="transition-colors hover:text-foreground">Blog học tập</Link>
              <Link href="/privacy-policy" className="transition-colors hover:text-foreground">Chính sách bảo mật</Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Bắt đầu ngay</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="sm:flex-1">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild className="sm:flex-1">
                <Link href="/register">Đăng ký học</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Torii Nihongo.</span>
            <span>Đồng hành cùng lộ trình JLPT của bạn.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
