export const metadata = {
    title: 'Lớp Học Trực Tuyến | Torii Nihongo',
};

export default function LiveClassesPage() {
    return (
        <>
            <style>{`
        @keyframes pulse-red {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: .5; transform: scale(1.2); }
        }
        .animate-dot {
            animation: pulse-red 2s infinite;
        }
        .hero-gradient {
            background: linear-gradient(135deg, #020617 0%, rgba(185, 28, 28, 0.15) 50%, #0f172a 100%);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .course-card:hover {
            transform: translateY(-4px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

            <div className="bg-slate-950 text-slate-50 antialiased min-h-screen">


                <main>
                    {/*  BEGIN: Page Hero  */}
                    <section className="hero-gradient py-16 md:py-24 relative overflow-hidden" data-purpose="hero-section">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                            {/*  Live Status Badge  */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.55_0.15_15)] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[oklch(0.55_0.15_15)]"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-200">WebRTC · Học trực tiếp với giáo viên</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
                                Lớp Học <span className="text-[oklch(0.55_0.15_15)]">Trực Tuyến</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                                Học trực tiếp qua WebRTC · Lịch học cố định · Cam kết đầu ra JLPT bằng văn bản.
                            </p>
                            {/*  Trust Stats  */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                <div className="p-6 rounded-2xl glass-card flex flex-col items-center">
                                    <span className="text-3xl font-bold text-[oklch(0.55_0.15_15)] mb-1">42+</span>
                                    <span className="text-sm text-slate-400 font-medium">Lớp đang mở</span>
                                </div>
                                <div className="p-6 rounded-2xl glass-card flex flex-col items-center">
                                    <span className="text-3xl font-bold text-[oklch(0.55_0.15_15)] mb-1">1,250+</span>
                                    <span className="text-sm text-slate-400 font-medium">Học viên đang học</span>
                                </div>
                                <div className="p-6 rounded-2xl glass-card flex flex-col items-center border-[oklch(0.55_0.15_15)]/30 bg-[oklch(0.55_0.15_15)]/5">
                                    <span className="text-3xl font-bold text-[oklch(0.55_0.15_15)] mb-1">100%</span>
                                    <span className="text-sm text-slate-400 font-medium text-center leading-tight">Cam kết đầu ra JLPT</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Page Hero  */}
                    {/*  BEGIN: Filter Bar  */}
                    <section className="max-w-7xl mx-auto px-4 -translate-y-8 relative z-20" data-purpose="filters">
                        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col lg:flex-row gap-6 items-center justify-between">
                            {/*  Tab Toggle  */}
                            <div className="flex p-1 bg-slate-950 rounded-xl border border-white/5 w-full lg:w-auto">
                                <button className="flex-1 lg:flex-none px-6 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2">
                                    Đang mở
                                    <span className="px-2 py-0.5 rounded bg-[oklch(0.55_0.15_15)] text-[10px] text-white">12</span>
                                </button>
                                <button className="flex-1 lg:flex-none px-6 py-2 rounded-lg text-slate-400 text-sm font-medium hover:text-white transition-colors flex items-center justify-center gap-2">
                                    Đã kết thúc
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">158</span>
                                </button>
                            </div>
                            {/*  JLPT Pills  */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button className="px-4 py-1.5 rounded-full border border-[#2563eb]/30 bg-[#2563eb]/10 text-[#2563eb] text-xs font-bold hover:bg-[#2563eb] hover:text-white transition-all">N5 - Sơ cấp 1</button>
                                <button className="px-4 py-1.5 rounded-full border border-[#0d9488]/30 bg-[#0d9488]/10 text-[#0d9488] text-xs font-bold hover:bg-[#0d9488] hover:text-white transition-all">N4 - Sơ cấp 2</button>
                                <button className="px-4 py-1.5 rounded-full border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a] text-xs font-bold hover:bg-[#16a34a] hover:text-white transition-all">N3 - Trung cấp</button>
                                <button className="px-4 py-1.5 rounded-full border border-[#d97706]/30 bg-[#d97706]/10 text-[#d97706] text-xs font-bold hover:bg-[#d97706] hover:text-white transition-all">N2 - Thượng cấp</button>
                                <button className="px-4 py-1.5 rounded-full border border-[#e11d48]/30 bg-[#e11d48]/10 text-[#e11d48] text-xs font-bold hover:bg-[#e11d48] hover:text-white transition-all">N1 - Cao cấp</button>
                            </div>
                            {/*  Search  */}
                            <div className="relative w-full lg:w-64">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                <input className="w-full bg-slate-950 border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-[oklch(0.55_0.15_15)] focus:border-[oklch(0.55_0.15_15)]" placeholder="Tìm tên lớp, giáo viên..." type="text" />
                            </div>
                        </div>
                    </section>
                    {/*  END: Filter Bar  */}
                    {/*  BEGIN: Course Grid  */}
                    <section className="max-w-7xl mx-auto px-4 pb-24" data-purpose="course-grid">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/*  Course Card 1: Currently Live  */}
                            <article className="course-card bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col group">
                                <div className="relative aspect-video overflow-hidden">
                                    <img alt="Course Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd3zgc1qFYaQa3klaVm9eu7KssGnlz0krvNf0xt5dTFE89HtP-uO88nsl92Fe3s4shfCN_gZzZ1RzaTrpAEvNfCUKm3xx0aL7wAoPMouVhnCUYrxSfzgy4ysFEEwKT3ZikO-Y83Nwgzi8sTWTgyoOjJlAL42SwT8jqn_GJXMz5P2XDRkwhclGStX74VkbqL3HCDZ9AiI0llfhDcQPhX2D2wXOwXfvlQeZoaE6RLE9qGVPJd5nm9UZiycw-ifpkUNXtTHJk5PJ9yoI" />
                                    {/*  Badges  */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-1.5 shadow-lg">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                            ĐANG LIVE
                                        </span>
                                        <span className="px-3 py-1 bg-[#16a34a] text-white text-[10px] font-bold rounded shadow-lg uppercase">N3</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[oklch(0.55_0.15_15)] transition-colors">Giao tiếp Trung cấp N3 - Tăng tốc JLPT</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">Lớp học tập trung vào kỹ năng nghe nói và phản xạ nhanh cho kỳ thi N3 tháng 12/2024.</p>
                                    {/*  Instructor  */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <img alt="Teacher" className="w-10 h-10 rounded-full border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnB-VTwPwTNa1EH9q4HalBfO8zsyY-IrLr73OVCS2PKxwe544DSy-NvKU8KY_HNzS-8-yN0L-Ty6SlItqXqhlFUY3rovWpMHW5OYZAXLub969nxXFoYfeF9X4t0OntzuZQRkZZFLvL8wEnHg_9Z-i3cT4ABeuknvPg5ZXxARGEDbUG-KUvDZtQZ3bVN-08eqIxoU95o7Fq7i3qUfPljOSe3hiI-YM-JepC8bUfHay7GvNkq9VPyCXtllL3KUPdK6QfWNP-FABe7EE" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">Ms. Yuki Akari</span>
                                            <span className="text-xs text-slate-500">5 năm kinh nghiệm giảng dạy</span>
                                        </div>
                                    </div>
                                    {/*  Metadata Grid  */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 border-y border-white/5 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Khai giảng</span>
                                            <span className="text-xs font-medium">15/10/2024</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Thời lượng</span>
                                            <span className="text-xs font-medium">24 Buổi (1.5h/buổi)</span>
                                        </div>
                                    </div>
                                    {/*  Progress Bar  */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-400">SỐ LƯỢNG CHỖ TRỐNG</span>
                                            <span className="text-[10px] font-bold text-[oklch(0.55_0.15_15)]">12/15 Học viên</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[oklch(0.55_0.15_15)] rounded-full shadow-[0_0_8px_rgba(185,28,28,0.5)]" style={{ width: "80%" }}></div>
                                        </div>
                                    </div>
                                    {/*  Footer Action  */}
                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 line-through">5.500.000đ</span>
                                            <span className="text-lg font-black text-white">4.250.000đ</span>
                                        </div>
                                        <button className="px-6 py-2.5 bg-[oklch(0.55_0.15_15)] hover:bg-[oklch(0.55_0.15_15)]/90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[oklch(0.55_0.15_15)]/20">
                                            Đăng ký ngay
                                        </button>
                                    </div>
                                </div>
                            </article>
                            {/*  Course Card 2: Hot  */}
                            <article className="course-card bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col group">
                                <div className="relative aspect-video overflow-hidden">
                                    <img alt="Course Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbTTruT07XA3ORT_XtbPKtO8QPimvpcn14APpjzup3bKIPt3L56LKmONJJzbglfZp4lqjTDHnFJM-62ZBK_amhNaKeMl6f-vWPdRIn8sLxn-HonHBCJJp2QjQmB4S1WeMN9bM8EHFWJqEKQ3qljjJ174TQdeSN4FKW6zGjQ-S_K3wzRu3oa6y8YhOaUCuQDPKp8nXns5LpvzpUjjnCAX2k3dKOzBpsV1_FYkxbDgYzbHVDwvOib6s-VFhaEcctguPQb4zOteZiZtg" />
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded flex items-center gap-1 shadow-lg">
                                            🔥 HOT
                                        </span>
                                        <span className="px-3 py-1 bg-[#2563eb] text-white text-[10px] font-bold rounded shadow-lg uppercase">N5</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[oklch(0.55_0.15_15)] transition-colors">N5 Cấp Tốc - Chinh phục bảng chữ cái</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">Lộ trình 3 tháng vững kiến thức nền tảng dành cho người mới bắt đầu từ con số 0.</p>
                                    <div className="flex items-center gap-3 mb-6">
                                        <img alt="Teacher" className="w-10 h-10 rounded-full border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLfRBEySmiBFkfhBpb4oK0-wrqtQhjp8PU8GsR3v-zf8wW_PyMvin1n_v1w5VrP_mhY67tpTplhWZTmAVPNbMwdwtgYl_e0l4Au2-GK-_55dTYPEmHP6t0NDZjBvlHB5ZIg09x4UBhOHEhhkEaVUDilU1vrzzxOPpgP_-Fz5RQXysMYBPNogS4hbvuDp_VkaHyijgumGXuKtSoOVCE-6mAEObueFDKbaz2VMmEb4f9TZSiWjdO9L7bSKd2GHUZm6l60P1U-orJ_Kg" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">Thầy Quang Torii</span>
                                            <span className="text-xs text-slate-500">JLPT N1 · 8 năm tại Nhật</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6 border-y border-white/5 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Khai giảng</span>
                                            <span className="text-xs font-medium">20/10/2024</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Thời lượng</span>
                                            <span className="text-xs font-medium">36 Buổi (2h/buổi)</span>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-400">SỐ LƯỢNG CHỖ TRỐNG</span>
                                            <span className="text-[10px] font-bold text-[oklch(0.55_0.15_15)]">18/20 Học viên</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[oklch(0.55_0.15_15)] rounded-full shadow-[0_0_8px_rgba(185,28,28,0.5)]" style={{ width: "90%" }}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-500 mt-2 block">Còn lại 2 suất cuối cùng!</span>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 line-through">3.800.000đ</span>
                                            <span className="text-lg font-black text-white">2.900.000đ</span>
                                        </div>
                                        <button className="px-6 py-2.5 bg-[oklch(0.55_0.15_15)] hover:bg-[oklch(0.55_0.15_15)]/90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[oklch(0.55_0.15_15)]/20">
                                            Đăng ký ngay
                                        </button>
                                    </div>
                                </div>
                            </article>
                            {/*  Course Card 3: Sold Out  */}
                            <article className="course-card bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col group opacity-75 grayscale-[0.5]">
                                <div className="relative aspect-video overflow-hidden">
                                    <img alt="Course Thumbnail" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg1EoV7DO9AR36q8hKbBetQ1VFAgahYYn5LOoo8Sa4NmOL6SQv3rp6TLRJQ3fdxnHtlPqRvBv-3dQ-W8mMYbJ68Tcknb9haQCbotVDPyO74VMuwXs7ZG9S6-m6NC5nUinBOUCcGelyJnJfvg7ie7K9aCLfqHThTfM-rtwFYzfTCKxrtoYAm4WiDPtV7AER0lRqIFu2M5NAsuU-c_BhoEqNcgye4AflgWHn2TkpN82hSmSSScI9-beBLWKGUJTlYPA_tuySF7tUrlQ" />
                                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                                        <span className="px-6 py-2 bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-sm font-bold rounded-lg">HẾT CHỖ</span>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <span className="px-3 py-1 bg-[#d97706] text-white text-[10px] font-bold rounded shadow-lg uppercase">N2</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2">Chinh phục Thượng cấp N2 - Master</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">Khóa học chuyên sâu dành cho mục tiêu làm việc tại các tập đoàn lớn của Nhật Bản.</p>
                                    <div className="flex items-center gap-3 mb-6">
                                        <img alt="Teacher" className="w-10 h-10 rounded-full border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOPbZ5q02OGz0fdozSttDa2wM3ym2Ec5He6qIpfWQJjEMeUIkobuDgdtKL-zVtzLGsot1gZiLlHkwZLp7oT_5s3jLKtvDDODSBf519heSRIhU9k7ARnaVtM_Xo_dapPu3xISOIr7DZnCG9J3UFcE7RtjQEdqDYpyEJN-1QB-ICLaZfsX2tWPM0SP_7Iq9vHoPPLVcG7AXKdeCeMBvrHY8kvPDONv7PXaLKtM177U2z-4_tkXjxIujc691JQzGYVrihrTqlAfCVNto" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">Ms. Lan Sensei</span>
                                            <span className="text-xs text-slate-500">N1 (175/180) · 10 năm kinh nghiệm</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6 border-y border-white/5 py-4 text-slate-500">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider">Khai giảng</span>
                                            <span className="text-xs font-medium">01/10/2024</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider">Thời lượng</span>
                                            <span className="text-xs font-medium">40 Buổi (2h/buổi)</span>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-500">SỐ LƯỢNG CHỖ TRỐNG</span>
                                            <span className="text-[10px] font-bold text-slate-500">10/10 Học viên</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-600 rounded-full" style={{ width: "100%" }}></div>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-slate-500">6.500.000đ</span>
                                        </div>
                                        <button className="px-6 py-2.5 bg-slate-800 text-slate-500 text-sm font-bold rounded-xl cursor-not-allowed" disabled>
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </div>
                        {/*  BEGIN: Pagination/Load More  */}
                        <div className="mt-16 flex flex-col items-center">
                            <button className="px-8 py-3 bg-slate-900 border border-white/10 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 group">
                                Tải thêm lớp học
                                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            </button>
                        </div>
                        {/*  END: Pagination/Load More  */}
                    </section>
                    {/*  END: Course Grid  */}
                </main>
                {/*  BEGIN: Footer  */}
                <footer className="bg-slate-950 border-t border-white/10 py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                            <div className="col-span-1 md:col-span-1">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 bg-[oklch(0.55_0.15_15)] rounded-full flex items-center justify-center font-bold text-white">T</div>
                                    <span className="text-xl font-bold tracking-tight text-white">Torii <span className="text-[oklch(0.55_0.15_15)]">Nihongo</span></span>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Học tiếng Nhật hiệu quả nhất Việt Nam qua nền tảng WebRTC độc quyền. Cam kết đầu ra bằng văn bản.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-6">Khóa Học</h4>
                                <ul className="space-y-4 text-sm text-slate-400">
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Lớp Live N5-N1</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Video bài giảng</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Luyện đề JLPT</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-6">Hỗ Trợ</h4>
                                <ul className="space-y-4 text-sm text-slate-400">
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Chính sách hoàn tiền</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Hướng dẫn WebRTC</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Liên hệ tư vấn</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-6">Liên Hệ</h4>
                                <p className="text-sm text-slate-400 mb-2">📍 Tầng 12, Tòa nhà Bitexco, TP.HCM</p>
                                <p className="text-sm text-slate-400 mb-2">📞 1900 88 88 88</p>
                                <p className="text-sm text-slate-400">✉️ hello@toriinihongo.vn</p>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-4 text-xs text-slate-500">
                            <p>© 2024 Torii Nihongo. All rights reserved.</p>
                            <div className="flex gap-6">
                                <a className="hover:text-white" href="#">Facebook</a>
                                <a className="hover:text-white" href="#">TikTok</a>
                                <a className="hover:text-white" href="#">YouTube</a>
                            </div>
                        </div>
                    </div>
                </footer>
                {/*  END: Footer  */}

            </div>
        </>
    );
}
