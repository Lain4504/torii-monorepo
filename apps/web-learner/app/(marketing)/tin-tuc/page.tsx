import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
    Layout,
    Search,
    ChevronRight,
    ChevronLeft,
    ChevronsRight,
    Mail,
} from "lucide-react"
import Link from "next/link"
import React from "react"

const ArrowRight = ChevronRight
const ArrowLeft = ChevronLeft
const DoubleArrowRight = ChevronsRight

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946] hover:bg-[#D62828]"

export default function NewsPage() {
    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-zinc-50 border-b border-zinc-100 py-3">
                <div className="container mx-auto px-4 lg:px-8">
                    <nav className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-[#E63946] transition-colors">Trang chủ</Link>
                        <ArrowRight className="size-4" strokeWidth={2} />
                        <span className="text-zinc-900 font-medium">Tin tức</span>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-4 lg:px-8 py-10 md:py-16">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Left Column: Article List */}
                    <div className="lg:col-span-2 space-y-8 min-w-0">
                        <h3 className="text-2xl font-bold border-l-4 border-[#E63946] pl-4 mb-6">Bài viết mới nhất</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* Article Card 1 */}
                            <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-zinc-100 group flex flex-col">
                                <div className="relative h-56 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt="Thumbnail"
                                        src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop"
                                    />
                                    <Badge className="absolute top-3 left-3 bg-[#E63946] text-white hover:bg-[#E63946]">Kinh nghiệm</Badge>
                                </div>
                                <div className="p-6 flex flex-col flex-1 gap-3">
                                    <h4 className="text-lg font-bold line-clamp-2 group-hover:text-[#E63946] transition-colors">
                                        5 Mẹo học Kanji hiệu quả cho người mới bắt đầu
                                    </h4>
                                    <p className="text-zinc-500 text-xs font-semibold">15/10/2026 | By Lê Văn B</p>
                                    <p className="text-zinc-600 text-sm line-clamp-2">
                                        Việc ghi nhớ hàng ngàn chữ Kanji không còn là nỗi ám ảnh nếu bạn áp dụng đúng phương pháp...
                                    </p>
                                    <Link href="#" className="text-[#E63946] text-sm font-bold flex items-center gap-1 mt-auto pt-4 w-fit group/link">
                                        Đọc tiếp <DoubleArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform" strokeWidth={2} />
                                    </Link>
                                </div>
                            </article>

                            {/* Article Card 2 */}
                            <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-zinc-100 group flex flex-col">
                                <div className="relative h-56 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt="Thumbnail"
                                        src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2070&auto=format&fit=crop"
                                    />
                                    <Badge className="absolute top-3 left-3 bg-[#E63946] text-white hover:bg-[#E63946]">Đời sống</Badge>
                                </div>
                                <div className="p-6 flex flex-col flex-1 gap-3">
                                    <h4 className="text-lg font-bold line-clamp-2 group-hover:text-[#E63946] transition-colors">
                                        Chi phí du học Nhật Bản năm 2026 tự túc cần bao nhiêu?
                                    </h4>
                                    <p className="text-zinc-500 text-xs font-semibold">12/10/2026 | By Minh Tú</p>
                                    <p className="text-zinc-600 text-sm line-clamp-2">
                                        Cập nhật bảng chi tiết các loại phí sinh hoạt, học phí và cách tiết kiệm khi du học tại Nhật...
                                    </p>
                                    <Link href="#" className="text-[#E63946] text-sm font-bold flex items-center gap-1 mt-auto pt-4 w-fit group/link">
                                        Đọc tiếp <DoubleArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform" strokeWidth={2} />
                                    </Link>
                                </div>
                            </article>

                            {/* Article Card 3 */}
                            <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-zinc-100 group flex flex-col">
                                <div className="relative h-56 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt="Thumbnail"
                                        src="https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2070&auto=format&fit=crop"
                                    />
                                    <Badge className="absolute top-3 left-3 bg-[#E63946] text-white hover:bg-[#E63946]">JLPT</Badge>
                                </div>
                                <div className="p-6 flex flex-col flex-1 gap-3">
                                    <h4 className="text-lg font-bold line-clamp-2 group-hover:text-[#E63946] transition-colors">
                                        Lịch thi và hướng dẫn đăng ký JLPT tháng 12/2026
                                    </h4>
                                    <p className="text-zinc-500 text-xs font-semibold">08/10/2026 | By Admin</p>
                                    <p className="text-zinc-600 text-sm line-clamp-2">
                                        Tổng hợp các mốc thời gian quan trọng và hồ sơ cần thiết cho kỳ thi năng lực tiếng Nhật sắp tới...
                                    </p>
                                    <Link href="#" className="text-[#E63946] text-sm font-bold flex items-center gap-1 mt-auto pt-4 w-fit group/link">
                                        Đọc tiếp <DoubleArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform" strokeWidth={2} />
                                    </Link>
                                </div>
                            </article>


                            {/* Article Card 4 */}
                            <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-zinc-100 group flex flex-col">
                                <div className="relative h-56 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt="Thumbnail"
                                        src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop"
                                    />
                                    <Badge className="absolute top-3 left-3 bg-[#E63946] text-white hover:bg-[#E63946]">Văn hóa</Badge>
                                </div>
                                <div className="p-6 flex flex-col flex-1 gap-3">
                                    <h4 className="text-lg font-bold line-clamp-2 group-hover:text-[#E63946] transition-colors">
                                        Nghi thức trà đạo - Tinh hoa nghệ thuật Nhật Bản
                                    </h4>
                                    <p className="text-zinc-500 text-xs font-semibold">05/10/2026 | By Kim Phượng</p>
                                    <p className="text-zinc-600 text-sm line-clamp-2">
                                        Khám phá ý nghĩa của từng cử chỉ trong trà đạo và triết lý sống Nhất kỳ nhất hội...
                                    </p>
                                    <Link href="#" className="text-[#E63946] text-sm font-bold flex items-center gap-1 mt-auto pt-4 w-fit group/link">
                                        Đọc tiếp <DoubleArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform" strokeWidth={2} />
                                    </Link>
                                </div>
                            </article>

                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-2 pt-10">
                            <Button variant="outline" size="icon" className="size-10 text-zinc-600">
                                <ArrowLeft className="size-4" strokeWidth={2} />
                            </Button>
                            <Button className="size-10 bg-[#E63946] text-white hover:bg-[#D62828] font-bold">1</Button>
                            <Button variant="outline" className="size-10 font-medium">2</Button>
                            <Button variant="outline" className="size-10 font-medium">3</Button>
                            <span className="px-2 text-zinc-500">...</span>
                            <Button variant="outline" className="size-10 font-medium">8</Button>
                            <Button variant="outline" size="icon" className="size-10 text-zinc-600">
                                <ArrowRight className="size-4" strokeWidth={2} />
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <aside className="space-y-10 min-w-0">
                        {/* Search */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                            <h4 className="text-lg font-bold mb-4 text-zinc-900 border-l-4 border-[#E63946] pl-3">Tìm kiếm bài viết</h4>
                            <div className="relative">
                                <Input className="w-full pl-4 pr-12 py-5 bg-zinc-50 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#E63946] text-sm rounded-lg" placeholder="Từ khóa..." type="text" />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E63946] text-white p-2 rounded-md cursor-pointer hover:bg-[#D62828] transition-colors">
                                    <Search className="size-4" strokeWidth={2} />
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                            <h4 className="text-lg font-bold mb-6 text-zinc-900 border-l-4 border-[#E63946] pl-3">Danh mục</h4>
                            <ul className="space-y-4">
                                <li>
                                    <Link className="flex justify-between items-center text-zinc-600 hover:text-[#E63946] font-medium transition-all group" href="#">
                                        <span>Văn hóa Nhật Bản</span>
                                        <Badge variant="secondary" className="bg-zinc-100 group-hover:bg-[#E63946]/10 group-hover:text-[#E63946] transition-all">12</Badge>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="flex justify-between items-center text-zinc-600 hover:text-[#E63946] font-medium transition-all group" href="#">
                                        <span>Kinh nghiệm học tập</span>
                                        <Badge variant="secondary" className="bg-zinc-100 group-hover:bg-[#E63946]/10 group-hover:text-[#E63946] transition-all">25</Badge>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="flex justify-between items-center text-zinc-600 hover:text-[#E63946] font-medium transition-all group" href="#">
                                        <span>Thông tin JLPT</span>
                                        <Badge variant="secondary" className="bg-zinc-100 group-hover:bg-[#E63946]/10 group-hover:text-[#E63946] transition-all">08</Badge>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="flex justify-between items-center text-zinc-600 hover:text-[#E63946] font-medium transition-all group" href="#">
                                        <span>Đời sống du học</span>
                                        <Badge variant="secondary" className="bg-zinc-100 group-hover:bg-[#E63946]/10 group-hover:text-[#E63946] transition-all">14</Badge>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Popular Posts */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                            <h4 className="text-lg font-bold mb-6 text-zinc-900 border-l-4 border-[#E63946] pl-3">Bài viết phổ biến</h4>
                            <div className="space-y-6">
                                <Link href="#" className="flex gap-4 group cursor-pointer">
                                    <div className="size-20 flex-shrink-0 rounded-lg overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Post" src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h5 className="text-sm font-bold line-clamp-2 text-zinc-800 group-hover:text-[#E63946] transition-colors leading-snug">Top 10 món ăn đường phố phải thử tại Osaka</h5>
                                        <span className="text-xs text-zinc-400 mt-2 font-medium">12.0k lượt xem</span>
                                    </div>
                                </Link>

                                <Link href="#" className="flex gap-4 group cursor-pointer">
                                    <div className="size-20 flex-shrink-0 rounded-lg overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Post" src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2070&auto=format&fit=crop" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h5 className="text-sm font-bold line-clamp-2 text-zinc-800 group-hover:text-[#E63946] transition-colors leading-snug">Tự học tiếng Nhật tại nhà: Lộ trình từ N5 lên N2</h5>
                                        <span className="text-xs text-zinc-400 mt-2 font-medium">9.5k lượt xem</span>
                                    </div>
                                </Link>

                                <Link href="#" className="flex gap-4 group cursor-pointer">
                                    <div className="size-20 flex-shrink-0 rounded-lg overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Post" src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h5 className="text-sm font-bold line-clamp-2 text-zinc-800 group-hover:text-[#E63946] transition-colors leading-snug">Cẩm nang du lịch mùa hoa anh đào 2026</h5>
                                        <span className="text-xs text-zinc-400 mt-2 font-medium">8.2k lượt xem</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="bg-[#E63946] p-8 rounded-xl text-white shadow-xl relative overflow-hidden">
                            <Mail className="absolute -right-4 -bottom-4 size-32 text-white/10 rotate-12" />
                            <h4 className="text-xl font-bold mb-2 relative z-10">Đăng ký nhận tin</h4>
                            <p className="text-white/80 text-sm mb-6 relative z-10 leading-relaxed">Cập nhật những bài viết và ưu đãi khóa học mới nhất từ Torii Nihongo.</p>
                            <div className="space-y-4 relative z-10">
                                <Input className="w-full px-4 py-6 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-1 focus-visible:ring-white focus-visible:bg-white/20 transition-all" placeholder="Email của bạn..." type="email" />
                                <Button className="w-full bg-white text-[#E63946] hover:bg-zinc-100 font-bold py-6 shadow-md transition-colors">Gửi cho tôi</Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </>
    )
}
