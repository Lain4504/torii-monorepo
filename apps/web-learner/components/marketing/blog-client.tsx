'use client';

export function BlogClient() {
  return (
    <div className="bg-[#fafafa] text-[#1a1a1a] antialiased min-h-screen">
      <style>{`{

    body {
    background-color: #fafafa;
    color: #1a1a1a;
    -webkit-font-smoothing: antialiased;
}
    .custom-scrollbar::-webkit-scrollbar {
    height: 4px;
}
    .custom-scrollbar::-webkit-scrollbar-thumb {
    background: oklch(0.55 0.15 15 / 0.2);
    border-radius: 10px;
}
    .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

      }`}</style>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-purpose="page-content">

    {/*  BEGIN: Breadcrumb and Title  */}
    <section className="mb-10" data-purpose="header-section">
        <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500 mb-4">
            <ol className="flex items-center space-x-2">
                <li><a className="hover:text-[oklch(0.55_0.15_15)]" href="#">Trang chủ</a></li>
                <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Blog</span>
                </li>
            </ol>
        </nav>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Blog Tiếng Nhật</h1>
        <p className="text-lg text-gray-600 max-w-2xl">Khám phá kinh nghiệm học tập, văn hóa Nhật Bản và cập nhật mới nhất từ đội ngũ giáo viên tại Torii Nihongo.</p>
    </section>
    {/*  END: Breadcrumb and Title  */}
    {/*  BEGIN: Search and Category Filter  */}
    <section className="mb-12" data-purpose="filter-bar">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/*  Search Input  */}
            <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
                <input className="w-full pl-10 pr-4 py-3 border-gray-200 rounded-xl focus:ring-[oklch(0.55_0.15_15)] focus:border-[oklch(0.55_0.15_15)] transition-all bg-white shadow-sm" placeholder="Tìm kiếm bài viết..." type="text"/>
            </div>
            {/*  Category Pills  */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full custom-scrollbar items-center">
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-[oklch(0.55_0.15_15)] text-white font-medium shadow-sm transition-all">Tất cả</button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-all shadow-sm">Ngữ pháp</button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-all shadow-sm">Từ vựng</button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-all shadow-sm">Văn hóa</button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-all shadow-sm">JLPT</button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-all shadow-sm">Phương pháp học</button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-all shadow-sm">AI Sensei</button>
            </div>
        </div>
    </section>
    {/*  END: Search and Category Filter  */}
    {/*  BEGIN: Featured Hero Section  */}
    <section className="mb-16" data-purpose="featured-hero">
        <div className="relative group overflow-hidden rounded-3xl bg-gray-900 aspect-[21/9] flex items-end">
            {/*  Hero Background  */}
            <img alt="Featured Article Background" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYyMJQq-JrWKEEImhP6aaawN9ELxcWmN36J6pUIKGvxoHGhUsvxF53FJ8nDznjKceMOgWyXGPcw_VkGtw1eWsrA1mC9lXwKJ4_ogwKrFL53N2BHFSolC5E7PqXA819ntMddMpbvvqo66_uJke8ntkAIAbPyLvWbLxvz4cYf9AnjherdxJi_RfHmrVdM5DtA9_7Iv41c0GYr6aVzfJV6h1LqDcg-woLD-wDOTklM2ubLAtYWJAGoBQl3mVgE4gtdKjH58CSpO6tI1M"/>
            {/*  Gradient Overlay  */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="relative p-6 md:p-12 w-full lg:w-3/4">
                <span className="inline-block px-3 py-1 bg-[oklch(0.55_0.15_15)] text-white text-xs font-bold uppercase tracking-wider rounded-md mb-4">Tiêu điểm</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">Lộ trình học tiếng Nhật từ N5 lên N2 trong vòng 1 năm</h2>
                <p className="text-gray-300 text-lg mb-6 line-clamp-2">Làm thế nào để chinh phục JLPT N2 hiệu quả? Khám phá phương pháp học được đúc kết từ hàng nghìn học viên tại Torii...</p>
                <div className="flex flex-wrap items-center gap-6 text-white text-sm mb-8">
                    <div className="flex items-center gap-3">
                        <img alt="Author" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-qQPq0Ko61AxhXUr1PzTvsG5Y4CPNe5Mo7VoqwjhO3kGCz3ciQVBN9CrqKeCDvZZjafMGhsN9EyjM-YUeOxVA_HDcbAUZUtjQ9pijTLNNnXiPQNShAaAgHuej-e-wSMfw5Dnev--mKrKmBKrCOI2-fwg-gUx1YwTwsSEmUVJOdb46fCGoD2_PSzbwm37hxauUyK3aWZ6RTDdhFf-y95ngu0UV5WgOhdxPaiN5JB6qSgo1lt8C2q6pIlbhqiSAB0sRgnWWcJ4zbkc"/>
                        <span className="font-medium">Admin Torii</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>12 Tháng 10, 2023</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>15 phút đọc</span>
                    </div>
                </div>
                <button className="bg-white text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-[oklch(0.55_0.15_15)] hover:text-white transition-all transform active:scale-95">Đọc bài viết</button>
            </div>
        </div>
    </section>
    {/*  END: Featured Hero Section  */}
    <div className="flex flex-col lg:flex-row gap-12" data-purpose="main-layout-grid">
        {/*  BEGIN: Sidebar (Left)  */}
        <aside className="w-full lg:w-1/4 space-y-10" data-purpose="sidebar">
            {/*  Categories List  */}
            <div>
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[oklch(0.55_0.15_15)] rounded-full"></span>
                    Chủ đề
                </h3>
                <ul className="space-y-2">
                    <li>
                        <a className="flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group" href="#">
                            <span className="flex items-center gap-3 text-gray-600 group-hover:text-[oklch(0.55_0.15_15)]">📚 <span>Ngữ pháp</span></span>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">24</span>
                        </a>
                    </li>
                    <li>
                        <a className="flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group" href="#">
                            <span className="flex items-center gap-3 text-gray-600 group-hover:text-[oklch(0.55_0.15_15)]">🎌 <span>Văn hóa</span></span>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">18</span>
                        </a>
                    </li>
                    <li>
                        <a className="flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group" href="#">
                            <span className="flex items-center gap-3 text-gray-600 group-hover:text-[oklch(0.55_0.15_15)]">💡 <span>Phương pháp</span></span>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">12</span>
                        </a>
                    </li>
                </ul>
            </div>
            {/*  Recent Posts  */}
            <div>
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[oklch(0.55_0.15_15)] rounded-full"></span>
                    Bài viết mới
                </h3>
                <div className="space-y-6">
                    <div className="flex gap-4 group cursor-pointer">
                        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-200">
                            <img alt="Post thumb" className="w-full h-full object-cover group-hover:scale-110 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCX57g18QYF0B8xf4wNAhOThy_BrJKignXQGH9hvb1IzcyO4HEDcPwOPbkA-2xkMwKOxY5xkHA4kVp0SnklxMaU_tk-wSOX69IUVuCvuSgJlb2kEXRKh7KshAlrowEMWh03Yg2HG3k8DWpcdEvv5_L2x6gpWcZ51j7ntL9ElxDJ-yNuktalPUp1K7Gzegvzc0Cl1lgd010-JmNsPS-fOVL9STI_W7Tt_jP8-OWwDrz8J4DUGmZLkL1TYezTQLLq8gsVkVNYs1ELFz0"/>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-[oklch(0.55_0.15_15)] transition-colors">Cách dùng trợ từ 'WA' và 'GA'</h4>
                            <p className="text-xs text-gray-400 mt-2">10 phút trước</p>
                        </div>
                    </div>
                    <div className="flex gap-4 group cursor-pointer">
                        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-200">
                            <img alt="Post thumb" className="w-full h-full object-cover group-hover:scale-110 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLOBrTnl5P-Ga7SyX9GiVbuXChGnQXxIMHX_tCINzaDyUtu1c4EeGQue2nKq9vRZfUkG3cugIYX5jGV8j7cb4CKdcslEe8kuT9pIJxP7HwhW3Zcyd7n5eYA_Fg9VIpvrmgyAFtElMuCE2e32dIIhQDGobs582izkjPQ4ib8hWsuDBiEAtZN8r0c8PZ47rJ_tfQHoWXLKHnHhqeBAWF0i8KidM7nhv5ZWB9FzsNG2ORMMDfEXrNENH8NXh0NlYgns5baMUPIql60hg"/>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-[oklch(0.55_0.15_15)] transition-colors">10 câu chúc mừng năm mới ý nghĩa nhất</h4>
                            <p className="text-xs text-gray-400 mt-2">2 giờ trước</p>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Popular Tags  */}
            <div>
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[oklch(0.55_0.15_15)] rounded-full"></span>
                    Tags phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                    <a className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">#JLPTN3</a>
                    <a className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">#Kanji</a>
                    <a className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">#AppHocTiengNhat</a>
                    <a className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">#DuHocNhat</a>
                    <a className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">#AI</a>
                </div>
            </div>
        </aside>
        {/*  END: Sidebar  */}
        {/*  BEGIN: Main Grid Content (Right)  */}
        <section className="flex-1" data-purpose="article-grid-container">
            {/*  Toolbar  */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="text-sm text-gray-500">Hiển thị <span className="font-bold text-gray-900">1-12</span> của 48 bài viết</div>
                <div className="flex items-center gap-4">
                    <select className="text-sm border-gray-200 rounded-lg focus:ring-[oklch(0.55_0.15_15)] focus:border-[oklch(0.55_0.15_15)] py-1.5">
                        <option>Mới nhất</option>
                        <option>Xem nhiều nhất</option>
                        <option>Cũ nhất</option>
                    </select>
                    <div className="hidden sm:flex border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
                        <button className="p-1.5 bg-gray-100 rounded text-[oklch(0.55_0.15_15)]">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" fillRule="evenodd"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
            {/*  Article Grid  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/*  Article Card 1  */}
                <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="relative aspect-video overflow-hidden">
                        <img alt="Article Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXKWHAEbX0GZJcosRXtYOdSmBhFHI-TSeqfnyghGo7iAT_q_sE6SY_O-YZR5ihL3IJw2bYfwjsm8UwLskCWl-4eP3wn4Nv6Me8dqUZU1Ftpe3uH759U1IFufFnm9RNR_BI-Bhy3i0YAuJhyNupX7EbfrtI9dWeQmi6sruPNau_2P_ROFq8pU29h2PF_tshYHQIxp4o0qnatzPhX9N1BH5ycYZjweXQeK22KVG78vxptqnjO14PUL8ecbmYddr-VUquDIFO_6d6l7M"/>
                        <span className="absolute top-4 left-4 bg-[oklch(0.55_0.15_15)] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-lg">Ngữ pháp</span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-[oklch(0.55_0.15_15)] transition-colors leading-tight">Phân biệt các loại câu điều kiện TO, TARA, BA, NARA trong tiếng Nhật</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-6">Việc sử dụng sai các mẫu câu điều kiện là lỗi thường gặp của học viên N3, N4. Bài viết này sẽ giúp bạn...</p>
                        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                                <img alt="Avatar" className="w-8 h-8 rounded-full bg-gray-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmlT0LMyxIAugjtVEy53AZZz5QPrLEJk4GcYhEvrJ2trIpf3IRgmpuADwogKXQVjPsnDlOBDYNzb1h4lVecSTy3dCG9k_B9iz-MSByfbh2LNPjMhUF1bBQD_d-hsPYyQpQawDI2_aSGdTOgKz97NiWL3HHFh8d2qlS9HewecnirohjDlHtz5Xx2Yh5WzXBbQw5P1-60_sNDg2ixhC5GpBtRwGA65hKyQjQ74bToG9QdMWUX00KkR-7QsJjadbQQc45RrGq2m4f3a4"/>
                                <div className="text-[11px]">
                                    <p className="font-bold text-gray-900">Sakura Sensei</p>
                                    <p className="text-gray-400">18/10/2023</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100">
                                8 MIN READ
                            </div>
                        </div>
                    </div>
                </article>
                {/*  Article Card 2  */}
                <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="relative aspect-video overflow-hidden">
                        <img alt="Article Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoUbm6e8TnJDci9aBwDI2VHgjJhHzfu5qhVRAnXG2lb4og9qJcpWlxqybGHFuAoznnQxGxuGe8A3Wew0oipO5LLlfAaI-StRYF9cX3fbg0Ei7ExjI03x_ldx_NxUO65hNusPqCeh1P2HthI697KnSw-KBWgIyl4qpBGvVhhJjXlsKK7B9XMJ1b59kf7OmwSE1p4xd3CuXh8m50P9Ol3eSZEp7NqixAagsNfz_YW5LY0FFAb6Eu0JNG849oPaYF8hAil4J6wh-UpzY"/>
                        <span className="absolute top-4 left-4 bg-[oklch(0.55_0.15_15)] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-lg">Văn hóa</span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-[oklch(0.55_0.15_15)] transition-colors leading-tight">Tại sao người Nhật lại rất chuộng cúi chào (Ojigi)?</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-6">Khám phá ý nghĩa ẩn sau những cái cúi chào đầy tinh tế của người dân xứ sở mặt trời mọc...</p>
                        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                                <img alt="Avatar" className="w-8 h-8 rounded-full bg-gray-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBo_8ondY2sQJSMxybbXv_gznHbGAS6rlWsDtvXNaRNuqJWwkHjdj8O4rUlETErKO2tkxoTVJUEztBORC1ZyRrPhkWKWRTLyGYVLK56plIz5w0bLnoSBnObGX9m1Qr7G75Tw-0pvJQtfaujDo010FB53Z5QlahSfSnNNJABhnwJFE11LyhLD1k7C8OpXO_oGuiSKNOFo6hHGT39PYP96OuPc-zVV2Vw6TCUTDC1zN1pp8L2Cck4GJAEWOWW6R3jiPyr20PwJyCd1Qc"/>
                                <div className="text-[11px]">
                                    <p className="font-bold text-gray-900">Yuki Chan</p>
                                    <p className="text-gray-400">15/10/2023</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100">
                                5 MIN READ
                            </div>
                        </div>
                    </div>
                </article>
                {/*  Article Card 3  */}
                <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="relative aspect-video overflow-hidden">
                        <img alt="Article Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx1M5_FW9iLkqV4NCeZjSvIooP-llFyZCfMYuCLGvCeSfTNQLxFfeswsEMyJgB9hoAUB76dMoX3mBMlHsRqvdYxQn2r7fzwza5YgHTwBvHpC8cge0B88TbZB-jK_kPcvbS1ScT0StWDgFT5_U2L8msxYCoLJ4sed9AIKXB2CSLG84IiNAYpfbjOTyLXdDqvS4lcdYjdWvgnZ8V_4HXNbAmIBFJYq6eBzG7fUcEJ4Q7gDaiaxVMS0PVk2H4csOJ1GiLMk3o3fveLDI"/>
                        <span className="absolute top-4 left-4 bg-[oklch(0.55_0.15_15)] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-lg">AI SENSEI</span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-[oklch(0.55_0.15_15)] transition-colors leading-tight">Ứng dụng ChatGPT để luyện viết tiếng Nhật mỗi ngày</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-6">Kỹ thuật sử dụng prompt để biến AI thành một người giáo viên hướng dẫn viết văn chuyên nghiệp...</p>
                        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                                <img alt="Avatar" className="w-8 h-8 rounded-full bg-gray-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4rMMoYe1s56IYWxhLFFKk6-DH8UaCYYLEBworZVZiyUWGN1QoHrEMUfO8eIQjhQoH8c35DwHdoCWpK17-k90iEhb-sxDcVMaZPzNUpVU4J3U9af6L1wnBMIqzU6QfY1hJE4ND4bJRwPdeMeHZaFHPyIoARygqCg7ciuZjKEPwkYBFaI4p3-0Wjbi1hasOyetWxTYvTTBVIDCjcK4a09FtY2cGrDKImNgkmnekBxeGNFS_uZ75lmA7jSmRAVWY_Z1Lxrf9GWkvd3c"/>
                                <div className="text-[11px]">
                                    <p className="font-bold text-gray-900">Kenji IT</p>
                                    <p className="text-gray-400">10/10/2023</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100">
                                12 MIN READ
                            </div>
                        </div>
                    </div>
                </article>
                {/*  Article Card 4  */}
                <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="relative aspect-video overflow-hidden">
                        <img alt="Article Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsLKAAKWl0kk48spX5AK4-njClqC10G_5glkbM-P-tsg4zQWSNJAvCgut4yLP87d7ub7fJwjW8G88eArCJgszOGAO48C2fY-zMKihpZlQ4kyJTsojqj3mDrC6NiPF_o15QfVALBqxuWkI3u9lBFp3l1vRKiYh4ofU1eLGubEZHfTJHCtfEts3FwGg09F6vEuEsG3pftCxfuBdysmanfRD50jYWWyC5L8MVgXxjPb1-lOFTnrnckPYj9aTOWyG5zW1pZXQliZHVwlk"/>
                        <span className="absolute top-4 left-4 bg-[oklch(0.55_0.15_15)] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-lg">JLPT</span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-[oklch(0.55_0.15_15)] transition-colors leading-tight">Trọn bộ 200 từ vựng Kanji chắc chắn ra trong đề thi N2</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-6">Tải ngay danh sách từ vựng trọng tâm cùng ví dụ minh họa chi tiết để đạt điểm cao phần ngôn ngữ...</p>
                        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                                <img alt="Avatar" className="w-8 h-8 rounded-full bg-gray-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9Q9JD4HsFjy8fUWXkQobBZmWgi-0frpu356iDlGziyoNCy7TMCy0sPE56oFCnLAikFgJWBrCOjeXc84oycPeu3zgSTRpU7dklXQdLoXfNTxWfjSOJqJ1zHoWJhEZWXKatBButaok4WzpYzKyewnzEHljAh5Av-a4-v9Z2EoJE1QlFCxEMqsB6AeK8n4AbI2MY8f0J5YlO8Atd7FlfIGpNx7rs0hA-UobApQY63033YzNi4fveqYg4TNbNCYsGah3-UvV5cGNOWak"/>
                                <div className="text-[11px]">
                                    <p className="font-bold text-gray-900">Admin Torii</p>
                                    <p className="text-gray-400">08/10/2023</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100">
                                20 MIN READ
                            </div>
                        </div>
                    </div>
                </article>
            </div>
            {/*  BEGIN: Pagination  */}
            <nav aria-label="Pagination" className="flex justify-center items-center space-x-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[oklch(0.55_0.15_15)] text-white font-bold">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium">3</button>
                <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium">10</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </button>
            </nav>
            {/*  END: Pagination  */}
        </section>
        {/*  END: Main Grid Content  */}
    </div>
    {/*  BEGIN: Newsletter Banner  */}
    <section className="mt-20" data-purpose="newsletter">
        <div className="bg-[oklch(0.55_0.15_15)] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            {/*  Decorative Circle  */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full"></div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="max-w-xl text-center lg:text-left">
                    <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Đừng bỏ lỡ các tài liệu học tập mới nhất!</h2>
                    <p className="text-white/80 text-lg">Đăng ký nhận bản tin hàng tuần với đầy đủ kiến thức bổ ích được gửi trực tiếp vào hòm thư của bạn.</p>
                </div>
                <form className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
                    <input className="bg-white px-6 py-4 rounded-xl border-none focus:ring-2 focus:ring-white/50 w-full sm:w-80 text-gray-900 placeholder:text-gray-400" placeholder="Email của bạn..." type="email"/>
                    <button className="bg-gray-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-black transition-all active:scale-95 whitespace-nowrap" type="submit">Đăng ký ngay</button>
                </form>
            </div>
        </div>
    </section>
    {/*  END: Newsletter Banner  */}

      </main>
    </div>
  );
}
