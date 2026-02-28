'use client';

export default function DashboardClientPage() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
      <style>{`

    .hover-lift {
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}
    .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
    .progress-ring-circle {
    transition: stroke-dashoffset 0.35s;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
}

      `}</style>

{/*  BEGIN: MainContainer  */}
<div className="max-w-[1440px] mx-auto p-6 md:p-10 space-y-8">
    {/*  BEGIN: WelcomeHeader  */}
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-purpose="welcome-section">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại, Minh Quân! 👋</h1>
            <p className="text-slate-500">Hôm nay là một ngày tuyệt vời để học tiếng Nhật.</p>
        </div>
        {/*  Stats Pills  */}
        <div className="flex flex-wrap gap-3">
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[oklch(0.55_0.15_15)]"></span>
                <span className="text-sm font-semibold">4 Khóa học</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span className="text-sm font-semibold">128 Giờ học</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-sm font-semibold">🔥 15 Ngày liên tiếp</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-semibold">75% Tiến độ</span>
            </div>
        </div>
    </header>
    {/*  END: WelcomeHeader  */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/*  BEGIN: MainContent  */}
        <main className="lg:col-span-2 space-y-8">
            {/*  Current Course Card  */}
            <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover-lift" data-purpose="current-course">
                <div className="md:flex">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                        <img alt="JLPT N3 Course" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0nTbQ2d0MpGticSZYf_0kj5VXp_KDRli33hZ_Oc-XpMsXPx41_cH4S_SHG9JAUbKevUweFYvo0Aw_WsB05vfp8LGkzRCvcEq-DWUfaoSEc9-JHS0-5hxV5J3ME9y8wKEd-ne9MthH0mNQQygspAMqmbqzL5AXIb8C7RAoTm4UlYSl8_J7jLmGFd5e1LI9VWd2SwJD5GQXTIHXl45_n5PefSFuOdEyx8_FTHtfq17HE2T4TLqFnGcdBm1ogIYrybb49Ui4JH01cKw"/>
                        <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">JLPT N3</span>
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold">Luyện thi JLPT N3: Giao tiếp Trung cấp</h2>
                                <span className="text-xs font-medium bg-[oklch(0.55_0.15_15)/0.1] text-[oklch(0.55_0.15_15)] px-2 py-1 rounded">Đang học</span>
                            </div>
                            <p className="text-slate-500 text-sm mb-4">Bài 12: Kính ngữ trong môi trường công sở (Keigo)</p>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                                <div className="bg-[oklch(0.55_0.15_15)] h-2.5 rounded-full w-[65%]"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                <span>65% Hoàn thành</span>
                                <span>45/70 Bài học</span>
                            </div>
                        </div>
                        <button className="mt-6 w-full md:w-max px-6 py-3 bg-[oklch(0.55_0.15_15)] hover:bg-[oklch(0.45_0.18_15)] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[oklch(0.55_0.15_15)/0.2]">
                            Tiếp tục học tập
                        </button>
                    </div>
                </div>
            </section>
            {/*  Analytics & Progress  */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6" data-purpose="analytics">
                {/*  Circular Goal Tracker  */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold mb-6">Mục tiêu JLPT N3</h3>
                    <div className="flex items-center justify-around">
                        <div className="relative flex items-center justify-center">
                            {/*  SVG Progress Ring  */}
                            <svg className="w-32 h-32">
                                <circle className="text-slate-100" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeWidth="8"/>
                                <circle className="text-[oklch(0.55_0.15_15)] progress-ring-circle" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeDasharray="339.29" strokeDashoffset="101.78" strokeLinecap="round" strokeWidth="8"/>
                            </svg>
                            <div className="absolute text-center">
                                <span className="block text-2xl font-bold">70%</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Sẵn sàng</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Giờ học</div>
                                <div className="text-lg font-bold">84h / 120h</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Điểm kinh nghiệm (XP)</div>
                                <div className="text-lg font-bold">12,450 XP</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  Skill Bars  */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold mb-2">Kỹ năng chi tiết</h3>
                    {/*  Vocab  */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                            <span>Từ vựng</span>
                            <span>85%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full w-[85%]"></div>
                        </div>
                    </div>
                    {/*  Grammar  */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                            <span>Ngữ pháp</span>
                            <span>60%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full w-[60%]"></div>
                        </div>
                    </div>
                    {/*  Kanji  */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                            <span>Hán tự (Kanji)</span>
                            <span>45%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full w-[45%]"></div>
                        </div>
                    </div>
                </div>
            </section>
            {/*  My Courses List  */}
            <section className="space-y-4" data-purpose="course-list">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Khóa học của tôi</h3>
                    <a className="text-[oklch(0.55_0.15_15)] text-sm font-bold hover:underline" href="#">Xem tất cả</a>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {/*  Course Item 1  */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover-lift">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">N4</div>
                            <div>
                                <h4 className="font-bold text-sm">Củng cố ngữ pháp N4 căn bản</h4>
                                <p className="text-xs text-slate-400">Đã hoàn thành 95%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block">
                                <svg className="w-10 h-10">
                                    <circle className="text-slate-100" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeWidth="3"/>
                                    <circle className="text-indigo-500" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeDasharray="100.5" strokeDashoffset="5" strokeLinecap="round" strokeWidth="3"/>
                                </svg>
                            </div>
                            <button className="p-2 hover:bg-slate-50 rounded-lg">
                                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    {/*  Course Item 2  */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover-lift">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[oklch(0.55_0.15_15)/0.1] rounded-xl flex items-center justify-center text-[oklch(0.55_0.15_15)] font-bold">K</div>
                            <div>
                                <h4 className="font-bold text-sm">2000 Hán tự thông dụng (Joyo)</h4>
                                <p className="text-xs text-slate-400">Đã hoàn thành 22%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block">
                                <svg className="w-10 h-10">
                                    <circle className="text-slate-100" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeWidth="3"/>
                                    <circle className="text-[oklch(0.55_0.15_15)]" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeDasharray="100.5" strokeDashoffset="78" strokeLinecap="round" strokeWidth="3"/>
                                </svg>
                            </div>
                            <button className="p-2 hover:bg-slate-50 rounded-lg">
                                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        {/*  END: MainContent  */}
        {/*  BEGIN: Sidebar  */}
        <aside className="space-y-8">
            {/*  AI Sensei CTA  */}
            <section className="bg-gradient-to-br from-[oklch(0.55_0.15_15)] to-[oklch(0.45_0.18_15)] p-6 rounded-3xl text-white shadow-xl shadow-[oklch(0.55_0.15_15)/0.3]" data-purpose="ai-sensei">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">
                        🤖
                    </div>
                    <div>
                        <h3 className="font-bold">Trợ lý AI Sensei</h3>
                        <p className="text-xs text-white/80">Giải đáp ngữ pháp 24/7</p>
                    </div>
                </div>
                <p className="text-sm mb-6 leading-relaxed">Bạn gặp khó khăn với cấu trúc "~ndesu"? Hãy hỏi Sensei ngay!</p>
                <button className="w-full py-3 bg-white text-[oklch(0.55_0.15_15)] font-bold rounded-xl hover:bg-slate-50 transition-colors">
                    Hỏi ngay bây giờ
                </button>
            </section>
            {/*  Gamification Card  */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm" data-purpose="gamification">
                <h3 className="font-bold mb-6">Thành tích học tập</h3>
                <div className="flex justify-between mb-8">
                    <div className="text-center group cursor-pointer">
                        <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">🔥</div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Chuỗi</span>
                        <p className="font-bold">15 Ngày</p>
                    </div>
                    <div className="text-center group cursor-pointer">
                        <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">⭐</div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Cấp độ</span>
                        <p className="font-bold">Lv. 24</p>
                    </div>
                    <div className="text-center group cursor-pointer">
                        <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Danh hiệu</span>
                        <p className="font-bold">12</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                        <span>Đến Lv. 25</span>
                        <span>450 / 1000 XP</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full w-[45%] shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
                    </div>
                </div>
            </section>
            {/*  Quick Links Grid  */}
            <section className="grid grid-cols-2 gap-3" data-purpose="quick-links">
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <span className="text-xl mb-2 group-hover:scale-110 transition-transform">📇</span>
                    <span className="text-xs font-bold">Thẻ ghi nhớ</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <span className="text-xl mb-2 group-hover:scale-110 transition-transform">📝</span>
                    <span className="text-xs font-bold">Ghi chú</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <span className="text-xl mb-2 group-hover:scale-110 transition-transform">🏅</span>
                    <span className="text-xs font-bold">Thành tựu</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <span className="text-xl mb-2 group-hover:scale-110 transition-transform">🎓</span>
                    <span className="text-xs font-bold">Chứng chỉ</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <span className="text-xl mb-2 group-hover:scale-110 transition-transform">📅</span>
                    <span className="text-xs font-bold">Lịch học</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <span className="text-xl mb-2 group-hover:scale-110 transition-transform">📊</span>
                    <span className="text-xs font-bold">Thống kê</span>
                </button>
            </section>
        </aside>
        {/*  END: Sidebar  */}
    </div>
    {/*  BEGIN: RecentActivity  */}
    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm" data-purpose="recent-activity">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Hoạt động gần đây</h3>
            <button className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
                    <th className="pb-4 font-bold">Bài học</th>
                    <th className="pb-4 font-bold">Khóa học</th>
                    <th className="pb-4 font-bold">Thời gian học</th>
                    <th className="pb-4 font-bold">Kết quả</th>
                    <th className="pb-4 font-bold text-right">Ngày thực hiện</th>
                </tr>
                </thead>
                <tbody className="text-sm">
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold">Bài 12: Kính ngữ Keigo</td>
                    <td className="py-4 text-slate-500">JLPT N3 - Trung cấp</td>
                    <td className="py-4 text-slate-500">45 phút</td>
                    <td className="py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">HOÀN THÀNH</span>
                    </td>
                    <td className="py-4 text-slate-500 text-right">Hôm nay, 09:30</td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold">Từ vựng Kanji chương 5</td>
                    <td className="py-4 text-slate-500">2000 Hán tự thông dụng</td>
                    <td className="py-4 text-slate-500">20 phút</td>
                    <td className="py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">HOÀN THÀNH</span>
                    </td>
                    <td className="py-4 text-slate-500 text-right">Hôm qua, 20:15</td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold">Kiểm tra ôn tập N4</td>
                    <td className="py-4 text-slate-500">Củng cố ngữ pháp N4</td>
                    <td className="py-4 text-slate-500">15 phút</td>
                    <td className="py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">ĐẠT 90%</span>
                    </td>
                    <td className="py-4 text-slate-500 text-right">12 Th08, 14:00</td>
                </tr>
                </tbody>
            </table>
        </div>
    </section>
    {/*  END: RecentActivity  */}
</div>
{/*  END: MainContainer  */}

    </div>
  );
}
