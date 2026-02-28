'use client';

export function LecturerDetailClient({ id }: { id: string }) {
  return (
    <div className="bg-[oklch(1_0_0)] text-[oklch(0.15_0.02_15)] antialiased min-h-screen">
      <style>{`

    @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
    .animate-slide-in {
    animation: slideIn 0.6s ease-out forwards;
}
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }

    .masonry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 1.5rem;
}

      `}</style>

{/*  BEGIN: Navigation Breadcrumb  */}
<nav className="w-full py-6" data-purpose="breadcrumb-nav">
    <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-sm text-[oklch(0.45_0.02_15)]">
        <a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Trang chủ</a>
        <svg className="lucide lucide-chevron-right" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m9 18 6-6-6-6"/></svg>
        <a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Giảng viên</a>
        <svg className="lucide lucide-chevron-right" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m9 18 6-6-6-6"/></svg>
        <span className="text-[oklch(0.15_0.02_15)] font-medium">Nguyễn Minh Anh</span>
    </div>
</nav>
{/*  END: Navigation Breadcrumb  */}
{/*  BEGIN: Hero Section  */}
<section className="max-w-7xl mx-auto px-4 mb-12 animate-slide-in" data-purpose="hero-section">
    <div className="relative overflow-hidden rounded-3xl border border-[oklch(0.9_0.02_15)] bg-gradient-to-r from-[oklch(0.55_0.15_15)/0.1] via-[oklch(1_0_0)] to-[oklch(1_0_0)] p-8 md:p-12">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
            {/*  Lecturer Info  */}
            <div className="flex-1 space-y-6">
                <div className="space-y-2">
<span className="inline-flex items-center rounded-full bg-[oklch(0.55_0.15_15)/0.1] px-3 py-1 text-xs font-bold text-[oklch(0.55_0.15_15)] tracking-wide uppercase">
              Giảng viên Cao cấp
            </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Nguyễn Minh Anh <span className="text-[oklch(0.45_0.02_15)] text-2xl font-normal ml-2">(グエン・ミン・アン)</span></h1>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-[oklch(0.45_0.02_15)]">
                    <div className="flex items-center gap-2">
                        <svg className="text-[oklch(0.55_0.15_15)]" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        Hà Nội, Việt Nam
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="text-[oklch(0.55_0.15_15)]" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><rect height="14" rx="2" ry="2" width="20" x="2" y="7"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        8 năm kinh nghiệm giảng dạy
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="text-[oklch(0.55_0.15_15)]" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                        Đã xác thực danh tính
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-yellow-500">
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </div>
                    <span className="font-bold text-lg">4.9</span>
                    <span className="text-[oklch(0.45_0.02_15)]">(128 đánh giá)</span>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                    <button className="px-8 py-3 bg-[oklch(0.55_0.15_15)] text-white font-bold rounded-xl shadow-lg shadow-[oklch(0.55_0.15_15)/0.25] hover:opacity-90 transition-all">
                        Đặt lịch tư vấn
                    </button>
                    <button className="px-8 py-3 border-2 border-[oklch(0.55_0.15_15)/0.2] text-[oklch(0.55_0.15_15)] font-bold rounded-xl hover:bg-[oklch(0.55_0.15_15)/0.05] transition-all">
                        Nhắn tin
                    </button>
                    <div className="flex items-center gap-2 ml-auto md:ml-0">
                        <button className="p-2 text-[oklch(0.45_0.02_15)] hover:text-[oklch(0.55_0.15_15)] hover:bg-[oklch(0.55_0.15_15)/0.1] rounded-full transition-all"><svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></button>
                        <button className="p-2 text-[oklch(0.45_0.02_15)] hover:text-[oklch(0.55_0.15_15)] hover:bg-[oklch(0.55_0.15_15)/0.1] rounded-full transition-all"><svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><rect height="20" rx="5" ry="5" width="20" x="2" y="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></button>
                        <button className="p-2 text-[oklch(0.45_0.02_15)] hover:text-[oklch(0.55_0.15_15)] hover:bg-[oklch(0.55_0.15_15)/0.1] rounded-full transition-all"><svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></button>
                    </div>
                </div>
            </div>
            {/*  Avatar Block  */}
            <div className="relative">
                <div className="w-52 h-52 md:w-64 md:h-64 rounded-3xl ring-4 ring-[oklch(0.55_0.15_15)/0.2] overflow-hidden bg-[oklch(0.95_0.01_15)]">
                    <img alt="Nguyễn Minh Anh Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzs3gRPojGNnw0h-v5-4xBYNGnKqkyqQxhr8P3BKIe40_zUKtA1aIs987yLW50b6OPicYz2UCBIV7iWBzj2eo41lLr33FwQaVzMGgMer6QsysAWOWsM2otOkl_hwssdCR9WNJ4ULWZoBSPKVIjxgmjlxgrpmsdhc3JBTyENoon_ck7R6NsXgNP1FJ7p4W-Eu8dk9hn8MPh299YN4lzQuLw6d0Katk3ggtdGQYrJF6dnhNX9gJg-rGOR9VG_lOr0sD3m1la1dAVs70"/>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-2xl shadow-xl border border-[oklch(0.9_0.02_15)]">
                    <div className="bg-emerald-500 text-white p-2 rounded-xl">
                        <svg className="lucide lucide-check" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
{/*  END: Hero Section  */}
{/*  BEGIN: Main Grid Layout  */}
<main className="max-w-7xl mx-auto px-4 pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/*  LEFT CONTENT (2/3)  */}
        <div className="lg:col-span-2 space-y-12">
            {/*  SECTION A: ABOUT  */}
            <section className="animate-slide-in delay-1" data-purpose="about-section" id="about">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[oklch(0.55_0.15_15)/0.1] rounded-lg text-[oklch(0.55_0.15_15)]">
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <h2 className="text-2xl font-black">Giới thiệu bản thân</h2>
                </div>
                <div className="bg-[oklch(1_0_0)] border border-[oklch(0.9_0.02_15)] rounded-3xl p-8 space-y-6">
                    <p className="text-lg leading-relaxed font-medium">
                        Xin chào! Tôi là Minh Anh, giảng viên tiếng Nhật với đam mê truyền cảm hứng học tập thông qua những phương pháp hiện đại và gần gũi.
                    </p>
                    <div className="prose prose-slate max-w-none text-[oklch(0.45_0.02_15)] leading-relaxed space-y-4">
                        <p>Với hơn 8 năm sinh sống và làm việc tại Tokyo, tôi thấu hiểu những khó khăn mà người Việt thường gặp phải khi bắt đầu chinh phục ngôn ngữ khó nhằn này. Phương pháp giảng dạy của tôi tập trung vào việc "Học để dùng", không chỉ là để thi lấy chứng chỉ.</p>
                        <p>Tôi đã hỗ trợ hơn 500 học viên đạt được chứng chỉ JLPT từ N5 đến N1, đồng thời giúp họ tự tin giao tiếp trong môi trường công sở Nhật Bản. Tại Torii Nihongo, tôi mong muốn mang đến cho các bạn một lộ trình học tập tối ưu, tiết kiệm thời gian và tràn đầy cảm hứng.</p>
                    </div>
                </div>
            </section>
            {/*  SECTION B: COURSES  */}
            <section className="animate-slide-in delay-2" data-purpose="courses-section" id="courses">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[oklch(0.55_0.15_15)/0.1] rounded-lg text-[oklch(0.55_0.15_15)]">
                            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">Khóa học đang giảng dạy</h2>
                            <p className="text-sm text-[oklch(0.45_0.02_15)]">Hiện có 04 khóa học trực tuyến</p>
                        </div>
                    </div>
                    <a className="text-[oklch(0.55_0.15_15)] font-bold hover:underline" href="#">Xem tất cả</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/*  Course Card 1  */}
                    <div className="group bg-[oklch(1_0_0)] border border-[oklch(0.9_0.02_15)] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-video">
                            <img alt="JLPT N3 Course" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZu3Rz_UNDkakPi06pHdsMYmfmks6rjU9HkJeDFeYi3C-RdbLaqaLJMGcywLveOlLQCYKRxtUH-_imu8ba8loziE88bzkuuIGx5HUV3n8x_mzBsybu9Ni1D6MxIbtdGaXK9irRFgFugH9eZSiLiKZgzSkh__hoPwXkiZZjkM9ayrCV68fBv9g_XPw7vhl71V94FiLQcIeY2XjuxfF788KYnK-UfnnHRtp-kcWkF9Hu3JSJn5NqwEiGbLEiPWEWe9CERPyfGdN5haI"/>
                            <div className="absolute top-3 left-3 px-3 py-1 bg-[oklch(0.55_0.15_15)] text-white text-xs font-bold rounded-full">JLPT N3</div>
                        </div>
                        <div className="p-5 space-y-4">
                            <h3 className="font-bold text-lg leading-snug group-hover:text-[oklch(0.55_0.15_15)] transition-colors">Chinh phục JLPT N3 trong 3 tháng</h3>
                            <p className="text-sm text-[oklch(0.45_0.02_15)] line-clamp-2">Lộ trình bứt phá từ N4 lên N3 với đầy đủ từ vựng, ngữ pháp và kỹ năng đọc hiểu chuyên sâu.</p>
                            <div className="pt-4 border-t border-[oklch(0.9_0.02_15)] flex items-center justify-between">
                                <div className="text-[oklch(0.55_0.15_15)] font-black text-xl">1.200.000đ</div>
                                <div className="flex items-center gap-1 text-xs text-[oklch(0.45_0.02_15)]">
                                    <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 giờ học
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*  Course Card 2  */}
                    <div className="group bg-[oklch(1_0_0)] border border-[oklch(0.9_0.02_15)] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-video">
                            <img alt="Business Japanese" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiTvxdHmdSCjp7M5ispA8ZqU1bpBxZPSHd2xhnXV6YTstkkNMo2N0q2SkligVK6M4OTZvQNnEPaiYImylOC1JFItNtLW5JRFJE0Hw8i5mbNJsn3R3ENonfpdie5XLZlUT-vGUwRe7HK7q2eM51xPvucCWiRtDEsUvT5wxvLdJmrPcCbbtl0VAiV7sgYwwi-B1XuHo9ykgoN2qvFfzHCgy1r85Va8jwJNXpUHcv8NsqnAl9mh8E4qoaIu0BQdlKM-nmKq89A7LSn7g"/>
                            <div className="absolute top-3 left-3 px-3 py-1 bg-[oklch(0.55_0.15_15)] text-white text-xs font-bold rounded-full">Kaiwa</div>
                        </div>
                        <div className="p-5 space-y-4">
                            <h3 className="font-bold text-lg leading-snug group-hover:text-[oklch(0.55_0.15_15)] transition-colors">Tiếng Nhật Giao tiếp Thương mại</h3>
                            <p className="text-sm text-[oklch(0.45_0.02_15)] line-clamp-2">Làm chủ văn hóa công sở, cách viết email và đàm phán bằng tiếng Nhật chuyên nghiệp.</p>
                            <div className="pt-4 border-t border-[oklch(0.9_0.02_15)] flex items-center justify-between">
                                <div className="text-[oklch(0.55_0.15_15)] font-black text-xl">1.500.000đ</div>
                                <div className="flex items-center gap-1 text-xs text-[oklch(0.45_0.02_15)]">
                                    <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    32 giờ học
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/*  SECTION C: TESTIMONIALS  */}
            <section className="animate-slide-in delay-3" data-purpose="testimonials-section" id="testimonials">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[oklch(0.55_0.15_15)/0.1] rounded-lg text-[oklch(0.55_0.15_15)]">
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-3H4c-1.25.75-2 1.972-2 3V9c0 1.25.756 2.017 2 3h4c0 3.374-1.932 5.63-4 6.5l1.5 2.5zM16 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-3h-4c-1.25.75-2 1.972-2 3V9c0 1.25.756 2.017 2 3h4c0 3.374-1.932 5.63-4 6.5l1.5 2.5z"/></svg>
                    </div>
                    <h2 className="text-2xl font-black">Học viên nói gì</h2>
                </div>
                <div className="masonry-grid">
                    {/*  Testimonial 1  */}
                    <div className="bg-[oklch(1_0_0)] border border-[oklch(0.9_0.02_15)] p-6 rounded-2xl space-y-4">
                        <svg className="text-[oklch(0.55_0.15_15)] opacity-50" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-3H4c-1.25.75-2 1.972-2 3V9c0 1.25.756 2.017 2 3h4c0 3.374-1.932 5.63-4 6.5l1.5 2.5zM16 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-3h-4c-1.25.75-2 1.972-2 3V9c0 1.25.756 2.017 2 3h4c0 3.374-1.932 5.63-4 6.5l1.5 2.5z"/></svg>
                        <p className="italic text-[oklch(0.45_0.02_15)]">"Cô Minh Anh dạy rất nhiệt tình và dễ hiểu. Nhờ cô mà mình đã đỗ N3 chỉ sau 4 tháng ôn luyện dù bận rộn công việc."</p>
                        <div className="flex items-center gap-3 pt-2">
                            <img alt="Student 1" className="w-10 h-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxDA3m0SIi1KHphGyqJNITnkWIRozzJ4x4D8GIMv9O2RqnKSJZU1qViCL4sIBk2nUrHl1-jR2dj3F_6KLNjjR866a6Z3eC5APM5c8KyHX5QurFPsHrwXrn5gzFRIfXhQzBWpHycRgo1gPSlAnhBMrggYu-lxAw2Gu1LmmkUvZIo2_7DV8VjwcdK5RQ8sCssQ9ZfLh8GoLFe0-fOA7JBsUvqYRAg46u1kvKOOh6SD14T7UX9MTY9S3_at_PdZW5eI39Euz-Dx1Q4bE"/>
                            <div>
                                <div className="font-bold text-sm">Trần Hoàng Nam</div>
                                <div className="text-xs text-[oklch(0.45_0.02_15)]">Học viên N3</div>
                            </div>
                        </div>
                    </div>
                    {/*  Testimonial 2  */}
                    <div className="bg-[oklch(1_0_0)] border border-[oklch(0.9_0.02_15)] p-6 rounded-2xl space-y-4">
                        <svg className="text-[oklch(0.55_0.15_15)] opacity-50" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-3H4c-1.25.75-2 1.972-2 3V9c0 1.25.756 2.017 2 3h4c0 3.374-1.932 5.63-4 6.5l1.5 2.5zM16 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-3h-4c-1.25.75-2 1.972-2 3V9c0 1.25.756 2.017 2 3h4c0 3.374-1.932 5.63-4 6.5l1.5 2.5z"/></svg>
                        <p className="italic text-[oklch(0.45_0.02_15)]">"Phương pháp dạy giao tiếp của cô cực kỳ thực tế. Mình đã có thể tự tin phỏng vấn vào công ty Nhật ngay sau khóa Kaiwa."</p>
                        <div className="flex items-center gap-3 pt-2">
                            <img alt="Student 2" className="w-10 h-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvAPY9QIMqwwdFt3bXnigBMmJnvaPykHUf51YadS7InuOjYHrbs-y8MMReFpc3buKKaJ1B932mbeWgTvAhzSDkxxieT8BDODqITPWuErAVKx6zbXN3Vh0cY52Xs3hJPUFqGS3B1c39yu_Y0snJXxg1LvH6GeNR72e_KDXWZhnlI_dOOHS5Kmk9TEny1fpACHMa3JBxAY8S1JSDzoeyJBRXU2vfg1CML761MqdwJCuFjxzpoHpRT95inU5_4VtUUnkIUprzFspIzWI"/>
                            <div>
                                <div className="font-bold text-sm">Lê Thu Hà</div>
                                <div className="text-xs text-[oklch(0.45_0.02_15)]">Học viên Kaiwa</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        {/*  END: LEFT CONTENT  */}
        {/*  RIGHT SIDEBAR (1/3)  */}
        <aside className="space-y-8 lg:sticky lg:top-8" data-purpose="sidebar">
            {/*  SECTION D: RATING CARD  */}
            <div className="bg-[oklch(1_0_0)] border border-[oklch(0.9_0.02_15)] rounded-3xl p-6 shadow-sm animate-slide-in" data-purpose="rating-card">
                <div className="text-center space-y-2 mb-6">
                    <div className="text-5xl font-black text-[oklch(0.55_0.15_15)]">4.9</div>
                    <div className="flex justify-center text-yellow-500 mb-1">
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </div>
                    <p className="text-sm text-[oklch(0.45_0.02_15)] font-medium">Trung bình từ 128 đánh giá</p>
                </div>
                <div className="space-y-3">
                    {/*  5 Star  */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-4">5</span>
                        <div className="flex-1 h-2 bg-[oklch(0.95_0.01_15)] rounded-full overflow-hidden">
                            <div className="h-full bg-[oklch(0.55_0.15_15)] rounded-full" style={{ width: "92%" }}></div>
                        </div>
                        <span className="text-xs text-[oklch(0.45_0.02_15)] w-8 text-right">92%</span>
                    </div>
                    {/*  4 Star  */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-4">4</span>
                        <div className="flex-1 h-2 bg-[oklch(0.95_0.01_15)] rounded-full overflow-hidden">
                            <div className="h-full bg-[oklch(0.55_0.15_15)] rounded-full" style={{ width: "6%" }}></div>
                        </div>
                        <span className="text-xs text-[oklch(0.45_0.02_15)] w-8 text-right">6%</span>
                    </div>
                    {/*  3 Star  */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-4">3</span>
                        <div className="flex-1 h-2 bg-[oklch(0.95_0.01_15)] rounded-full overflow-hidden">
                            <div className="h-full bg-[oklch(0.55_0.15_15)] rounded-full" style={{ width: "2%" }}></div>
                        </div>
                        <span className="text-xs text-[oklch(0.45_0.02_15)] w-8 text-right">2%</span>
                    </div>
                    {/*  2 Star  */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-4">2</span>
                        <div className="flex-1 h-2 bg-[oklch(0.95_0.01_15)] rounded-full overflow-hidden">
                            <div className="h-full bg-[oklch(0.55_0.15_15)] rounded-full" style={{ width: "0%" }}></div>
                        </div>
                        <span className="text-xs text-[oklch(0.45_0.02_15)] w-8 text-right">0%</span>
                    </div>
                    {/*  1 Star  */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-4">1</span>
                        <div className="flex-1 h-2 bg-[oklch(0.95_0.01_15)] rounded-full overflow-hidden">
                            <div className="h-full bg-[oklch(0.55_0.15_15)] rounded-full" style={{ width: "0%" }}></div>
                        </div>
                        <span className="text-xs text-[oklch(0.45_0.02_15)] w-8 text-right">0%</span>
                    </div>
                </div>
            </div>
            {/*  SECTION E: QUALIFICATIONS  */}
            <div className="bg-[oklch(1_0_0)] border border-[oklch(0.9_0.02_15)] rounded-3xl p-6 shadow-sm animate-slide-in delay-1" data-purpose="qualifications-card">
                <div className="flex items-center gap-2 mb-6">
                    <svg className="text-[oklch(0.55_0.15_15)]" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    <h3 className="font-bold text-lg">Bằng cấp &amp; Chứng chỉ</h3>
                </div>
                <ul className="space-y-4">
                    <li className="flex gap-3">
                        <svg className="text-[oklch(0.55_0.15_15)] flex-shrink-0 mt-1" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <div>
                            <div className="font-bold text-sm">JLPT N1 Certified</div>
                            <div className="text-xs text-[oklch(0.45_0.02_15)]">The Japan Foundation (2018)</div>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <svg className="text-[oklch(0.55_0.15_15)] flex-shrink-0 mt-1" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <div>
                            <div className="font-bold text-sm">Thạc sĩ Ngôn ngữ học</div>
                            <div className="text-xs text-[oklch(0.45_0.02_15)]">Đại học Waseda, Nhật Bản</div>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <svg className="text-[oklch(0.55_0.15_15)] flex-shrink-0 mt-1" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <div>
                            <div className="font-bold text-sm">Chứng chỉ Sư phạm Quốc tế</div>
                            <div className="text-xs text-[oklch(0.45_0.02_15)]">Cambridge English (TKT)</div>
                        </div>
                    </li>
                </ul>
            </div>
            {/*  SECTION F: AVAILABILITY  */}
            <div className="bg-[oklch(0.55_0.15_15)/0.1] rounded-3xl p-6 border border-[oklch(0.55_0.15_15)/0.2] animate-slide-in delay-2" data-purpose="availability-card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-[oklch(0.55_0.15_15)]">Lịch giảng dạy</h3>
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                </div>
                <p className="text-sm text-[oklch(0.55_0.15_15)/0.8] mb-6 font-medium">Đang có chỗ trống cho buổi tư vấn tiếp theo: <strong>Ngày mai, 14:00</strong></p>
                <button className="w-full py-4 bg-[oklch(0.55_0.15_15)] text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-md">
                    Xem lịch giảng dạy
                </button>
            </div>
        </aside>
        {/*  END: RIGHT SIDEBAR  */}
    </div>
</main>
{/*  END: Main Grid Layout  */}

    </div>
  );
}
