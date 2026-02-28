'use client';

export default function CourseLearnPage() {
    return (
        <div className="bg-gray-50 text-slate-900 font-sans antialiased overflow-hidden h-screen flex flex-col">
            <style>{`

    /* Hide scrollbar for cleaner look while maintaining functionality */
    .no-scrollbar::-webkit-scrollbar {
    display: none;
}
    .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

    /* Smooth transitions for interactive elements */
    .transition-all {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

    /* Active lesson indicator */
    .lesson-active {
    border-left: 4px solid oklch(0.55 0.15 15);
    background-color: #fcfcfc;
}

    /* Progress ring simulation */
    .progress-ring-circle {
    stroke-dasharray: 100;
    stroke-dashoffset: 35; /* Represents 65% completion */
}

      `}</style>

            {/*  BEGIN: Sticky Header  */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-50 flex-shrink-0" data-purpose="main-header">
                <div className="flex items-center space-x-4">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-all" title="Quay lại">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                    </button>
                    <div className="hidden sm:block">
                        <h1 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Khóa học N4: Tiếng Nhật Trung Cấp</h1>
                        <p className="text-lg font-bold text-slate-900">Bài 12: Thể Te và các ứng dụng</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    {/*  Progress Bar  */}
                    <div className="hidden md:flex flex-col items-end space-y-1">
                        <span className="text-xs font-medium text-gray-500">Tiến độ khóa học: 65%</span>
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[oklch(0.55_0.15_15)]" style={{ width: "65%" }}></div>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-[oklch(0.55_0.15_15)] flex items-center justify-center text-white font-bold text-xs">
                        TN
                    </div>
                </div>
            </header>
            {/*  END: Sticky Header  */}
            <div className="flex flex-1 overflow-hidden">
                {/*  BEGIN: Main Content Area  */}
                <main className="flex-1 overflow-y-auto no-scrollbar" data-purpose="learning-container">
                    {/*  BEGIN: Video Player Container  */}
                    <section className="bg-black w-full aspect-video flex items-center justify-center relative group" data-purpose="video-section">
                        <img alt="Video Placeholder" className="max-w-full max-h-full object-contain opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlEDIcxY2x3DjT8iyohZ2P-78TXMfnYAJlxBE3FiM4lucalJMvxs2DH0f-KiUIna-vCw4inbz0L_u9bdo5S5NLC2NTcOg1FfAUZOb1VXPDOC3pQwDCZWSuXTC_SS7ItH5x_LIWhdExMc9EaIo43JgrrnlM8EcCJWyXtfbKK_fGvEpQ_ybmXkKbLFrf0HTjHndhbRDAOBfVjlpRqbXwHeNIp-TF8KaopBN2JZBp5UbpBT9k4GR1lR_ziAoU0x6f0NWwJRmxWx2eZZI" />
                        {/*  Custom Video Controls Overlay  */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <button className="bg-[oklch(0.55_0.15_15)] text-white p-6 rounded-full shadow-2xl hover:scale-110 transition-all">
                                <svg className="h-10 w-10 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg>
                            </button>
                        </div>
                        {/*  Bottom Timeline  */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-600">
                            <div className="h-full bg-[oklch(0.55_0.15_15)] w-1/3"></div>
                        </div>
                    </section>
                    {/*  END: Video Player Container  */}
                    {/*  BEGIN: Lesson Navigation & Info  */}
                    <section className="p-6 lg:p-10 max-w-5xl mx-auto" data-purpose="lesson-details">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Bài 12: Thể Te và các ứng dụng</h2>
                                <p className="text-gray-500">Cập nhật lần cuối: 15/10/2023 • 15 phút</p>
                            </div>
                            <div className="flex space-x-3 mt-4 md:mt-0">
                                <button className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all text-gray-700">
                                    Bài trước
                                </button>
                                <button className="px-6 py-2.5 bg-[oklch(0.55_0.15_15)] text-white rounded-lg font-semibold hover:bg-[oklch(0.65_0.12_15)] transition-all shadow-lg shadow-[oklch(0.55_0.15_15)/0.2]">
                                    Bài tiếp theo
                                </button>
                            </div>
                        </div>
                        {/*  Tabs Navigation  */}
                        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
                            <nav className="flex space-x-8 whitespace-nowrap">
                                <button className="border-b-4 border-[oklch(0.55_0.15_15)] py-4 px-1 text-sm font-bold text-[oklch(0.55_0.15_15)]">
                                    Nội dung bài học
                                </button>
                                <button className="border-b-4 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-[oklch(0.55_0.15_15)] transition-all">
                                    Tài liệu (1)
                                </button>
                                <button className="border-b-4 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-[oklch(0.55_0.15_15)] transition-all">
                                    Bài tập
                                </button>
                                <button className="border-b-4 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-[oklch(0.55_0.15_15)] transition-all">
                                    Thảo luận
                                </button>
                            </nav>
                        </div>
                        {/*  Active Tab Content: Nội dung bài học  */}
                        <div className="prose prose-slate max-w-none" data-purpose="tab-content">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-xl font-bold text-slate-800">Tổng quan bài học</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Trong bài này, chúng ta sẽ tìm hiểu về cách chia động từ sang thể Te (て) và các cấu trúc ngữ pháp quan trọng đi kèm. Thể Te là một trong những kiến thức nền tảng quan trọng nhất trong tiếng Nhật sơ cấp N4-N5.
                                    </p>
                                    <div className="bg-red-50 border-l-4 border-[oklch(0.55_0.15_15)] p-6 rounded-r-lg">
                                        <h4 className="text-[oklch(0.55_0.15_15)] font-bold mb-3 uppercase text-sm tracking-widest">Điểm ngữ pháp chính</h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-start">
                                                <span className="text-[oklch(0.55_0.15_15)] mr-2">•</span>
                                                <span className="text-slate-700">Cách chia động từ Nhóm I, II, III sang thể Te.</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-[oklch(0.55_0.15_15)] mr-2">•</span>
                                                <span className="text-slate-700">Cấu trúc <strong>V-te kudasai</strong> (Yêu cầu, đề nghị).</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-[oklch(0.55_0.15_15)] mr-2">•</span>
                                                <span className="text-slate-700">Cấu trúc <strong>V-te imasu</strong> (Đang thực hiện hành động).</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-[oklch(0.55_0.15_15)] mr-2">•</span>
                                                <span className="text-slate-700">Liên kết các câu đơn bằng thể Te.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="bg-gray-100 p-6 rounded-xl">
                                    <h3 className="font-bold text-slate-800 mb-4">Ghi chú nhanh</h3>
                                    <textarea className="w-full h-40 p-3 border-gray-200 rounded-lg text-sm focus:ring-[oklch(0.55_0.15_15)] focus:border-[oklch(0.55_0.15_15)]" placeholder="Viết ghi chú cho bài học này..."></textarea>
                                    <button className="mt-3 w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-all">Lưu ghi chú</button>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*  END: Lesson Navigation & Info  */}
                </main>
                {/*  END: Main Content Area  */}
                {/*  BEGIN: Right Sidebar  */}
                <aside className="hidden xl:flex flex-col w-[400px] bg-white border-l border-gray-200" data-purpose="course-sidebar">
                    {/*  Sidebar Header  */}
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Nội dung khoá học</h3>
                        <div className="flex items-center space-x-4">
                            <div className="relative h-14 w-14">
                                <svg className="h-14 w-14 transform -rotate-90">
                                    <circle className="text-gray-100" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4" />
                                    <circle className="text-[oklch(0.55_0.15_15)] progress-ring-circle" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">65%</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">42/60 bài học</p>
                                <p className="text-xs text-gray-500">Hoàn thành 70% mục tiêu tuần</p>
                            </div>
                        </div>
                    </div>
                    {/*  Curriculum List  */}
                    <div className="flex-1 overflow-y-auto no-scrollbar" data-purpose="curriculum-list">
                        {/*  Module 1  */}
                        <div className="border-b border-gray-50">
                            <button className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-all group">
                                <div className="text-left">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Module 1</span>
                                    <h4 className="text-sm font-bold text-slate-700">Chào hỏi &amp; Làm quen</h4>
                                </div>
                                <svg className="h-4 w-4 text-gray-400 group-hover:text-[oklch(0.55_0.15_15)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                            </button>
                            {/*  Lessons in Module 1 (Collapsed for demo)  */}
                        </div>
                        {/*  Module 2  */}
                        <div className="border-b border-gray-50">
                            <div className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 transition-all">
                                <div className="text-left">
                                    <span className="text-[10px] font-bold text-[oklch(0.55_0.15_15)] uppercase">Module 2</span>
                                    <h4 className="text-sm font-bold text-slate-700">Động từ &amp; Hành động</h4>
                                </div>
                                <svg className="h-4 w-4 text-[oklch(0.55_0.15_15)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                            </div>
                            {/*  Lessons List  */}
                            <div className="bg-white">
                                {/*  Completed Lesson  */}
                                <div className="px-5 py-4 flex items-center space-x-4 hover:bg-gray-50 cursor-pointer transition-all border-l-4 border-transparent">
                                    <div className="text-green-500">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-600 truncate">Bài 11: Danh từ &amp; Động từ</p>
                                        <div className="flex items-center text-[11px] text-gray-400 mt-0.5">
                                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                                            <span>12:45</span>
                                        </div>
                                    </div>
                                </div>
                                {/*  Current Lesson  */}
                                <div className="px-5 py-4 flex items-center space-x-4 lesson-active cursor-pointer">
                                    <div className="text-[oklch(0.55_0.15_15)]">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" fillRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">Bài 12: Thể Te và ứng dụng</p>
                                        <div className="flex items-center text-[11px] text-[oklch(0.55_0.15_15)] font-semibold mt-0.5">
                                            <span>Đang học • 15:00</span>
                                        </div>
                                    </div>
                                </div>
                                {/*  Future Lesson  */}
                                <div className="px-5 py-4 flex items-center space-x-4 hover:bg-gray-50 cursor-pointer transition-all border-l-4 border-transparent">
                                    <div className="text-gray-300">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" fillRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-400 truncate">Bài 13: Thể Nai (Phủ định)</p>
                                        <div className="flex items-center text-[11px] text-gray-400 mt-0.5">
                                            <span>Chưa học • 20:15</span>
                                        </div>
                                    </div>
                                </div>
                                {/*  Locked Lesson  */}
                                <div className="px-5 py-4 flex items-center space-x-4 opacity-60 bg-gray-50 grayscale border-l-4 border-transparent cursor-not-allowed">
                                    <div className="text-gray-400">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path clipRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" fillRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-400 truncate">Bài 14: Ôn tập tổng hợp 1</p>
                                        <div className="flex items-center text-[11px] text-gray-400 mt-0.5">
                                            <span>Đã khóa</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*  Module 3  */}
                        <div className="border-b border-gray-50">
                            <button className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-all group">
                                <div className="text-left">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Module 3</span>
                                    <h4 className="text-sm font-bold text-slate-700">Tính từ &amp; Miêu tả</h4>
                                </div>
                                <svg className="h-4 w-4 text-gray-400 group-hover:text-[oklch(0.55_0.15_15)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </aside>
                {/*  END: Right Sidebar  */}
            </div>
            {/*  BEGIN: Mobile Navigation (Floating Toggle)  */}
            <button className="xl:hidden fixed bottom-6 right-6 h-14 w-14 bg-[oklch(0.55_0.15_15)] text-white rounded-full shadow-2xl flex items-center justify-center z-[100]">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
            </button>
            {/*  END: Mobile Navigation  */}

        </div>
    );
}
