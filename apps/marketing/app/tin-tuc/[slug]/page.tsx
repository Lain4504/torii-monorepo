import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Layout01Icon,
    Calendar01Icon,
    Clock01Icon,
    Facebook01Icon,
    TwitterIcon,
    Link01Icon,
    Message01Icon,
    BookOpen01Icon,
    QuoteDownIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import React from "react"

type IconWrapperProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">;

const Layout = (props: IconWrapperProps) => <HugeiconsIcon icon={Layout01Icon} {...props} />
const Calendar = (props: IconWrapperProps) => <HugeiconsIcon icon={Calendar01Icon} {...props} />
const Clock = (props: IconWrapperProps) => <HugeiconsIcon icon={Clock01Icon} {...props} />
const Facebook = (props: IconWrapperProps) => <HugeiconsIcon icon={Facebook01Icon} {...props} />
const Twitter = (props: IconWrapperProps) => <HugeiconsIcon icon={TwitterIcon} {...props} />
const CopyLink = (props: IconWrapperProps) => <HugeiconsIcon icon={Link01Icon} {...props} />
const Message = (props: IconWrapperProps) => <HugeiconsIcon icon={Message01Icon} {...props} />
const BookOpen = (props: IconWrapperProps) => <HugeiconsIcon icon={BookOpen01Icon} {...props} />
const QuoteDown = (props: IconWrapperProps) => <HugeiconsIcon icon={QuoteDownIcon} {...props} />

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946]"

export default function BlogDetail() {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-[#E63946]/20 selection:text-[#E63946]">

            {/* HEADER (Shared) */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex justify-between items-center w-full">
                        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                            <div className="size-10 bg-gradient-to-br from-[#E63946] to-[#D62828] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-[#E63946]/20">
                                <Layout className="text-white size-5" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-zinc-900">
                                Torii<span className={TORII_RED}>Nihongo</span>
                            </span>
                        </Link>
                        <nav className="hidden lg:flex items-center gap-8">
                            {["Trang chủ", "Khóa học", "Lịch học", "Về chúng tôi", "Tin tức"].map((item) => (
                                <Link
                                    key={item}
                                    href={item === "Tin tức" ? "/tin-tuc" : "#"}
                                    className={`text-sm font-semibold transition-colors ${item === "Tin tức" ? `${TORII_RED}` : "text-zinc-600 hover:text-zinc-900"}`}
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex items-center gap-4 hidden lg:flex">
                            <Button variant="ghost" className="font-semibold text-zinc-600 hover:text-zinc-900">
                                Đăng nhập
                            </Button>
                            <Button className={`${BG_TORII_RED} text-white hover:bg-[#D62828] font-bold px-6 shadow-md shadow-[#E63946]/20 transition-all hover:-translate-y-0.5`}>
                                Đăng ký
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* BREADCRUMB */}
            <div className="bg-white border-b border-zinc-100 py-4">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <Link href="/" className="hover:text-[#E63946] transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <Link href="/tin-tuc" className="hover:text-[#E63946] transition-colors">Tin tức</Link>
                        <span>/</span>
                        <span className="text-zinc-900 truncate">Bí kíp luyện thi JLPT N3 hiệu quả trong 3 tháng</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 lg:px-8 py-10 md:py-16">

                {/* POST HEADER */}
                <div className="max-w-4xl mx-auto text-center mb-10">
                    <Badge className="bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20 mb-6 uppercase tracking-wider font-bold">Kinh nghiệm học tập</Badge>
                    <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 leading-tight md:leading-[1.1] mb-6">
                        Bí kíp luyện thi JLPT N3 hiệu quả trong 3 tháng dành cho người bận rộn
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Lộ trình học tập chi tiết, mẹo ôn thi và cách quản lý thời gian để đạt kết quả tốt nhất trong kỳ thi năng lực tiếng Nhật N3.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-10 border-2 border-white shadow-sm">
                                <AvatarImage src="https://i.pravatar.cc/100?img=33" />
                                <AvatarFallback>AT</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                <p className="text-zinc-900 font-bold">Akira Takahashi</p>
                                <p className="text-xs">Chuyên gia đào tạo</p>
                            </div>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-300 hidden md:block"></div>
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4" strokeWidth={2} />
                            <span>15 Tháng 11, 2026</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-300 hidden md:block"></div>
                        <div className="flex items-center gap-2">
                            <Clock className="size-4" strokeWidth={2} />
                            <span>8 phút đọc</span>
                        </div>
                    </div>
                </div>

                {/* FEATURED COVER IMAGE */}
                <div className="max-w-5xl mx-auto mb-12 lg:mb-16">
                    <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl border border-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop"
                            alt="Cover Image"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* CONTENT LAYOUT */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* SOCIAL SHARE & ACTIONS (Sticky Left - Hidden on Mobile) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-32 flex flex-col gap-4 text-zinc-400">
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>Share</span>
                            <div className="w-px h-8 bg-zinc-200 mx-auto my-2"></div>
                            <Button variant="outline" size="icon" className="rounded-full size-10 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors"><Facebook className="size-4" strokeWidth={2} /></Button>
                            <Button variant="outline" size="icon" className="rounded-full size-10 hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-colors"><Twitter className="size-4" strokeWidth={2} /></Button>
                            <Button variant="outline" size="icon" className="rounded-full size-10 hover:text-[#E63946] hover:border-[#E63946] transition-colors"><CopyLink className="size-4" strokeWidth={2} /></Button>
                            <div className="w-px h-8 bg-zinc-200 mx-auto my-2"></div>
                            <Button variant="outline" size="icon" className="rounded-full size-10 hover:text-zinc-900 hover:border-zinc-900 transition-colors"><Message className="size-4" strokeWidth={2} /></Button>
                        </div>
                    </div>

                    {/* MAIN ARTICLE CONTENT */}
                    <div className="lg:col-span-7 prose prose-zinc prose-lg max-w-none prose-headings:font-bold prose-headings:text-zinc-900 prose-a:text-[#E63946] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
                        <p className="lead text-xl text-zinc-700 leading-relaxed font-medium">
                            Đạt được chứng chỉ N3 trong 3 tháng không phải là một nhiệm vụ bất khả thi nếu bạn có phương pháp và lộ trình ôn tập hợp lý. Dưới đây là những kinh nghiệm thực chiến đúc kết từ hàng trăm học viên tại Torii Nihongo.
                        </p>

                        <h2 id="section-1" className="text-2xl mt-10 mb-4 flex items-center gap-3">
                            <div className="size-8 bg-[#E63946]/10 text-[#E63946] rounded-lg flex items-center justify-center text-sm font-black">1</div>
                            Hiểu rõ cấu trúc đề thi JLPT N3
                        </h2>
                        <p>
                            Trước khi bắt tay vào ôn luyện, việc nắm vững cấu trúc đề là bước quan trọng nhất. Đề thi N3 bao gồm 3 phần thi chính với tổng thời gian là 140 phút. Cấu trúc bài thi đòi hỏi bạn không chỉ nhớ kiến thức mà còn phải có tốc độ xử lý nhanh.
                        </p>
                        <ul className="space-y-2 mt-4 marker:text-[#E63946]">
                            <li><strong>Kiến thức ngôn ngữ (Từ vựng/Chữ Hán):</strong> 30 phút</li>
                            <li><strong>Kiến thức ngôn ngữ (Ngữ pháp) / Đọc hiểu:</strong> 70 phút</li>
                            <li><strong>Nghe hiểu:</strong> 40 phút</li>
                        </ul>

                        <div className="my-10 bg-[#E63946]/5 border-l-4 border-[#E63946] p-6 lg:p-8 rounded-r-xl relative">
                            <QuoteDown className="absolute top-4 right-4 size-16 text-[#E63946]/10" />
                            <p className="text-xl font-medium text-zinc-900 italic mb-4 relative z-10 !mt-0">
                                &quot;Chìa khóa để đỗ N3 không phải là học thuộc lòng mọi thứ, mà là hiểu cách áp dụng ngữ pháp vào ngữ cảnh thực tế và phân bổ thời gian làm bài hiệu quả.&quot;
                            </p>
                            <span className="text-sm font-bold text-[#E63946] uppercase tracking-wider">— Sensei Akira</span>
                        </div>

                        <h2 id="section-2" className="text-2xl mt-10 mb-4 flex items-center gap-3">
                            <div className="size-8 bg-[#E63946]/10 text-[#E63946] rounded-lg flex items-center justify-center text-sm font-black">2</div>
                            Lộ trình 3 tháng bứt phá
                        </h2>
                        <p>
                            Chia nhỏ mục tiêu là cách tốt nhất để không bị ngợp trước khối lượng kiến thức khổng lồ.
                        </p>

                        <h3 className="text-xl font-bold text-zinc-800 mt-6 mb-3">Tháng 1: Xây dựng nền tảng Từ vựng & Kanji</h3>
                        <p>
                            Trong tháng đầu tiên, hãy tập trung vào việc ghi nhớ khoảng 1000 từ vựng và 400 Kanji cốt lõi của N3. Sử dụng flashcards hoặc các ứng dụng học tập như Anki để ôn tập ngắt quãng (Spaced Repetition).
                        </p>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop" alt="Học tiếng Nhật" className="my-8 w-full shadow-lg" />

                        <h3 className="text-xl font-bold text-zinc-800 mt-6 mb-3">Tháng 2: Tấn công Ngữ pháp & Luyện Đọc</h3>
                        <p>
                            Học ngữ pháp theo từng cụm và chú ý đến sắc thái ý nghĩa. Sau đó, áp dụng ngay vào việc đọc hiểu các bài ngắn. Đừng cố dịch từng chữ, hãy tập trung nắm bắt ý chính (skimming & scanning).
                        </p>

                        <h3 className="text-xl font-bold text-zinc-800 mt-6 mb-3">Tháng 3: Luyện Đề & Tăng tốc Nghe hiểu</h3>
                        <p>
                            Đây là tháng quyết định. Hãy làm ít nhất 10 đề thi thử mô phỏng thời gian thực. Đối với kỹ năng nghe, hãy tạo thói quen nghe thụ động vào những lúc rảnh rỗi và nghe chủ động có ghi chép (Shadowing).
                        </p>

                        {/* CTA Box in Content */}
                        <div className="my-12 bg-white rounded-2xl p-8 border-2 border-[#E63946]/20 shadow-xl text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E63946] to-[#D62828]"></div>
                            <BookOpen className="size-12 text-[#E63946] mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-zinc-900 mb-2 !mt-0">Bạn cần một lộ trình cá nhân hóa?</h3>
                            <p className="text-zinc-600 mb-6">Đăng ký ngay khóa luyện thi N3 cấp tốc tại Torii Nihongo với cam kết đỗ 100%.</p>
                            <Button className="bg-[#E63946] hover:bg-[#D62828] text-white font-bold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
                                Nhận lộ trình học miễn phí
                            </Button>
                        </div>

                        <h2 id="section-3" className="text-2xl mt-10 mb-4 flex items-center gap-3">
                            <div className="size-8 bg-[#E63946]/10 text-[#E63946] rounded-lg flex items-center justify-center text-sm font-black">3</div>
                            Những sai lầm cần tránh
                        </h2>
                        <ul className="space-y-2 mt-4 marker:text-[#E63946]">
                            <li><strong>Chỉ học tủ từ vựng:</strong> Kanji thường được test trong ngữ cảnh câu, nếu chỉ học nghĩa mà quên mất cách đọc âm On/Kun sẽ dễ chọn sai.</li>
                            <li><strong>Bỏ qua môn nghe:</strong> Điểm liệt môn nghe là lý do rớt N3 phổ biến nhất. Hãy luyện nghe mỗi ngày dù chỉ 15 phút.</li>
                            <li><strong>Không phân bổ thời gian khi làm bài:</strong> Bài đọc hiểu N3 khá dài, nếu bạn mất quá nhiều thời gian cho đoạn văn ngắn, bạn sẽ không kịp làm đoạn văn dài.</li>
                        </ul>

                        <p className="mt-8">
                            Kỳ thi JLPT N3 là một cột mốc quan trọng đánh dấu khả năng giao tiếp ở mức độ thông thường của bạn. Chúc bạn ôn tập thật tốt và đạt được kết quả như mong đợi!
                        </p>

                        {/* Article Tags & Mobile Share */}
                        <div className="mt-12 pt-8 border-t border-zinc-100">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700">JLPT N3</Badge>
                                    <Badge variant="secondary" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700">Luyện thi</Badge>
                                    <Badge variant="secondary" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700">Kinh nghiệm</Badge>
                                </div>

                                <div className="flex lg:hidden items-center gap-4">
                                    <span className="text-sm font-bold text-zinc-500">Chia sẻ:</span>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:text-[#1877F2]"><Facebook className="size-5" strokeWidth={2} /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:text-[#1DA1F2]"><Twitter className="size-5" strokeWidth={2} /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:text-[#E63946]"><CopyLink className="size-5" strokeWidth={2} /></Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <aside className="lg:col-span-4 space-y-8 min-w-0">
                        {/* Table of Contents - Sticky */}
                        <div className="sticky top-32">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                                <h4 className="text-lg font-bold mb-4 text-zinc-900 border-l-4 border-[#E63946] pl-3 uppercase tracking-wider text-sm">Mục lục bài viết</h4>
                                <nav className="space-y-3 relative before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] before:bg-zinc-100">
                                    <a href="#section-1" className="flex items-start gap-4 text-zinc-500 hover:text-[#E63946] font-medium transition-colors relative group">
                                        <span className="relative z-10 w-4 h-4 rounded-full bg-white border-2 border-zinc-300 group-hover:border-[#E63946] transition-colors mt-1 flex-shrink-0"></span>
                                        <span>1. Hiểu rõ cấu trúc đề thi JLPT N3</span>
                                    </a>
                                    <div className="pl-8 space-y-2">
                                        <a href="#" className="block text-sm text-zinc-400 hover:text-[#E63946] transition-colors">- Phần thi Từ vựng/Kanji</a>
                                        <a href="#" className="block text-sm text-zinc-400 hover:text-[#E63946] transition-colors">- Phần thi Ngữ pháp/Đọc hiểu</a>
                                        <a href="#" className="block text-sm text-zinc-400 hover:text-[#E63946] transition-colors">- Phần thi Nghe hiểu</a>
                                    </div>
                                    <a href="#section-2" className="flex items-start gap-4 text-[#E63946] font-bold transition-colors relative group">
                                        <span className="relative z-10 w-4 h-4 rounded-full bg-white border-2 border-[#E63946] transition-colors mt-1 flex-shrink-0">
                                            <span className="absolute inset-[3px] rounded-full bg-[#E63946]"></span>
                                        </span>
                                        <span>2. Lộ trình 3 tháng bứt phá</span>
                                    </a>
                                    <a href="#section-3" className="flex items-start gap-4 text-zinc-500 hover:text-[#E63946] font-medium transition-colors relative group">
                                        <span className="relative z-10 w-4 h-4 rounded-full bg-white border-2 border-zinc-300 group-hover:border-[#E63946] transition-colors mt-1 flex-shrink-0"></span>
                                        <span>3. Những sai lầm cần tránh</span>
                                    </a>
                                </nav>
                            </div>

                            {/* Author Card Mini */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mt-8 text-center">
                                <Avatar className="size-20 mx-auto mb-4 border-4 border-zinc-50">
                                    <AvatarImage src="https://i.pravatar.cc/150?img=33" />
                                    <AvatarFallback>AT</AvatarFallback>
                                </Avatar>
                                <h4 className="font-bold text-zinc-900 text-lg">Akira Takahashi</h4>
                                <p className="text-zinc-500 text-sm mb-4">Chuyên gia đào tạo JLPT với hơn 10 năm kinh nghiệm giảng dạy tại Nhật Bản và Việt Nam.</p>
                                <Button variant="outline" className="w-full font-bold text-zinc-700 hover:text-[#E63946] hover:border-[#E63946] transition-colors">Xem thẻ tác giả</Button>
                            </div>

                            {/* Banner CTA Sidebar */}
                            <div className="mt-8 rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" alt="Promo" className="w-full h-[350px] object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                                    <Badge className="bg-[#E63946] text-white self-start mb-3 border-none hover:bg-[#D62828]">Giảm ngay 30%</Badge>
                                    <h4 className="text-white font-bold text-2xl mb-2 leading-tight">Khóa học Kaiwa 1 kèm 1</h4>
                                    <p className="text-white/80 text-sm mb-4">Nâng cao khả năng giao tiếp tự tin chỉ sau 2 tháng.</p>
                                    <Button className="w-full bg-white text-[#E63946] hover:bg-zinc-100 font-bold">Tìm hiểu thêm</Button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* RELATED POSTS SECTION */}
            <section className="bg-white py-16 md:py-24 border-t border-zinc-100">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-3xl font-bold text-zinc-900 mb-2">Bài viết liên quan</h3>
                            <p className="text-zinc-500">Những thông tin hữu ích khác bạn có thể quan tâm</p>
                        </div>
                        <Button variant="outline" className="hidden sm:flex font-bold hover:text-[#E63946]">Xem tất cả</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Post 1 */}
                        <article className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2070&auto=format&fit=crop" alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <Badge className="absolute top-4 left-4 bg-[#E63946] text-white hover:bg-[#E63946]">Học tập</Badge>
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#E63946] transition-colors line-clamp-2">
                                Tổng hợp ngữ pháp JLPT N2 thường xuất hiện trong đề thi
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                <span className="font-semibold text-zinc-700">Minh Tú</span>
                                <span>•</span>
                                <span>2 ngày trước</span>
                            </div>
                        </article>

                        {/* Post 2 */}
                        <article className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2070&auto=format&fit=crop" alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <Badge className="absolute top-4 left-4 bg-[#E63946] text-white hover:bg-[#E63946]">Tin tức</Badge>
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#E63946] transition-colors line-clamp-2">
                                Thông báo thời gian nhận chứng chỉ JLPT kỳ thi tháng 7/2026
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                <span className="font-semibold text-zinc-700">Admin</span>
                                <span>•</span>
                                <span>1 tuần trước</span>
                            </div>
                        </article>

                        {/* Post 3 */}
                        <article className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop" alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <Badge className="absolute top-4 left-4 bg-[#E63946] text-white hover:bg-[#E63946]">Văn hóa</Badge>
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[#E63946] transition-colors line-clamp-2">
                                Tìm hiểu ý nghĩa của lễ hội Obon truyền thống tại Nhật Bản
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                <span className="font-semibold text-zinc-700">Kim Phượng</span>
                                <span>•</span>
                                <span>3 tuần trước</span>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* FOOTER (Shared) */}
            <footer className="bg-zinc-950 text-white pt-20 pb-10">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="size-10 bg-[#E63946] rounded-xl flex items-center justify-center">
                                    <Layout className="text-white size-5" strokeWidth={2.5} />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-white">
                                    Torii<span className={TORII_RED}>Nihongo</span>
                                </span>
                            </div>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Hành trình chinh phục tiếng Nhật bắt đầu từ đây. Chúng tôi cung cấp các khóa học chất lượng cao, từ cơ bản đến nâng cao.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white">Khóa học</h4>
                            <ul className="space-y-4 text-zinc-400 text-sm">
                                <li><Link href="#" className="hover:text-white transition-colors">Tiếng Nhật Sơ cấp (N5, N4)</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Tiếng Nhật Trung cấp (N3, N2)</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Luyện thi JLPT Cấp tốc</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Tiếng Nhật Giao tiếp (Kaiwa)</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white">Về Torii Nihongo</h4>
                            <ul className="space-y-4 text-zinc-400 text-sm">
                                <li><Link href="#" className="hover:text-white transition-colors">Giới thiệu chung</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Đội ngũ giáo viên</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Tin tức & Sự kiện</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Cơ hội nghề nghiệp</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white">Liên hệ</h4>
                            <ul className="space-y-4 text-zinc-400 text-sm">
                                <li className="flex items-center gap-2"><div className="size-8 rounded-full bg-zinc-900 flex items-center justify-center"><HugeiconsIcon icon={Message01Icon} className="size-4" /></div> <span>info@toriinihongo.edu.vn</span></li>
                                <li className="flex items-center gap-2"><div className="size-8 rounded-full bg-zinc-900 flex items-center justify-center"><HugeiconsIcon icon={Message01Icon} className="size-4" /></div> <span>0123 456 789</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
                        <p>© 2026 Torii Nihongo. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
                            <Link href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
