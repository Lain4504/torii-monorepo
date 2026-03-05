import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
    PlayCircle,
    Video,
    Users,
    Trophy,
    ChevronRight,
    CheckCircle2,
    Calendar,
    Star,
    Quote,
    BookOpen,
    Play
} from "lucide-react"

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946] hover:bg-[#D62828]"

export default function Page() {
    return (
        <>
            {/* 2. Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-white -z-10" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[#E63946]/5 blur-3xl rounded-bl-[100px] -z-10" />

                <div className="container mx-auto px-4 lg:px-8 flex flex-col-reverse lg:flex-row items-center gap-16">
                    <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.15]">
                            Chinh phục Tiếng Nhật <br className="hidden lg:block" /> bài bản &amp; hiệu quả <br className="hidden lg:block" /> cùng <span className={TORII_RED}>Torii Nihongo</span>
                        </h1>
                        <p className="text-lg text-zinc-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Mô hình <strong className="text-zinc-900">Blended Learning</strong> thông minh, kết hợp tuyệt vời giữa khóa học quay sẵn (VOD) bài bản và lớp học trực tuyến (Live) tương tác cao. Đỗ JLPT thật dễ dàng!
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                            <Button size="lg" className={`${BG_TORII_RED} text-white rounded-full px-8 h-14 text-base font-semibold shadow-lg shadow-red-500/20`}>
                                Tư vấn lộ trình miễn phí
                            </Button>
                            <Button size="lg" variant="outline" className={`rounded-full px-8 h-14 text-base font-semibold border-zinc-200 hover:border-[#E63946] hover:text-[#E63946] hover:bg-zinc-50`}>
                                <PlayCircle className="mr-2 size-5" /> Tìm hiểu phương pháp
                            </Button>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-4 pt-8 border-t border-zinc-100">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <Avatar key={i} className="border-2 border-white size-10">
                                        <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 10}`} />
                                        <AvatarFallback>HV</AvatarFallback>
                                    </Avatar >
                                ))}
                            </div >
                            <div className="text-sm">
                                <div className="flex text-amber-500">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="size-4 fill-current" />)}
                                </div>
                                <span className="font-semibold text-zinc-900">4.9/5</span> từ 1.200+ đánh giá
                            </div>
                        </div >
                    </div >

                    <div className="w-full lg:w-1/2 relative">
                        <div className="relative z-10 w-full aspect-video md:aspect-[4/3] rounded-2xl bg-white shadow-2xl p-2 border border-zinc-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2670&auto=format&fit=crop"
                                alt="Students learning"
                                className="w-full h-full object-cover rounded-xl"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-zinc-100 flex items-center gap-4 animate-bounce">
                                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">JLPT N2 Passed!</p>
                                    <p className="text-xs text-zinc-500">Tháng 12, 2025</p>
                                </div>
                            </div>
                        </div>
                        {/* Background decorative shapes */}
                        <div className={`absolute -top-10 -right-10 size-32 bg-[#E63946]/10 rounded-full blur-2xl -z-10`} />
                        <div className="absolute -bottom-10 -right-4 size-48 bg-blue-100/50 rounded-full blur-3xl -z-10" />
                    </div>
                </div >
            </section >

            {/* 3. Stats Banner */}
            < section className="bg-zinc-900 py-16" >
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-zinc-800">
                        <div className="space-y-2">
                            <div className="flex justify-center mb-4"><Users className={`size-8 text-[#E63946]`} /></div>
                            <h3 className="text-4xl font-bold text-white">10,000+</h3>
                            <p className="text-zinc-400 font-medium">Học viên tin tưởng</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-center mb-4"><Trophy className={`size-8 text-[#E63946]`} /></div>
                            <h3 className="text-4xl font-bold text-white">98%</h3>
                            <p className="text-zinc-400 font-medium">Tỷ lệ thi đỗ JLPT</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-center mb-4"><BookOpen className={`size-8 text-[#E63946]`} /></div>
                            <h3 className="text-4xl font-bold text-white">50+</h3>
                            <p className="text-zinc-400 font-medium">Sensei N1/N2</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-center mb-4"><Video className={`size-8 text-[#E63946]`} /></div>
                            <h3 className="text-4xl font-bold text-white">1,000+</h3>
                            <p className="text-zinc-400 font-medium">Video bài giảng 4K</p>
                        </div>
                    </div>
                </div>
            </section >

            {/* 4. Training Methodology (VOD & LIVE) */}
            < section id="lo-trinh" className="py-24 lg:py-32 bg-zinc-50" >
                <div className="container mx-auto px-4 lg:px-8 space-y-32">

                    {/* Row 1: VOD */}
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 relative group">
                            <div className="absolute inset-0 bg-[#E63946]/5 transform -rotate-3 rounded-2xl transition-transform group-hover:-rotate-6" />
                            <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-zinc-100">
                                <img
                                    src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=2670&auto=format&fit=crop"
                                    alt="VOD Learning Platform"
                                    className="rounded-lg w-full object-cover aspect-video"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="size-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur text-[#E63946] transition-transform group-hover:scale-110">
                                        <Play className="size-8 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 space-y-6">
                            <Badge variant="outline" className={`text-[#E63946] border-[#E63946]/30 bg-[#E63946]/5 px-3 py-1`}>
                                Video On Demand
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
                                Chủ động thời gian học <br /> mọi lúc, mọi nơi
                            </h2>
                            <p className="text-lg text-zinc-600 leading-relaxed">
                                Hệ thống thư viện video bài giảng 4K được thu hình chuyên nghiệp, lộ trình từ N5 đến N1 bài bản từng bước một. Khuyến khích sự tự học và ôn tập linh hoạt.
                            </p>
                            <ul className="space-y-3 pb-4">
                                {["Lộ trình cá nhân hoá từng cấp độ", "Tài liệu học tập đi kèm chuẩn giáo trình", "Hệ thống quiz trắc nghiệm sát đề thi"].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-zinc-700 font-medium">
                                        <CheckCircle2 className={`size-5 text-[#E63946] shrink-0`} /> <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button className={`${BG_TORII_RED} text-white rounded-full px-8`}>
                                Khám phá thư viện bài giảng <ChevronRight className="ml-2 size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Row 2: LIVE */}
                    <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 space-y-6">
                            <Badge variant="outline" className={`text-blue-600 border-blue-600/30 bg-blue-50 px-3 py-1`}>
                                Live Online Classes
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
                                Tương tác Real-time <br /> xoá nhòa khoảng cách
                            </h2>
                            <p className="text-lg text-zinc-600 leading-relaxed">
                                Bứt phá kỹ năng Giao tiếp và Đọc hiểu thông qua các lớp học trực tuyến cùng chuyên gia. Điểm danh, Assignment và vượt ải (Gatekeeping) giúp bạn không bao giờ chểnh mảng.
                            </p>
                            <ul className="space-y-3 pb-4">
                                {["Lớp học sĩ số nhỏ, tương tác tối đa", "Chữa bài tập trực tiếp trên lớp", "Gatekeeping: Vượt qua bài test mới được học tiếp"].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-zinc-700 font-medium">
                                        <CheckCircle2 className="size-5 text-blue-600 shrink-0" /> <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="outline" className="rounded-full px-8 border-zinc-200 hover:border-blue-600 hover:text-blue-600 text-zinc-900 shadow-sm">
                                Xem lịch khai giảng Live <Calendar className="ml-2 size-4" />
                            </Button>
                        </div>
                        <div className="w-full lg:w-1/2 relative group">
                            <div className="absolute inset-0 bg-blue-600/5 transform rotate-3 rounded-2xl transition-transform group-hover:rotate-6" />
                            <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-zinc-100">
                                <img
                                    src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2669&auto=format&fit=crop"
                                    alt="Live Class Interaction"
                                    className="rounded-lg w-full object-cover aspect-video"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </section >

            {/* 5. Sensei Section */}
            < section id="sensei" className="py-24 bg-white relative overflow-hidden" >
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#E63946]/5 blur-[100px] -z-10" />
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-bold text-zinc-900">Đội ngũ chuyên gia từ <span className={TORII_RED}>Torii Nihongo</span></h2>
                        <p className="text-lg text-zinc-600">Với nhiều năm kinh nghiệm giảng dạy và tỉ lệ học viên đỗ JLPT cao, các Senseis là những người đồng hành đáng tin cậy nhất.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: "Xuân Sensei", lvl: "N1", exp: "12+ năm kinh nghiệm", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60" },
                            { name: "Nhân Sensei", lvl: "N1", exp: "10+ năm kinh nghiệm", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60" },
                            { name: "Tomohiro Sensei", lvl: "Native", exp: "Chuyên gia giao tiếp", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60" },
                            { name: "Takahashi Sensei", lvl: "Native", exp: "Luyện thi Cao cấp", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60" },
                        ].map((t, idx) => (
                            <Card key={idx} className="border-0 shadow-lg shadow-zinc-200/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white">
                                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                                    <Avatar className="size-32 border-4 border-white shadow-md ring-1 ring-zinc-100 mb-2">
                                        <AvatarImage src={t.avatar} className="object-cover" />
                                        <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-bold text-zinc-900">{t.name}</h4>
                                        <Badge className={t.lvl === "Native" ? "bg-zinc-800 text-white" : "bg-[#E63946] text-white"}>{t.lvl}</Badge>
                                    </div>
                                    <p className="text-zinc-500 font-medium text-sm">{t.exp}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section >

            {/* 6. Hall of Fame (Testimonials) */}
            < section id="cam-nhan" className="py-24 bg-zinc-50" >
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900">Bảng Vàng Danh Dự</h2>
                        <p className="text-lg text-zinc-600">Niềm tự hào của Torii Nihongo chính là hàng nghìn học viên đã đạt được mục tiêu cùng tiếng Nhật.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "Nguyễn Minh Thu", sc: "145/180 N2", q: "Khoá học VOD rất chi tiết, kết hợp với các bài thi thử hàng tuần giúp mình nắm chắc kiến thức.", avt: 30 },
                            { name: "Trần Hải Đăng", sc: "Đỗ kỹ sư CNTT", q: "Lớp học Live với giáo viên native thực sự thay đổi cách mình giao tiếp, tự tin hơn rất nhiều khi phỏng vấn.", avt: 12 },
                            { name: "Lê Ngọc Linh", sc: "160/180 N3", q: "Phương pháp giảng dạy siêu dễ hiểu. Nền tảng E-learning xịn xò, theo dõi được quá trình học rõ ràng.", avt: 41 },
                        ].map((h, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 relative group overflow-hidden">
                                <Quote className={`absolute -top-4 -right-4 size-24 text-zinc-100 -rotate-12 transition-transform group-hover:rotate-0`} />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex text-amber-500 gap-1">
                                        {[1, 2, 3, 4, 5].map(s => <Star fill="currentColor" className="size-5" key={s} />)}
                                    </div>
                                    <p className="text-zinc-700 italic leading-relaxed text-lg">&quot;{h.q}&quot;</p>
                                    <div className="flex items-center gap-4 pt-4 border-t border-zinc-50">
                                        <Avatar className="size-12">
                                            <AvatarImage src={`https://i.pravatar.cc/100?img=${h.avt}`} />
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-zinc-900">{h.name}</p>
                                            <p className={`text-sm font-semibold ${TORII_RED}`}>{h.sc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >
        </>
    )
}