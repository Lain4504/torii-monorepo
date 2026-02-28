'use client';

import React from 'react';

export function CoursesClient() {
  return (
    <>
      <style>{`
        .shadcn-card {
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          transition: all 0.2s ease;
        }
        .shadcn-card:hover {
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .sticky-sidebar {
          height: calc(100vh - 2rem);
          top: 1rem;
        }
      `}</style>

      <div className="bg-gray-50 text-slate-900 font-sans">

{/*  BEGIN: MainHeader  */}
<header className="bg-white border-b border-gray-200 pt-8 pb-6 mb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*  Breadcrumbs  */}
        <nav aria-label="Breadcrumb" className="flex mb-4 text-sm text-gray-500">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <a className="hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Trang chủ</a>
                </li>
                <li>
                    <div className="flex items-center">
                        <svg aria-hidden="true" className="w-3 h-3 mx-1 text-gray-400" fill="none" viewBox="0 0 6 10" xmlns="http://www.w3.org/2000/svg">
                            <path d="m1 9 4-4-4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span className="ml-1 md:ml-2 font-medium text-gray-700">Khóa học</span>
                    </div>
                </li>
            </ol>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Danh Mục Khóa Học</h1>
        {/*  Search Section  */}
        <div className="relative max-w-2xl mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
            </div>
            <input className="block w-full pl-12 pr-4 py-4 border-gray-200 rounded-xl focus:ring-[oklch(0.55_0.15_15)] focus:border-[oklch(0.55_0.15_15)] shadow-sm text-lg" placeholder="Tìm kiếm khóa học..." type="text"/>
        </div>
        {/*  Quick Filters  */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            <button className="px-4 py-1.5 rounded-full bg-[oklch(0.55_0.15_15)] text-white text-sm font-medium">Tất cả</button>
            <button className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors">N5</button>
            <button className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors">N4</button>
            <button className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors">N3</button>
            <button className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors">N2</button>
            <button className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors">N1</button>
            <button className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:border-[oklch(0.55_0.15_15)] hover:text-[oklch(0.55_0.15_15)] transition-colors">Miễn phí</button>
        </div>
    </div>
</header>
{/*  END: MainHeader  */}
{/*  BEGIN: MainContent  */}
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
    <div className="flex flex-col lg:flex-row gap-8">
        {/*  BEGIN: Sidebar Filters  */}
        <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky-sidebar space-y-8 lg:overflow-y-auto pr-2">
                {/*  JLPT Toggle Buttons  */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Trình độ JLPT</h3>
                    <div className="grid grid-cols-5 gap-2">
                        <button className="h-10 rounded border-2 border-[#3b82f6] text-[#3b82f6] font-bold hover:bg-[#3b82f6] hover:text-white transition-colors" title="N5">N5</button>
                        <button className="h-10 rounded border-2 border-[#14b8a6] text-[#14b8a6] font-bold hover:bg-[#14b8a6] hover:text-white transition-colors" title="N4">N4</button>
                        <button className="h-10 rounded border-2 border-[#22c55e] text-[#22c55e] font-bold hover:bg-[#22c55e] hover:text-white transition-colors" title="N3">N3</button>
                        <button className="h-10 rounded border-2 border-[#f59e0b] text-[#f59e0b] font-bold hover:bg-[#f59e0b] hover:text-white transition-colors" title="N2">N2</button>
                        <button className="h-10 rounded border-2 border-[#f43f5e] text-[#f43f5e] font-bold hover:bg-[#f43f5e] hover:text-white transition-colors" title="N1">N1</button>
                    </div>
                </div>
                {/*  Price Filter  */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Học phí</h3>
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button className="flex-1 py-1.5 text-sm font-medium bg-white rounded-md shadow-sm">Tất cả</button>
                        <button className="flex-1 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">Miễn phí</button>
                        <button className="flex-1 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">Có phí</button>
                    </div>
                </div>
                {/*  Topic Tags  */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Chủ đề</h3>
                    <div className="space-y-3">
                        <label className="flex items-center group cursor-pointer">
                            <input className="w-4 h-4 rounded border-gray-300 text-[oklch(0.55_0.15_15)] focus:ring-[oklch(0.55_0.15_15)]" type="checkbox"/>
                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">Hội thoại thực tế</span>
                        </label>
                        <label className="flex items-center group cursor-pointer">
                            <input className="w-4 h-4 rounded border-gray-300 text-[oklch(0.55_0.15_15)] focus:ring-[oklch(0.55_0.15_15)]" type="checkbox"/>
                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">Ngữ pháp chuyên sâu</span>
                        </label>
                        <label className="flex items-center group cursor-pointer">
                            <input className="w-4 h-4 rounded border-gray-300 text-[oklch(0.55_0.15_15)] focus:ring-[oklch(0.55_0.15_15)]" type="checkbox"/>
                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">Hán tự (Kanji)</span>
                        </label>
                        <label className="flex items-center group cursor-pointer">
                            <input className="w-4 h-4 rounded border-gray-300 text-[oklch(0.55_0.15_15)] focus:ring-[oklch(0.55_0.15_15)]" type="checkbox"/>
                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">Luyện thi Kaiwa</span>
                        </label>
                        <label className="flex items-center group cursor-pointer">
                            <input className="w-4 h-4 rounded border-gray-300 text-[oklch(0.55_0.15_15)] focus:ring-[oklch(0.55_0.15_15)]" type="checkbox"/>
                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">Tiếng Nhật công sở</span>
                        </label>
                    </div>
                </div>
                {/*  Reset Filter  */}
                <div className="pt-4 border-t border-gray-100">
                    <button className="text-sm font-medium text-[oklch(0.55_0.15_15)] hover:underline flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        Xóa tất cả
                    </button>
                </div>
            </div>
        </aside>
        {/*  END: Sidebar Filters  */}
        {/*  BEGIN: Course Grid Content  */}
        <section className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/*  Course Card 1  */}
                <article className="shadcn-card bg-white rounded-2xl overflow-hidden flex flex-col" data-purpose="course-card">
                    <div className="relative aspect-video bg-gray-200">
                        <img alt="Course Thumbnail" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT5bL-52hjnYamvPUlzoffVuKeLq8P5Ft7xB0sH0SdXUUhdw-WMJ5rwFlqzL4NbB4GPc-eS9XChYJNnwc6qNL-dX8quNMCFxX_zFPo1l1FURk_qSgonkRXnDITNJ7USLcsI1kadmLzKQ1t_MZWRxrmd7G2SOKDwlcEMwT9utj0fk8J3rdyYeqKqZD-msGfxNWpeMVTuiplkiXwt2UmsPsnkpyFO5fXPSpIRb7FrF_LSiuBtuP1aC4uozJfZv4MT3OJxq3fhfPFuNg"/>
                        {/*  Badges  */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-[#3b82f6] text-white text-[10px] font-bold rounded uppercase">N5</span>
                            <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded uppercase">Miễn phí</span>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">Lộ trình chinh phục N5 cấp tốc cho người mới bắt đầu</h2>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">Học tiếng Nhật từ con số 0 với phương pháp Torii, giúp bạn nắm vững 2 bảng chữ cái chỉ trong 1 tuần...</p>
                        <div className="mt-auto">
                            <div className="flex items-center mb-4">
                                <img alt="Instructor" className="w-8 h-8 rounded-full border border-gray-100 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAO7-tVjr1jxVe9YiA9gejqYTg8yruQUp6RLd39f7fEmqPHGh3RDL-WfceI06YmxzaCjkGawdCl2A7qMt7m7cbA1T2dsVlUDkcviUFOSMnMrTwDg6r64WwMQkN648HhEIFl0OanuaG4iMjUsw0_KdLy4p5FTEV3A28Veaaggjs7sqtapjfwjQENQk56jcmW_67G3dM1Na4vDCj43L8Bz7rhQEVQdC76NSgwj1zATbBilMbAlXP-mYJQGuW85rtAPIZbH3qPXFLWygA"/>
                                <span className="text-xs font-medium text-gray-700">Akira Sensei</span>
                                <div className="ml-auto flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <span className="ml-1 text-xs font-bold">4.9</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-[oklch(0.55_0.15_15)]">Miễn phí</span>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
                {/*  Course Card 2  */}
                <article className="shadcn-card bg-white rounded-2xl overflow-hidden flex flex-col" data-purpose="course-card">
                    <div className="relative aspect-video bg-gray-200">
                        <img alt="Course Thumbnail" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1sUMRBjDrCYlu8BAtKNze0Yy0211cuFGqenC0DLIo3B389QI2PZIYXMo9XGAOwaQ5-ds-eo6Y3YLcomyR3fOsUF8BKVm1QPkzS-8jPu6XufBF55qcCt7aIrgSDSooGIyw90xT5WObgzbXK1odPGY_Zqp-0XcB2EI5uyfEaIzM9nitE4ePx5AR3udlSp_wDDt5jwSyn3ZrHNnKLj-LuZssXIlh5R9UrriaqEpJw3VPJzKDndwBtD-df6_0OGZUkx3Ddpc5zCRl8wY"/>
                        {/*  Badges  */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-[#22c55e] text-white text-[10px] font-bold rounded uppercase">N3</span>
                            <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase flex items-center">
<span className="w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse"></span> LIVE
                </span>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">Luyện nói tiếng Nhật N3: Phản xạ tự nhiên &amp; Phát âm chuẩn</h2>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">Khóa học tập trung vào kỹ năng nghe nói thực tế trong môi trường công ty Nhật Bản...</p>
                        <div className="mt-auto">
                            <div className="flex items-center mb-4">
                                <img alt="Instructor" className="w-8 h-8 rounded-full border border-gray-100 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSrPzZg_QsfdWBEqH6yiLzL9jebfV_agXzgYS6SqSjECqIYfi4vraFUwfGsBSuCg_vNkDl1eeIbSGDDiuJW7f6vSkonh4_YIza7RhRV75-42QW-9YnlaopnzPM_ZJdunZQAwn9klr8cEyzEH9cX8zPSa38Jpfe-vmD5_L15-zvvZbej16Ty8expqmyHwomZRTiL6y4ay_frMk_MllBrGEXwnGAl5VwiIW-1OC8COtcGMRowHPlKNlwDNB81rPEuuKJsF4GWnQJKmI"/>
                                <span className="text-xs font-medium text-gray-700">Yuki Nakamura</span>
                                <div className="ml-auto flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <span className="ml-1 text-xs font-bold">5.0</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-[oklch(0.55_0.15_15)]">1.250.000 ₫</span>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
                {/*  Course Card 3  */}
                <article className="shadcn-card bg-white rounded-2xl overflow-hidden flex flex-col" data-purpose="course-card">
                    <div className="relative aspect-video bg-gray-200">
                        <img alt="Course Thumbnail" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ_rBUXXSVMbpWWH2E6yiVFkTk-wT28fxjACHVNCbW-c7TvLi_3wB_V3zobuUHLg-6JGHJvqx6RWWi3lMxxsEg-U-nldNa1Z8kgJ8T7hDdq85e-2mBgqQVrcda8oqC0_8eCVMpFQcu5S3T46e61YqrcEwgGGxKKFDuOjkReCsK3o6C4GEA86S54rSch64VwFgy3-t97pHZ-g1v-es3kfmfNmj4YXwxzWaXD1kmRiy4PwehxcPjYPwO4MZrrjRGY-X9zMzUVieswIo"/>
                        {/*  Badges  */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-[#f59e0b] text-white text-[10px] font-bold rounded uppercase">N2</span>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">Tuyệt chiêu ghi nhớ 1000 chữ Hán N2 qua câu chuyện</h2>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">Giải mã Kanji không còn là nỗi ác mộng. Phương pháp liên tưởng độc đáo giúp nhớ lâu...</p>
                        <div className="mt-auto">
                            <div className="flex items-center mb-4">
                                <img alt="Instructor" className="w-8 h-8 rounded-full border border-gray-100 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIwbrUKI9Y8TVvwdUfwINxRMaZ0cRo2HhQ23moHgsb5kyJ2J-NhuM9HBipMP6foKjEicvzRSsLBcUcrRixQy30z3fpmdXTW_eHt4W3KGu1_t77tXlzRilwYO_fbV_7TVORqkRDXVyb1fqmLPkoVbRV8_7a2w-oNb-Xa5IeWcesqzAhPn8SK-rF_-U6fkj9rJvFXx1tKc98iOtS5vQgm5uPcSfvOs8uqDuCBY2xLehw30jG4cNgUJ81VD9n2DxReSLzFTM9d9Fp_4k"/>
                                <span className="text-xs font-medium text-gray-700">Thanh Hoa Sensei</span>
                                <div className="ml-auto flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <span className="ml-1 text-xs font-bold">4.8</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-[oklch(0.55_0.15_15)]">850.000 ₫</span>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
                {/*  Course Card 4  */}
                <article className="shadcn-card bg-white rounded-2xl overflow-hidden flex flex-col" data-purpose="course-card">
                    <div className="relative aspect-video bg-gray-200">
                        <img alt="Course Thumbnail" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo_czlpm8zHIGmAthLwMEzNo1v0jiLcguAwuf2mkwF3jRHvgjjyqrwnOdm8RDR6hgQd9_lvxW6vmToXVtAFG35jS6GiSQ3QN8UY8kvSrieggdG3wF2x8psbTjcfL9QuJWWNuXU3ASjo5OmaENm1R5RD1ps7iotE6afK5a8JHQmL6Wd7ZLx50qqQuPn-gk0HShk83x2uOEybT_j3tSt4cKiXHTSz-1cjVM9Ta5L5Bsy2rHhBC_Hj0LMNQMxHVaTSaJe7FFcYE4gvMs"/>
                        {/*  Badges  */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-[#f43f5e] text-white text-[10px] font-bold rounded uppercase">N1</span>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">Khóa học JLPT N1 - Thành thạo như người bản xứ</h2>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">Dành cho những ai muốn chinh phục trình độ cao nhất, đọc hiểu báo chí và tài liệu chuyên ngành...</p>
                        <div className="mt-auto">
                            <div className="flex items-center mb-4">
                                <img alt="Instructor" className="w-8 h-8 rounded-full border border-gray-100 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_QvbjLtTBJccWQfaJ_oqR2uesngUC0FFoefD705DXkejeuhNmv1RPpsusPZb3_s-JxvjRjy9ST0NgCx7dEzQ7Svqa1nsIPrT9f3N9LEjMebwTM1NZZItb2U5K0G0ySnvBgdYEy00vubvzjg1IJXkSpt6f1oYziUw8-Hu2GSJTQZ4NCl6M7Viy-PEm7PFzj5HDKZRl_Orvh2tuIp5Zm9qs_r7yHwQ_Y0wMsv3eC7n5pTndWPtEU4bt0XaiAnkUhU5A9wi3j4Gv6_k"/>
                                <span className="text-xs font-medium text-gray-700">Kenji Tanaka</span>
                                <div className="ml-auto flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <span className="ml-1 text-xs font-bold">4.7</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-[oklch(0.55_0.15_15)]">2.100.000 ₫</span>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
                {/*  Course Card 5  */}
                <article className="shadcn-card bg-white rounded-2xl overflow-hidden flex flex-col" data-purpose="course-card">
                    <div className="relative aspect-video bg-gray-200">
                        <img alt="Course Thumbnail" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKD5vzDHE60O_gzzxIPkTX-84uG2K12wPrEXNEob0Ax12rwtIUCnb0ns8kbVuAQOFuTP-ulPFmpL5nw8Y_watwFoS-z-p56Qnbj5NZ8pM7cik1msYQ7fpOyF5wnqjL6jROXVf3MqytUYb-qKqKJa_sKlj4Ayzd7HJ471KARK6RsDIX1oDN2SsYmxFfDIryQQ7XAdq-yIv2rhtRVNN1hwNhE9w4uZL-bfQzxZ6V__prXt8kPHxHD-f7pKQBAUa1VkfqvWa_pf4vuoA"/>
                        {/*  Badges  */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-[#14b8a6] text-white text-[10px] font-bold rounded uppercase">N4</span>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">Nâng tầm tiếng Nhật sơ cấp N4 cùng giảng viên Bản xứ</h2>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">Tiếp nối hành trình sau N5, củng cố ngữ pháp trung cấp và mở rộng vốn từ vựng thông dụng...</p>
                        <div className="mt-auto">
                            <div className="flex items-center mb-4">
                                <img alt="Instructor" className="w-8 h-8 rounded-full border border-gray-100 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjCKrDcaOQr7xXxXZWHJbfim-ZlNbLUJgTSwqOPKmTPaYAUMjYP10NPev5ylPw0ziHh258g0QBj--mOcd-Au-IOgjnLDUH1JlG8JyABMTdlQ3EOIyqfI5lkOVtXksFZk1sXY7vbn0qn-6SgjWItmAu4mBIvdfGTzYMB_AubL8f0AXzkiaERq1re37cZ5yazDP_JvVqXLcV-sAWEyfAOPsLsmCZR5AbmiMTFjRREJICVUfzM_MLOPnCw1V7FnsGwwlmLw4hVyGm1mk"/>
                                <span className="text-xs font-medium text-gray-700">Mio Saito</span>
                                <div className="ml-auto flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <span className="ml-1 text-xs font-bold">4.9</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-[oklch(0.55_0.15_15)]">1.100.000 ₫</span>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
                {/*  Course Card 6  */}
                <article className="shadcn-card bg-white rounded-2xl overflow-hidden flex flex-col" data-purpose="course-card">
                    <div className="relative aspect-video bg-gray-200">
                        <img alt="Course Thumbnail" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5gO3l_3xMMgPAkp3O6cro5D76sjGDdihJCDCN1rjPR2pNWxbj4h_hcRZZgW-F-0NHtlSkiitaEQJnTmWIRGIkZsIMZuq2sRupwTF0cm7f22mUkHy1kNWwex7v9mD5XM-j_Ll2PekhbR90ZS3HKH6PCLYcTeBcRuE7yXI28G0mK-LoAlG20c2S5zitUllAMAlsxeujx6IR8jckE8ju0PQbSt3WA-h9Xf8cNX1nBHDPdIytmanp3jPFMjy4vWKYhdItzoxM2SQkjF0"/>
                        {/*  Badges  */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-[#22c55e] text-white text-[10px] font-bold rounded uppercase">N3</span>
                        </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">Tổng ôn kiến thức &amp; Giải đề JLPT N3 thực tế</h2>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">Cung cấp các bộ đề thi thử sát với thực tế, hướng dẫn mẹo làm bài và phân bổ thời gian...</p>
                        <div className="mt-auto">
                            <div className="flex items-center mb-4">
                                <img alt="Instructor" className="w-8 h-8 rounded-full border border-gray-100 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUs6oPPsgEIvDf9sQve34BLF0c_z0sxBIZ6z1Svu6NMueCcTolGACK0lA-VVTo0iPixsdeMFvcMVCD4poM9nAv8hzg_lPXWzJSLa0p1zoVvyfdnXGnXyhLG0dLCXekfNyV95fsI_X_FxCCpGbrGDzusTrFuAkaE8NJWj64ld3xuNeL-QXLo0wARAmBtMZGVeohvIk5QJys9Yq6BfNzTU3i6e_bM7r0OqLa9YeRkyLjwZQXrTR9obGm274VaT7hzZRkC6N25Iy0Uxw"/>
                                <span className="text-xs font-medium text-gray-700">Akira Sensei</span>
                                <div className="ml-auto flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    <span className="ml-1 text-xs font-bold">4.6</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-[oklch(0.55_0.15_15)]">950.000 ₫</span>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
            {/*  BEGIN: Pagination  */}
            <nav aria-label="Pagination" className="flex justify-center mt-12 mb-8">
                <div className="inline-flex items-center p-1 bg-white border border-gray-200 rounded-full shadow-sm gap-1">
                    <a className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Trước</a>
                    <a className="w-10 h-10 flex items-center justify-center rounded-full bg-[oklch(0.55_0.15_15)] text-white text-sm font-bold shadow-md" href="#">1</a>
                    <a className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors" href="#">2</a>
                    <a className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors" href="#">3</a>
                    <span className="px-2 text-gray-400">...</span>
                    <a className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors" href="#">8</a>
                    <a className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-[oklch(0.55_0.15_15)] transition-colors" href="#">Tiếp</a>
                </div>
            </nav>
            {/*  END: Pagination  */}
        </section>
        {/*  END: Course Grid Content  */}
    </div>
</main>
{/*  END: MainContent  */}

      </div>
    </>
  );
}
