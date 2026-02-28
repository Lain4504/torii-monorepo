'use client';

import React from 'react';

export function HomeClient() {
    return (
        <>
            <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .gradient-primary {
          background: linear-gradient(135deg, oklch(0.55 0.15 15), oklch(0.65 0.18 20));
        }
        .wave-pattern {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='20' viewBox='0 0 100 20'%3E%3Cpath d='M21.1,18.3c0,0-2.8,0.7-4.5,0.7c-3.1,0-5.4-2.3-5.4-5.4c0-2,0.9-3.9,2.4-5.2c1.5-1.3,3.4-1.9,5.2-1.6 c-0.6-0.2-1.2-0.3-1.8-0.3c-3.1,0-5.4,2.3-5.4,5.4c0,2.4,1.3,4.5,3.3,5.6C12,18.9,8.4,19.9,4.4,19.9c-4.1,0-4.4-3-4.4-3 s1.1,1.5,4.4,1.5c4.1,0,8.1-1.3,11.2-3.6c-0.2,0.1-0.3,0.2-0.5,0.2c-3.1,0-5.4-2.3-5.4-5.4c0-3,2.3-5.4,5.4-5.4c3,0,5.4,2.3,5.4,5.4 C20.5,14.6,20.7,16.6,21.1,18.3z' fill='%23ef4444' fill-opacity='0.05'/%3E%3C/svg%3E");
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

            <div className="bg-slate-50 text-slate-900 font-sans selection:bg-[oklch(0.55_0.15_15)] selection:text-white">


                <main>
                    {/*  BEGIN: Hero Section  */}
                    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 wave-pattern" data-purpose="hero">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[oklch(0.55_0.15_15)]/10 blur-[120px] rounded-full"></div>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <div className="grid lg:grid-cols-2 gap-16 items-center">
                                {/*  Left Column  */}
                                <div className="space-y-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(0.55_0.15_15)]/5 border border-[oklch(0.55_0.15_15)]/10 text-[oklch(0.55_0.15_15)] text-sm font-medium animate-pulse">
                                        <span>✨ Nền tảng học tiếng Nhật số 1 Việt Nam</span>
                                    </div>
                                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                                        Chinh phục Tiếng Nhật cùng <span className="text-[oklch(0.55_0.15_15)]">AI Sensei</span>
                                    </h1>
                                    <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                                        Học có lộ trình bài bản, luyện giao tiếp thông minh với AI, sẵn sàng chinh phục mọi kỳ thi JLPT với sự tự tin tuyệt đối.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button className="px-8 py-4 gradient-primary text-white font-bold rounded-2xl shadow-lg shadow-[oklch(0.55_0.15_15)]/25 hover:scale-105 transition-transform">
                                            Bắt đầu miễn phí
                                        </button>
                                        <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all">
                                            Xem khóa học
                                        </button>
                                    </div>
                                    {/*  Social Proof  */}
                                    <div className="flex items-center gap-4 pt-4">
                                        <div className="flex -space-x-3">
                                            <img alt="Student" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0g4Gjy3V4vpIHZfB3v0TYWmjTRZAAtHhib8OrJQEAHUagIipBq7WbP38IDvb78Syt4mAnNmyWcUv2t_HsP9AubTLRgD5HKFIOH9qY6qacekM4BQ7TxXsZeT534ZdzKlaaj0ux9_CUpR8hI-Y8cw55wPOvYWODG68Ma_jaJQV3aUCvVWDbbjPGISnUhC15Fd_MKZJpIGsi38sLm6QETYmk1prTkfgBG6QVcEk5qY8ASVPYld3Ly1WFz4o-BHG2C4s6HgbqC8ldQ28" />
                                            <img alt="Student" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRAxIQYM6jI9xk9KJdUrHFMFyHUb5bOI00_UmG3ql37uBDsfkZk531oAqM3wGXcbYl3mkWTXqOj2v-Fz83CSmELHH43YDFR-tvUv7p15ep2DcrwhCCVM3JCjSD4Ri1mrL4w8LP8lVa_vHEDwxNg_gm9eRxofdLytr45JL7yu1JUv1t6hkQVjuv7vOJZNE_xQZh7JlWByXhArOcXNqIzVufe0Q3dH2y5Gus0shcZ6q5kDyc2wHZxIL8egF6J_OG0spUnPGxxDTqavg" />
                                            <img alt="Student" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw3nNy5aYOMuXGT_uEB8vxToh8jan7mM6CIbqdEkBGSymluS5kuBnlZ8QPR_mlNqhP1SCHkXC0uVEH08PQnid7NbeW_U2D9osAwLJATafGRuW588J0qy5BiADsNPRSq7CfhsQwaBj-T9U0AmjYXCs_Yh1JUc24a0uHFrbl7MzfP0YabafulvffaBPEg1cNKa6Z_P20mWRvZXzhsC4CfN4nSDRU95003TPpTqUsoZxcaZZkMX8kS_YKAfiHxeVUaubb3P0ZIy7qFhU" />
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">+5k</div>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">Hơn <span className="text-slate-900">5.000+ học viên</span> đã tin tưởng tham gia</p>
                                    </div>
                                </div>
                                {/*  Right Column (Visuals)  */}
                                <div className="relative lg:h-[600px] flex items-center justify-center">
                                    {/*  Background Decoration  */}
                                    <div className="absolute w-[400px] h-[400px] border-[20px] border-[oklch(0.55_0.15_15)]/5 rounded-full"></div>
                                    {/*  Floating Cards  */}
                                    <div className="relative w-full max-w-md animate-float">
                                        {/*  AI Sensei Active Card  */}
                                        <div className="absolute -top-10 -left-6 z-30 glass-card p-4 rounded-2xl shadow-xl w-64 border-l-4 border-[oklch(0.55_0.15_15)]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[oklch(0.55_0.15_15)] flex items-center justify-center text-white">AI</div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">AI Sensei đang nói...</p>
                                                    <div className="flex gap-1 mt-1">
                                                        <div className="w-1 h-3 bg-[oklch(0.55_0.15_15)] rounded-full"></div>
                                                        <div className="w-1 h-5 bg-[oklch(0.55_0.15_15)] rounded-full"></div>
                                                        <div className="w-1 h-2 bg-[oklch(0.55_0.15_15)] rounded-full"></div>
                                                        <div className="w-1 h-4 bg-[oklch(0.55_0.15_15)] rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/*  Main Hero Image (Placeholder)  */}
                                        <div className="relative z-20 rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 transition-transform hover:rotate-0">
                                            <img alt="Learning Platform" className="w-full h-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTOe11-fDnawSWf4VWRzlR2MQRWaZ2Hcj-XRUce7joxU5-MaJmQlY40vXeFRwv94TV6KOYJ_Tr7CxLY5FPFaNBs-MQyBQ0sS232qwo4sER4XMS2HPPVnqP4RX7t9ko6JkAIukUzEWiIRqAuJ9yNheI8uUmF8-HDXo0yqhco-iJ1qCsxh9pm4qv21nZNW9Rb1-a6iI4fwIR8QQkmd1IvrD2QdKFAlBIvMkmINGNJtcLBquGXNBbBjVgUzoQg5ecrj3l2U2c-LIGSys" />
                                        </div>
                                        {/*  Progress Card  */}
                                        <div className="absolute -bottom-8 -right-4 z-30 glass-card p-5 rounded-2xl shadow-xl w-56">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-bold">Tiến độ hôm nay</span>
                                                <span className="text-xs font-bold text-[oklch(0.55_0.15_15)]">85%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-[oklch(0.55_0.15_15)] h-full w-[85%]"></div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-bold">Mục tiêu: N3 Master</p>
                                        </div>
                                        {/*  N3 Badge  */}
                                        <div className="absolute top-1/2 -right-10 z-30 bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center">
                                            <span className="text-2xl font-black">N3</span>
                                            <span className="text-[10px] uppercase font-bold">JLPT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Hero Section  */}
                    {/*  BEGIN: Metrics Bar  */}
                    <section className="bg-white border-y border-slate-100 py-10" data-purpose="metrics">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center md:border-r border-slate-100">
                                    <p className="text-3xl font-bold text-slate-900">5.000+</p>
                                    <p className="text-sm text-slate-500 font-medium mt-1">Học viên</p>
                                </div>
                                <div className="text-center md:border-r border-slate-100">
                                    <p className="text-3xl font-bold text-slate-900">200+</p>
                                    <p className="text-sm text-slate-500 font-medium mt-1">Khóa học</p>
                                </div>
                                <div className="text-center md:border-r border-slate-100">
                                    <p className="text-3xl font-bold text-slate-900">98%</p>
                                    <p className="text-sm text-slate-500 font-medium mt-1">Tỉ lệ hài lòng</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-slate-900">4.9★</p>
                                    <p className="text-sm text-slate-500 font-medium mt-1">Đánh giá</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Metrics Bar  */}
                    {/*  BEGIN: Features Section  */}
                    <section className="py-24 bg-slate-50" data-purpose="features">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Công nghệ dẫn đầu, học tập hiệu quả</h2>
                                <p className="text-slate-600 max-w-2xl mx-auto">Chúng tôi kết hợp AI hiện đại với phương pháp giảng dạy truyền thống để mang lại trải nghiệm tốt nhất.</p>
                            </div>
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/*  Large AI Card  */}
                                <div className="lg:col-span-2 bg-[#0f172a] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden text-white shadow-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[oklch(0.55_0.15_15)]/20 blur-[100px]"></div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            <span className="px-3 py-1 bg-[oklch(0.55_0.15_15)]/20 border border-[oklch(0.55_0.15_15)]/30 rounded-full text-[oklch(0.55_0.15_15)] text-xs font-bold uppercase tracking-widest mb-6 inline-block">Tính năng độc quyền</span>
                                            <h3 className="text-3xl md:text-4xl font-bold mb-6">AI Sensei - Trợ lý học tập 24/7</h3>
                                            <p className="text-slate-300 text-lg max-w-md leading-relaxed mb-8">
                                                Hỏi đáp kiến thức, sửa lỗi ngữ pháp và luyện hội thoại trực tiếp như đang nói chuyện với người bản xứ.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">Trải nghiệm ngay</button>
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30"></div>
                                                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30"></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/*  Mock UI Element  */}
                                    <div className="absolute bottom-[-10%] right-[-5%] hidden md:block w-72 glass-card rounded-2xl p-4 border-[oklch(0.55_0.15_15)]/20 transform rotate-[-5deg] bg-slate-900/40">
                                        <div className="space-y-3">
                                            <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                                            <div className="h-2 bg-slate-700 rounded w-full"></div>
                                            <div className="h-2 bg-[oklch(0.55_0.15_15)] rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                                {/*  Feature Grid  */}
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-xl">🌐</div>
                                        <h4 className="font-bold text-xl mb-2">Live WebRTC</h4>
                                        <p className="text-slate-500 text-sm">Lớp học trực tuyến chất lượng cao với tương tác thời gian thực.</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 text-xl">🎬</div>
                                        <h4 className="font-bold text-xl mb-2">Bài giảng Video</h4>
                                        <p className="text-slate-500 text-sm">Hệ thống bài giảng HD, minh họa sinh động từ các giảng viên top đầu.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mt-8">
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-6">
                                    <div className="shrink-0 w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">🎓</div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-2">Luyện thi JLPT</h4>
                                        <p className="text-slate-500 text-sm">Kho đề thi thử khổng lồ với cấu trúc chuẩn từ N5 đến N1.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-6">
                                    <div className="shrink-0 w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl">🗂️</div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-2">AI Flashcards</h4>
                                        <p className="text-slate-500 text-sm">Ghi nhớ từ vựng siêu tốc với thuật toán lặp lại ngắt quãng (SRS).</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Features Section  */}
                    {/*  BEGIN: Courses Section  */}
                    <section className="py-24 bg-white" data-purpose="featured-courses">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Khóa học nổi bật</h2>
                                    <p className="text-slate-600">Được thiết kế riêng cho người Việt, cam kết đầu ra.</p>
                                </div>
                                <a className="text-[oklch(0.55_0.15_15)] font-bold flex items-center gap-2 hover:underline" href="#">Xem tất cả khóa học →</a>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {/*  Course Card 1  */}
                                <div className="group cursor-pointer">
                                    <div className="relative rounded-[2rem] overflow-hidden mb-6">
                                        <img alt="N5 Course" className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwucFRRUERMQBOOkOwZn4PtH1sJCmTUjwb2rPzNv9ukdxRZOUwtT62-U-U3Dq5qg0-0_qpzbT1LhrOylTmNXq_RECg7qE1tXJnoJ-Dnkaee8JsOctc5h3zHuGi179N4q9RCsWG7WZAAVqocYPBwaZK08HSw1xbns1KRRS-GL5p5QLn2-aciob-9kleqc9ekr_wKjWSHBAQrOuIuPUzbmhAu3Jd3mYcsLmcXr8HodW2f2Jic7xLHa1uPRYRIMWNeqRcBAbF0NkZxBQ" />
                                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">N5 BLUE</div>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[oklch(0.55_0.15_15)] transition-colors">Chinh phục JLPT N5 cho người mới bắt đầu</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[oklch(0.55_0.15_15)] font-black text-lg">1.200.000 ₫</span>
                                        <a className="text-slate-400 text-sm font-medium hover:text-slate-900 underline underline-offset-4" href="#">Xem chi tiết</a>
                                    </div>
                                </div>
                                {/*  Course Card 2  */}
                                <div className="group cursor-pointer">
                                    <div className="relative rounded-[2rem] overflow-hidden mb-6">
                                        <img alt="N4 Course" className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi0uprrOQCrBDgvUo3x4uNezVeNJAOqyRrOLAlneH0tj0ej5pjMuXP8TcWTjP0Btmze8X4giIDtaKFg2Z7wADyNJakLWK1siBQWmz-ilqtUWOPruTUdAOtBACF_I6HkJ3RcqHidr6Iyysr1jM3wWS-FDyFsReCXKP52dKQ9VC53OeEy25uO3ldmsQbCSz9CGmPuNxawDtkRraLg_jjI49RfhX4-V2pRFFWs9tZLtmVpQncodKiTT5dUF4y656Z1PkhEqhhd6z9qaI" />
                                        <div className="absolute top-4 left-4 bg-teal-500 text-white px-3 py-1 rounded-lg text-xs font-bold">N4 TEAL</div>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[oklch(0.55_0.15_15)] transition-colors">Tiếng Nhật trung cấp N4 &amp; Giao tiếp</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[oklch(0.55_0.15_15)] font-black text-lg">1.500.000 ₫</span>
                                        <a className="text-slate-400 text-sm font-medium hover:text-slate-900 underline underline-offset-4" href="#">Xem chi tiết</a>
                                    </div>
                                </div>
                                {/*  Course Card 3  */}
                                <div className="group cursor-pointer">
                                    <div className="relative rounded-[2rem] overflow-hidden mb-6">
                                        <img alt="N3 Course" className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3k4HONQJcTQU3HxiYyYDPpHf7WjnwBHnU5sOyYcIiFC1Men9JO8JePBndnLVNky86ynxcDYOA9b6q_y0qfcegsTk1wDsxaPIyhLrvNdD-ILYPnBenaia9gvJpKmsf3CHDu3xD4UzuGg0N7h6QWcQEEUKsS1exC8O2bRiCu1Q62apCeID9SshlmIpqkx9DABiJo7y8xaZIFAesOWru3lNBzRGRlR7p-AKvMaSvnQEbrznCNHsHujIpf8pTGwBhLqnW1QdYNV4uWao" />
                                        <div className="absolute top-4 left-4 bg-[oklch(0.55_0.15_15)] text-white px-3 py-1 rounded-lg text-xs font-bold">N3 MASTER</div>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[oklch(0.55_0.15_15)] transition-colors">Luyện thi N3 cấp tốc - Cam kết đậu</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[oklch(0.55_0.15_15)] font-black text-lg">2.200.000 ₫</span>
                                        <a className="text-slate-400 text-sm font-medium hover:text-slate-900 underline underline-offset-4" href="#">Xem chi tiết</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Courses Section  */}
                    {/*  BEGIN: Journey Section  */}
                    <section className="py-24 bg-slate-50" data-purpose="journey">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-slate-900">Bắt đầu chỉ trong 4 bước</h2>
                            </div>
                            <div className="space-y-12 relative">
                                {/*  Connector Line  */}
                                <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -z-0"></div>
                                {/*  Step 1  */}
                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 group">
                                    <div className="flex-1 md:text-right hidden md:block">
                                        <h3 className="font-bold text-xl mb-2">Đăng ký tài khoản</h3>
                                        <p className="text-slate-500">Chỉ mất 30 giây để bắt đầu hành trình của bạn.</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-white border-4 border-[oklch(0.55_0.15_15)] flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] shadow-lg shrink-0">1</div>
                                    <div className="flex-1">
                                        <div className="md:hidden">
                                            <h3 className="font-bold text-xl mb-1">Đăng ký tài khoản</h3>
                                            <p className="text-slate-500 text-sm">Chỉ mất 30 giây để bắt đầu hành trình.</p>
                                        </div>
                                    </div>
                                </div>
                                {/*  Step 2  */}
                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className="flex-1 hidden md:block"></div>
                                    <div className="w-14 h-14 rounded-full bg-white border-4 border-[oklch(0.55_0.15_15)] flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] shadow-lg shrink-0">2</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-2">Kiểm tra trình độ</h3>
                                        <p className="text-slate-500">Làm bài test nhanh để AI xác định lộ trình phù hợp.</p>
                                    </div>
                                </div>
                                {/*  Step 3  */}
                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className="flex-1 md:text-right hidden md:block">
                                        <h3 className="font-bold text-xl mb-2">Học theo lộ trình</h3>
                                        <p className="text-slate-500">Học video, luyện tập với AI và tương tác cùng giáo viên.</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-white border-4 border-[oklch(0.55_0.15_15)] flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] shadow-lg shrink-0">3</div>
                                    <div className="flex-1">
                                        <div className="md:hidden">
                                            <h3 className="font-bold text-xl mb-1">Học theo lộ trình</h3>
                                            <p className="text-slate-500 text-sm">Học video, luyện tập với AI.</p>
                                        </div>
                                    </div>
                                </div>
                                {/*  Step 4  */}
                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className="flex-1 hidden md:block"></div>
                                    <div className="w-14 h-14 rounded-full bg-white border-4 border-[oklch(0.55_0.15_15)] flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] shadow-lg shrink-0">4</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-2">Nhận chứng chỉ</h3>
                                        <p className="text-slate-500">Vượt qua kỳ thi và nhận chứng nhận hoàn thành từ Torii.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Journey Section  */}
                    {/*  BEGIN: Roadmap Section  */}
                    <section className="py-24 overflow-hidden bg-white" data-purpose="roadmap">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-center mb-16">Lộ trình JLPT chuẩn Nhật Bản</h2>
                            <div className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x">
                                {/*  N5 Card  */}
                                <div className="snap-center shrink-0 w-72 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                    <span className="absolute top-4 right-6 text-6xl [font-family:'Noto_Sans_JP',_sans-serif] text-slate-100 group-hover:text-[oklch(0.55_0.15_15)]/5 select-none">五</span>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-6">N5</div>
                                        <h4 className="font-bold text-lg mb-2">Sơ cấp 1</h4>
                                        <p className="text-sm text-slate-500 mb-4">Làm quen với bảng chữ cái và giao tiếp cơ bản.</p>
                                        <ul className="text-xs space-y-2 text-slate-600">
                                            <li>• 800 từ vựng</li>
                                            <li>• 100 chữ Hán</li>
                                        </ul>
                                    </div>
                                </div>
                                {/*  N4 Card  */}
                                <div className="snap-center shrink-0 w-72 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                    <span className="absolute top-4 right-6 text-6xl [font-family:'Noto_Sans_JP',_sans-serif] text-slate-100 group-hover:text-teal-500/5 select-none">四</span>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold mb-6">N4</div>
                                        <h4 className="font-bold text-lg mb-2">Sơ cấp 2</h4>
                                        <p className="text-sm text-slate-500 mb-4">Giao tiếp hàng ngày trôi chảy hơn.</p>
                                        <ul className="text-xs space-y-2 text-slate-600">
                                            <li>• 1500 từ vựng</li>
                                            <li>• 300 chữ Hán</li>
                                        </ul>
                                    </div>
                                </div>
                                {/*  N3 Card  */}
                                <div className="snap-center shrink-0 w-72 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all scale-105 shadow-md">
                                    <span className="absolute top-4 right-6 text-6xl [font-family:'Noto_Sans_JP',_sans-serif] text-slate-100 group-hover:text-[oklch(0.55_0.15_15)]/5 select-none">三</span>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.15_15)]/10 text-[oklch(0.55_0.15_15)] flex items-center justify-center font-bold mb-6">N3</div>
                                        <h4 className="font-bold text-lg mb-2">Trung cấp</h4>
                                        <p className="text-sm text-slate-500 mb-4">Hiểu các nội dung cụ thể về các chủ đề hàng ngày.</p>
                                        <ul className="text-xs space-y-2 text-slate-600">
                                            <li>• 3000 từ vựng</li>
                                            <li>• 600 chữ Hán</li>
                                        </ul>
                                    </div>
                                </div>
                                {/*  N2 Card  */}
                                <div className="snap-center shrink-0 w-72 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                    <span className="absolute top-4 right-6 text-6xl [font-family:'Noto_Sans_JP',_sans-serif] text-slate-100 group-hover:text-orange-500/5 select-none">二</span>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-6">N2</div>
                                        <h4 className="font-bold text-lg mb-2">Thượng cấp 1</h4>
                                        <p className="text-sm text-slate-500 mb-4">Làm việc chuyên nghiệp trong môi trường Nhật Bản.</p>
                                        <ul className="text-xs space-y-2 text-slate-600">
                                            <li>• 6000 từ vựng</li>
                                            <li>• 1000 chữ Hán</li>
                                        </ul>
                                    </div>
                                </div>
                                {/*  N1 Card  */}
                                <div className="snap-center shrink-0 w-72 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
                                    <span className="absolute top-4 right-6 text-6xl [font-family:'Noto_Sans_JP',_sans-serif] text-slate-100 group-hover:text-purple-500/5 select-none">一</span>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-6">N1</div>
                                        <h4 className="font-bold text-lg mb-2">Thượng cấp 2</h4>
                                        <p className="text-sm text-slate-500 mb-4">Sử dụng tiếng Nhật thành thạo như người bản xứ.</p>
                                        <ul className="text-xs space-y-2 text-slate-600">
                                            <li>• 10000 từ vựng</li>
                                            <li>• 2000 chữ Hán</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Roadmap Section  */}
                    {/*  BEGIN: Testimonials Section  */}
                    <section className="py-24 bg-slate-50" data-purpose="testimonials">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-center mb-16">Học viên nói gì về Torii</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {/*  Card 1  */}
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="flex text-[oklch(0.55_0.15_15)] mb-4">★★★★★</div>
                                    <p className="text-slate-600 mb-8 italic">"AI Sensei thực sự làm mình kinh ngạc. Mình có thể luyện nói bất cứ lúc nào mà không sợ bị phán xét hay ngại ngùng."</p>
                                    <div className="flex items-center gap-4">
                                        <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFhhUeI030ZrA86Mx17gtxN4D3vRvI8Dfx6S78tfGHbr2qzAGsYtFTv8G_sAQzk_J9XFn5au_q6TOFmGdF4AeWi1GKtReOHd5Me_PYHAklByUkDlt1oApp5dmIPhxlBJuMbRh7mpG7T-8EgetBVFyVWGXb_n5TywG7AksFWnMJfh1UJJUSlKo5L9NhHgYoyXphcn-EsUkKqWBFUR2zd-xSBW0t8SxFOgFkLq8g4E1F9UT0viEbt_lf50IJfr4169NHbgCR6kF806o" />
                                        <div>
                                            <p className="font-bold text-sm">Trần Nhật Minh</p>
                                            <p className="text-xs text-slate-400">Học viên N3</p>
                                        </div>
                                    </div>
                                </div>
                                {/*  Card 2  */}
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="flex text-[oklch(0.55_0.15_15)] mb-4">★★★★★</div>
                                    <p className="text-slate-600 mb-8 italic">"Lộ trình học rất rõ ràng, từ vựng và ngữ pháp được lồng ghép thông minh giúp mình nhớ rất lâu."</p>
                                    <div className="flex items-center gap-4">
                                        <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ1px8NY1Dr6iiByXw2ML3UFVIhoSc3SVcOkG8yDic4awow2oQk9AX0DuuatHTisIg-N0xbEMO-LZUpFkNsKjE2ELIVXwPwed0f7vAyiAFcEWAl69hPcaKIr3la7K1qaxgLMJIFilYEPLZHOYKkV7eWG6sbrq6d5IjeVdeKUHUzsblyVzPZwWq1Dzs0dQRMAXSo76ItM_5fNjOrw1jFvAsINrDf3FMOLVgNQCiKHYa0DsZeyv61BeVxLbBEIAdIT8wXy7bmnYrAks" />
                                        <div>
                                            <p className="font-bold text-sm">Lê Thị Quỳnh Hoa</p>
                                            <p className="text-xs text-slate-400">Học viên N4</p>
                                        </div>
                                    </div>
                                </div>
                                {/*  Card 3  */}
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="flex text-[oklch(0.55_0.15_15)] mb-4">★★★★★</div>
                                    <p className="text-slate-600 mb-8 italic">"Mình đã đỗ N2 chỉ sau 6 tháng học tại Torii. Cảm ơn đội ngũ giáo viên rất nhiều!"</p>
                                    <div className="flex items-center gap-4">
                                        <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqqOyIJuWuPjvfV8DBwn42oT5fvYId7_sT-nv7wepsCwMoV9VH55PxNZVYdJRZ_oFcQArucbEws16-SlCY0hbwKEjqZDB9tqmF-5QSFJCqs95BBxQXoAL4WpHsEH83t0PUgLrXd-JGgpGQC0YziAoKOAW2B3K4wEmTF8nDLJEk_X07UVGkULGPEUieiVYduPG23wsEJysOeJBeNEZ9dIFdtkd_1-lgWbmvgwrjHcazh2N9zgu3ZkyCnM1qqq9tuZe-yV9blDWRFK0" />
                                        <div>
                                            <p className="font-bold text-sm">Nguyễn Thành An</p>
                                            <p className="text-xs text-slate-400">Cựu học viên N2</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Testimonials Section  */}
                    {/*  BEGIN: Final CTA  */}
                    <section className="py-24 px-4 sm:px-6 lg:px-8" data-purpose="final-cta">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-[#0f172a] rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center text-white">
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                                    <span className="text-[30vw] [font-family:'Noto_Sans_JP',_sans-serif] font-black">日本語</span>
                                </div>
                                <div className="relative z-10 max-w-3xl mx-auto">
                                    <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">Bắt đầu hành trình tiếng Nhật của bạn ngay hôm nay</h2>
                                    <p className="text-slate-400 text-lg mb-12">Gia nhập cộng đồng hơn 5.000 học viên và chinh phục mục tiêu sự nghiệp của bạn.</p>
                                    <button className="group px-10 py-5 gradient-primary text-white font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto">
                                        Đăng ký miễn phí
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Final CTA  */}
                </main>
                {/*  BEGIN: Footer  */}
                <footer className="bg-white pt-24 pb-12 border-t border-slate-100" data-purpose="footer">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                            <div className="col-span-2 lg:col-span-2">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 bg-[oklch(0.55_0.15_15)] rounded-lg flex items-center justify-center text-white font-bold text-xl">鳥</div>
                                    <span className="text-xl font-bold tracking-tight">Torii<span className="text-[oklch(0.55_0.15_15)]">Nihongo</span></span>
                                </div>
                                <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">Nền tảng học tiếng Nhật ứng dụng công nghệ AI hàng đầu Việt Nam, giúp bạn rút ngắn 50% thời gian học tập.</p>
                                <div className="flex gap-4">
                                    <a className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-[oklch(0.55_0.15_15)] hover:text-white transition-colors" href="#">f</a>
                                    <a className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-[oklch(0.55_0.15_15)] hover:text-white transition-colors" href="#">yt</a>
                                    <a className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-[oklch(0.55_0.15_15)] hover:text-white transition-colors" href="#">in</a>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold mb-6">Khóa học</h4>
                                <ul className="space-y-4 text-sm text-slate-500">
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Khóa học N5-N4</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Khóa học N3</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Luyện thi N2-N1</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Giao tiếp Kaiwa</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-6">Công ty</h4>
                                <ul className="space-y-4 text-sm text-slate-500">
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Giới thiệu</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Tuyển dụng</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Liên hệ</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Chính sách</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-6">Hỗ trợ</h4>
                                <ul className="space-y-4 text-sm text-slate-500">
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Trung tâm hỗ trợ</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Hướng dẫn học</a></li>
                                    <li><a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Cộng đồng</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-100 flex flex-col md:row justify-between items-center gap-4">
                            <p className="text-sm text-slate-400">© 2024 Torii Nihongo. All rights reserved.</p>
                            <div className="flex gap-8 text-sm text-slate-400">
                                <a className="hover:text-slate-900" href="#">Privacy Policy</a>
                                <a className="hover:text-slate-900" href="#">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </footer>
                {/*  END: Footer  */}

            </div>
        </>
    );
}
