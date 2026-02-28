'use client';

import React, { useEffect } from 'react';
import type { BlogResponseDTO } from '@workspace/schemas';

export function ModernBlogDetail({ blog, recentBlogs }: { blog: BlogResponseDTO | any, recentBlogs: BlogResponseDTO[] | any }) {
    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            const progressEl = document.getElementById('readingProgress');
            if (progressEl) {
                progressEl.style.width = scrolled + '%';
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-slate-50 text-slate-900 font-sans selection:bg-[oklch(0.55_0.15_15)] selection:text-white relative">
            <style>{`

    @layer utilities {
    .sticky-sidebar {
    top: 5rem;
    max-height: calc(100vh - 6rem);
}
    .progress-container {
    width: 100%;
    height: 4px;
    background: transparent;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
}
    .progress-bar {
    height: 100%;
    background: oklch(0.55 0.15 15);
    width: 0%;
}
}
    /* Simple smooth scroll */
    html {
    scroll-behavior: smooth;
}

      `}</style>

            {/*  BEGIN: Reading Progress Bar  */}
            <div className="progress-container" data-purpose="scroll-indicator">
                <div className="progress-bar" id="readingProgress"></div>
            </div>
            {/*  END: Reading Progress Bar  */}
            {/*  BEGIN: Sticky Navigation  */}
            <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200" data-purpose="main-nav">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <a className="flex items-center text-slate-600 hover:text-[oklch(0.55_0.15_15)] transition-colors font-medium" href="#">
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            </svg>
                            Quay lại Blog
                        </a>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Chia sẻ Facebook">
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                            </button>
                            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Sao chép liên kết">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                            </button>
                            <button className="bg-[oklch(0.55_0.15_15)] hover:bg-[oklch(0.65_0.15_15)] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                                Đăng ký học
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            {/*  END: Sticky Navigation  */}
            {/*  BEGIN: Hero Section  */}
            <header className="relative w-full h-[500px] bg-slate-900 overflow-hidden" data-purpose="article-hero">
                <img alt="Cover Image" className="absolute inset-0 w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7MNXSfkXAHWP3r7sz9mgKvdBYntZNNuWYk1HlAR9yx5RI2mX_vzJ5jNynZVSuKag32pi084Z1WfEr_rCIwK-ZZ-JfG45dyX4WicipjYCO7VUwdm7-7l3hjI60D2R1OGdjK7IMX0SpHFzhNRoVBWQ85bRuv-rCImSGLXD8wnscI2t_raT6q7k77UiYeYYCML3oeYq6h4LLb_brRwDUeRosRQkwsBCKLqRyVtD_YplWRPbKI_AFSPLFLS56wT5q1KypcNDPM4WHFIo" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
                    <div className="max-w-3xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-[oklch(0.55_0.15_15)] text-white text-xs font-bold tracking-wider uppercase mb-4">
                            Ngữ pháp N3
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                            Phân biệt các loại câu điều kiện TO, TARA, BA, NARA trong tiếng Nhật
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-slate-200 text-sm">
                            <div className="flex items-center gap-3">
                                <img alt="Sakura Sensei" className="w-10 h-10 rounded-full border-2 border-white/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPkDWVCzSQjZ9m1tmKVuJYQMGeXprszXKbMQVxZkhj_c69u-1va4ENEnk48DhuT2jpwWf-1N2flkq7Cylxd3juTyc8BP34TccG-PvefwhX0d-dX3NfpLAdZ3R5MjkNC72ahr87yWuinsoq6HO7zZXCE12obkR9gpwRf3e6iQc9KW9GpKjSHZlXHZj9AfF4PCGvVriwN9mcLI0QIaT3iIBamUMMvcFRrRXQ1wnJ7KaZ-Us2slvqmp1vo-5gl2KLHZpdH69drTkHwtM" />
                                <div>
                                    <p className="font-bold text-white">Sakura Sensei</p>
                                    <p className="opacity-80">Chuyên gia Ngữ pháp</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                                15 Tháng 10, 2023
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                                8 phút đọc
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                                2,450 lượt xem
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {/*  END: Hero Section  */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/*  BEGIN: Article Content  */}
                    <article className="lg:col-span-8" data-purpose="article-body">
                        <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-[oklch(0.55_0.15_15)] prose-strong:text-[oklch(0.25_0.05_15)]">
                            <p className="lead text-xl text-slate-600">
                                Trong tiếng Nhật, việc sử dụng các mẫu câu điều kiện như <span className="font-bold text-[oklch(0.55_0.15_15)]">〜と (~to)</span>, <span className="font-bold text-[oklch(0.55_0.15_15)]">〜たら (~tara)</span>, <span className="font-bold text-[oklch(0.55_0.15_15)]">〜ば (~ba)</span>, và <span className="font-bold text-[oklch(0.55_0.15_15)]">〜なら (~nara)</span> luôn là một thử thách lớn đối với người học, đặc biệt là ở trình độ N3 và N2. Bài viết này sẽ giúp bạn phân biệt rõ ràng cách dùng của từng loại.
                            </p>
                            <h2 id="to-condition">1. Cấu trúc 〜と (Hệ quả tất yếu)</h2>
                            <p>Dùng để diễn tả một kết quả tất nhiên, hiển nhiên xảy ra hoặc một thói quen cố định.</p>
                            <div className="bg-slate-100 p-6 rounded-xl border-l-4 border-[oklch(0.55_0.15_15)] not-prose my-6">
                                <p className="text-sm font-semibold uppercase text-slate-500 mb-2">Ví dụ:</p>
                                <p className="text-lg font-medium mb-1">春になると、花が咲きます。</p>
                                <p className="text-slate-600 italic">Haru ni naru to, hana ga sakimasu.</p>
                                <p className="text-slate-700 mt-2">Hễ trời sang xuân là hoa nở (Quy luật tự nhiên).</p>
                            </div>
                            <h2 id="tara-condition">2. Cấu trúc 〜たら (Điều kiện giả định &amp; Sau khi)</h2>
                            <p>Đây là cấu trúc "vạn năng" nhất, có thể dùng cho hầu hết các tình huống giả định hoặc sự việc xảy ra sau một hành động khác.</p>
                            <div className="bg-slate-100 p-6 rounded-xl border-l-4 border-[oklch(0.55_0.15_15)] not-prose my-6">
                                <p className="text-sm font-semibold uppercase text-slate-500 mb-2">Ví dụ:</p>
                                <p className="text-lg font-medium mb-1">日本に着いたら、電話してください。</p>
                                <p className="text-slate-600 italic">Nihon ni tsuitara, denwa shite kudasai.</p>
                                <p className="text-slate-700 mt-2">Sau khi đến Nhật, hãy gọi điện cho tôi nhé.</p>
                            </div>
                            <h2 id="ba-condition">3. Cấu trúc 〜ば (Điều kiện cần)</h2>
                            <p>Nhấn mạnh vào điều kiện cần thiết để một kết quả tốt đẹp xảy ra. Thường dùng cho các lời khuyên.</p>
                            <div className="bg-slate-100 p-6 rounded-xl border-l-4 border-[oklch(0.55_0.15_15)] not-prose my-6">
                                <p className="text-sm font-semibold uppercase text-slate-500 mb-2">Ví dụ:</p>
                                <p className="text-lg font-medium mb-1">練習すれば、上手になります。</p>
                                <p className="text-slate-600 italic">Renshuu sureba, jouzu ni narimasu.</p>
                                <p className="text-slate-700 mt-2">Nếu luyện tập, bạn sẽ giỏi lên.</p>
                            </div>
                            <h2 id="nara-condition">4. Cấu trúc 〜なら (Về vấn đề đó thì...)</h2>
                            <p>Dùng để đưa ra lời khuyên hoặc ý kiến dựa trên thông tin mà người nói nhận được từ đối phương.</p>
                            <div className="bg-slate-100 p-6 rounded-xl border-l-4 border-[oklch(0.55_0.15_15)] not-prose my-6">
                                <p className="text-sm font-semibold uppercase text-slate-500 mb-2">Ví dụ:</p>
                                <p className="text-lg font-medium mb-1">日本へ行くなら、カメラを買ったほうがいいですよ。</p>
                                <p className="text-slate-700 mt-2">Nếu định đi Nhật thì nên mua máy ảnh đi.</p>
                            </div>
                            <h2 id="summary">Tổng kết bảng so sánh</h2>
                            <p>Mỗi cấu trúc có một sắc thái riêng, hãy chú ý đến ý định của người nói khi lựa chọn mẫu câu phù hợp.</p>
                        </div>
                        {/*  BEGIN: Author Bio Card  */}
                        <div className="mt-16 p-8 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-sm" data-purpose="author-bio">
                            <img alt="Author" className="w-24 h-24 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxZS21cCafZepxQun1oi8KI_cu1zsb1t3bBHPHGh3zJR6-9D5usLHJ9Ajziatf4YFKIN5nMtT06VDmlWgrj1iecDqGOpfuaIu6050vRVTk4l6SMWrufny2Fhep-zYU4HsqOPs1KgACev0tMVBxq_zBT3MFBBXBLZRV_nD6ytnSYZsvyzxEzC7z4bAYfbgiAykaQmhx-1gwmHo55SlGvIxJMHNUwXmqvI0a-gK7_7Efo61p4lGCGLjtHoej5AxB6F9DEWqx6dM66_U" />
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Sakura Sensei</h3>
                                <p className="text-slate-600 mb-4 italic">"Học tiếng Nhật không khó, quan trọng là bạn tìm được cảm hứng mỗi ngày."</p>
                                <div className="flex justify-center md:justify-start gap-3">
                                    <a className="text-slate-400 hover:text-[oklch(0.55_0.15_15)] transition-colors font-medium text-sm" href="#">Xem tất cả bài viết</a>
                                    <span className="text-slate-300">•</span>
                                    <a className="text-slate-400 hover:text-[oklch(0.55_0.15_15)] transition-colors font-medium text-sm" href="#">Theo dõi trên Facebook</a>
                                </div>
                            </div>
                        </div>
                        {/*  END: Author Bio Card  */}
                    </article>
                    {/*  END: Article Content  */}
                    {/*  BEGIN: Sidebar  */}
                    <aside className="lg:col-span-4" data-purpose="article-sidebar">
                        <div className="sticky-sidebar space-y-8 sticky">
                            {/*  Table of Contents  */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                    <svg className="h-5 w-5 mr-2 text-[oklch(0.55_0.15_15)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                    </svg>
                                    Mục lục
                                </h3>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors block border-l-2 border-transparent hover:border-[oklch(0.55_0.15_15)] pl-3 py-1" href="#to-condition">1. Cấu trúc 〜と (Hệ quả tất yếu)</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors block border-l-2 border-transparent hover:border-[oklch(0.55_0.15_15)] pl-3 py-1" href="#tara-condition">2. Cấu trúc 〜たら (Điều kiện giả định)</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors block border-l-2 border-transparent hover:border-[oklch(0.55_0.15_15)] pl-3 py-1" href="#ba-condition">3. Cấu trúc 〜ば (Điều kiện cần)</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors block border-l-2 border-transparent hover:border-[oklch(0.55_0.15_15)] pl-3 py-1" href="#nara-condition">4. Cấu trúc 〜なら (Về vấn đề đó...)</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors block border-l-2 border-transparent hover:border-[oklch(0.55_0.15_15)] pl-3 py-1 font-medium" href="#summary">Tổng kết bảng so sánh</a></li>
                                </ul>
                            </div>
                            {/*  Stats & Interaction  */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-center flex-1 border-r border-slate-100">
                                        <p className="text-2xl font-bold text-[oklch(0.55_0.15_15)]">2.4k</p>
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Lượt xem</p>
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className="text-2xl font-bold text-slate-900">42</p>
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Bình luận</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                    </svg>
                                    Viết bình luận
                                </button>
                            </div>
                            {/*  Tags  */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Thẻ bài viết</h3>
                                <div className="flex flex-wrap gap-2">
                                    <a className="px-3 py-1 bg-slate-100 hover:bg-[oklch(0.55_0.15_15)] hover:text-white rounded-md text-sm text-slate-600 transition-colors" href="#">#NgữPháp</a>
                                    <a className="px-3 py-1 bg-slate-100 hover:bg-[oklch(0.55_0.15_15)] hover:text-white rounded-md text-sm text-slate-600 transition-colors" href="#">#N3</a>
                                    <a className="px-3 py-1 bg-slate-100 hover:bg-[oklch(0.55_0.15_15)] hover:text-white rounded-md text-sm text-slate-600 transition-colors" href="#">#JLPT</a>
                                    <a className="px-3 py-1 bg-slate-100 hover:bg-[oklch(0.55_0.15_15)] hover:text-white rounded-md text-sm text-slate-600 transition-colors" href="#">#TiengNhatCoBan</a>
                                </div>
                            </div>
                        </div>
                    </aside>
                    {/*  END: Sidebar  */}
                </div>
            </main>
            {/*  BEGIN: Related Articles  */}
            <section className="bg-slate-100 py-20" data-purpose="related-posts">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Bài viết liên quan</h2>
                            <p className="text-slate-600">Mở rộng kiến thức của bạn với các chủ đề tương tự</p>
                        </div>
                        <a className="text-[oklch(0.55_0.15_15)] font-bold flex items-center group" href="#">
                            Xem tất cả <svg className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/*  Related Card 1  */}
                        <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            <div className="aspect-video overflow-hidden">
                                <img alt="Related post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvvYukn1D7iLn1du-9BVVqf8IEQZR4jeqzVYeMQ0NozY5a_gzr4JdXExCxIsegiddEfhee62y6_gyfcaK801tcntcTU_untZZ-FrbLsFcpDd-r6p3oB2zxmi7lCMZQ7ZckRZo4qa-p_mJFUBDF0TLddebVw2RvYmqo-y2H1ToeTLN18VbNPyUDXsfDBSf-aK2pyM9XsexGj40J2JP3Uvs6nBKy-mvZ6U7TbQ-RM71w3p94p5mfd1kS8T49cik4izRldl-Gi431440" />
                            </div>
                            <div className="p-6">
                                <p className="text-[oklch(0.55_0.15_15)] text-xs font-bold uppercase mb-2">Ngữ pháp</p>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 hover:text-[oklch(0.55_0.15_15)] cursor-pointer transition-colors">Cách sử dụng thể bị động trong tiếng Nhật N3</h3>
                                <p className="text-slate-500 text-sm line-clamp-3 mb-4">Thể bị động thường gây nhầm lẫn với thể sai khiến, bài viết này sẽ giúp bạn nắm vững...</p>
                                <div className="flex items-center text-xs text-slate-400 font-medium">
                                    <span>10 Tháng 10, 2023</span>
                                    <span className="mx-2">•</span>
                                    <span>5 phút đọc</span>
                                </div>
                            </div>
                        </article>
                        {/*  Related Card 2  */}
                        <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            <div className="aspect-video overflow-hidden">
                                <img alt="Related post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQsBTXyaIRyeVn2DHk0aq5RwlLx0WoXtRM38wnfa51he-H8lqIjlKafgdjjREk2FLMiV6_ps5XHnbJ81NtlnNWsZM0oVk-Oh2vrHuHNRcEUtakWDIg-G73amYahsKlejzbvST4p1VPVQFcBivqMd5BhL2SkvyioZMTsJghpmjuG66tErO980es3n4fYlniqIHCIYYN3Wby5sxi6aVWe4ANPFDDEcGyIeNqHNAnF4qeoJ9Z0tElt3xW6T0ONz84qJ8bwPf3BwzXqDo" />
                            </div>
                            <div className="p-6">
                                <p className="text-[oklch(0.55_0.15_15)] text-xs font-bold uppercase mb-2">Luyện thi</p>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 hover:text-[oklch(0.55_0.15_15)] cursor-pointer transition-colors">Lộ trình 3 tháng chinh phục JLPT N3 hiệu quả</h3>
                                <p className="text-slate-500 text-sm line-clamp-3 mb-4">Kế hoạch chi tiết từng ngày giúp bạn đạt điểm cao trong kỳ thi JLPT sắp tới...</p>
                                <div className="flex items-center text-xs text-slate-400 font-medium">
                                    <span>08 Tháng 10, 2023</span>
                                    <span className="mx-2">•</span>
                                    <span>12 phút đọc</span>
                                </div>
                            </div>
                        </article>
                        {/*  Related Card 3  */}
                        <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            <div className="aspect-video overflow-hidden">
                                <img alt="Related post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0_SctiGRg-uarWUrkhsm3y0OX9F1VX54EqV4DSlAxfRc4UQMD9sW3luD-v1Jb3Bzgbfb4ct5ybHBaID07gyc67FZHBxfqEFBjJa7IQ93g7Lg22z7fm8sa9Oh9QDH1DUGtN_xhxwap9L9dCvStFbdKpP3AVUKD-zOdTe5tnavvcilMl-4VR3_ZUOCY3ZJ9khkTNpxlBtBrwNykp41v3YRosxP0qx3vy2nGxvym9jOKuJDQmTbozRVYP9Rn_TcfWFKDz7OJ2vb34hA" />
                            </div>
                            <div className="p-6">
                                <p className="text-[oklch(0.55_0.15_15)] text-xs font-bold uppercase mb-2">Từ vựng</p>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 hover:text-[oklch(0.55_0.15_15)] cursor-pointer transition-colors">100 Từ vựng N3 thường gặp trong đề thi</h3>
                                <p className="text-slate-500 text-sm line-clamp-3 mb-4">Tổng hợp các từ vựng xuất hiện nhiều nhất trong phần đọc hiểu và nghe hiểu...</p>
                                <div className="flex items-center text-xs text-slate-400 font-medium">
                                    <span>05 Tháng 10, 2023</span>
                                    <span className="mx-2">•</span>
                                    <span>15 phút đọc</span>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
            {/*  END: Related Articles  */}


        </div>
    );
}
