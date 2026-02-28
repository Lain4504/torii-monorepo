export const metadata = {
  title: 'Khóa học Live WebRTC N5 2026 - Torii Learning',
};

export default function LiveClassDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="bg-slate-50 font-sans text-slate-900">
      <style>{`@keyframes pulse-red {
    0%, 100% {
    opacity: 1;
    transform: scale(1);
} 50% {
    opacity: 0.7;
    transform: scale(1.05);
}
}
    .animate-live-pulse {
        animation: pulse-red 2s infinite
    }
    .japanese-pattern {
        background-color: #1e1b4b;
        background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuD2rDhTyQh-on6YpiRryocFmj_bIDKy5qUcl4ZvcMVVF-PdjZbcNcEF4LyAmzX8v4sBV1TXhLh_lX049leVAsu72ZZ3Owla7AcGP6LoEQj0140qnHdFV5W9bHubr1MdV_Fl4AtTssiJIVmrtfWFGE5Qx-WrozGdEm0ctGB6r59-IUpelrbJ0Eoe3rX4VMJ6Y5rnikoRqOlTQLVa2NHf0x-7M4tFgorGimkjVc_8cHHOM4l8CXHq4eszIqFrUas1O86GZixDE7Br1BI)
    }`}</style>

      
<section className="bg-slate-900 text-white pt-12 pb-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-black opacity-90"></div>
    <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/*  Breadcrumbs  */}
        <nav aria-label="Breadcrumb" className="flex mb-8 text-sm text-slate-400">
            <ol className="flex items-center space-x-2">
                <li><a className="hover:text-white transition" href="#">Trang chủ</a></li>
                <li><span className="mx-2">/</span></li>
                <li><a className="hover:text-white transition" href="#">Lớp học</a></li>
                <li><span className="mx-2">/</span></li>
                <li className="text-slate-200 font-medium">Khóa học Live WebRTC N5 2026</li>
            </ol>
        </nav>
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
                {/*  Badges  */}
                <div className="flex items-center gap-3 mb-6">
<span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 animate-live-pulse">
<span className="w-1.5 h-1.5 bg-white rounded-full"></span> 🔴 ĐANG LIVE
            </span>
                    <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              JLPT N5
            </span>
                </div>
                {/*  Title & Meta  */}
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                    Khóa học Live WebRTC N5 2026: <br/> Chinh phục tiếng Nhật từ con số 0
                </h1>
                <p className="text-xl text-slate-300 mb-8 max-w-3xl">
                    Lộ trình bài bản giúp bạn nắm vững bảng chữ cái, ngữ pháp cơ bản và giao tiếp tự tin thông qua nền tảng học trực tuyến thời gian thực WebRTC độc quyền.
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm mb-10">
                    <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold text-lg">4.8</span>
                        <div className="flex text-amber-500">
                            {/*  SVG Stars  */}
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <svg className="w-4 h-4 fill-slate-600" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        </div>
                        <span className="text-slate-400 underline">(120 đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        <span>1,200 học viên</span>
                    </div>
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
                        <img alt="Kenji Sato" className="w-8 h-8 rounded-full border border-indigo-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARyje7l67Zv_K3l8-siWVmP06uK9_evRWovOtGqxCzJc2ta5VM1f3rtioRDTHBXQmOtfhsBYJC8OUaEd_RDDAn3TDoOdIUQReld18M6gzkAanim1jN0gPrDdUAfGHQDmd8Dnbnfy8tGKWOLG3CiP4y1n2Z5Lwy5p8BBe2fXKU9GGcHExdPBjvbzZoE43mwHYQjPtpGxVVWOJldeyLE-nE17F4KSi7ZPDr11-bvaIzRSf5iOPO1x_qNGkg3nW3GTr-dNSfHAEX9MdM"/>
                        <span className="text-slate-200">Giảng viên: <span className="font-semibold text-white">Kenji Sato</span></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
{/*  END: HeroSection  */}
{/*  BEGIN: SocialProofBanner  */}
<div className="bg-indigo-50 border-y border-indigo-100 py-3">
    <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
        <div className="flex -space-x-2">
            <img alt="User 1" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNG-r9qHhLwxBd-6XHb0-a14rizi_S-Lz0qRUZhPZY0iGUv0F3Gjfnr5D6CLWemxaYyukZVKwb_Mw12XtkLonZtfKXfxMttb-VXepnpW62xf3uYytObss9DwpGYcwHULe02eWoVBoleG4X6zrEuwWoDm6OAyE1VRxUysmbUl2452Vle3wITDQnUUc7gK0jZtglotVDw2A_U1o-KxApJsJ0OKpyEb5OOFioCG2DiMHB2MsTc_7en3pBvlQFAP3_Iewa7nlFcYwLdT4"/>
            <img alt="User 2" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXvk3kuD8AD1NnAQp86X9Yhh_y_rk2ki-6jqYnp9OvnidteJfyHD82eJQel7Rx1k1IbMTkHMG5ENGu_NVRpbwvybK6LFsh739R3AC6IA7BPYB2wws2uYKWnbn4V2Yk9vW9XWsH5IVV33dsq6jaizHCLrxb9GceYv0a4YscW792n9eQ7_j4t2pYVhBfsws685QvbyAGoF8YbsZoVbXJ50KsXqAWo1CfhYTkBp2JyblGpmDLSuClKbncFInda8Bj52rEErDUu0QCPHE"/>
            <img alt="User 3" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaTfaf5sg8EadRf2GBhow_-P7vEkVP3Rka1yCk5gbDvxp0vOtFOGpuosWNiu8oyzpffr8xI7cUAiIlo0a1buB7l5reOaOMDttmA8JXxcbmum-r0odVZcu_HfuubSEhLzAi2XLFakk5ZSm3T6TtpokkKP7HmIHtUdcNbfPYiS5eF2dXjvwhc602ZVk3sTVdHQaTJsYZn915wXuqZ7XGO73NoW3iCA41_w1-lqQLfw-RSx7PgqqBCCxC77anv4a61s2qLN8IVbsXWts"/>
            <img alt="User 4" className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCE1LB37UGFf0oYcIh1hpU__SEfR0Q17O54rmGK68zX_ZTEXj2cU5elPlGc2oHJcosqZFemivcdDo9pXFGqvK_eJJkiVks_1Bz5GmXqeGUW0xgTUkhQTwR3jKepcuMOI6agIVddz8pmNqbrLwbBQqX9O9R4KuqBdHD-py9KHVs-GRooKTgNAt0oNIPCMBDqpzPfKiXB-cLzzrmDZqhc5UbhZ-4MBHgwkh1YFbXEJsFnBTVDQWeQ0-UPQk6SfOnESBjDCB9B2OTSyc"/>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">+81</div>
        </div>
        <p className="text-sm font-semibold text-indigo-900">Đã có 85 học viên đăng ký trong tuần này</p>
    </div>
</div>
{/*  END: SocialProofBanner  */}
{/*  BEGIN: MainContent  */}
<main className="max-w-7xl mx-auto px-6 py-12">
    <div className="grid grid-cols-12 gap-12">
        {/*  Left Column  */}
        <div className="col-span-12 lg:col-span-8">
            {/*  BEGIN: Benefits  */}
            <section className="mb-16" data-purpose="benefits">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Bạn sẽ học được gì?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border-l-4 border-emerald-500 shadow-sm flex items-start gap-4">
                        <div className="text-emerald-500 mt-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path></svg>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">Nắm vững 800 từ vựng và 100 chữ Kanji cơ bản cấp độ N5.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-l-4 border-emerald-500 shadow-sm flex items-start gap-4">
                        <div className="text-emerald-500 mt-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path></svg>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">Làm chủ các cấu trúc ngữ pháp quan trọng nhất trong JLPT.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-l-4 border-emerald-500 shadow-sm flex items-start gap-4">
                        <div className="text-emerald-500 mt-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path></svg>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">Kỹ năng nghe hiểu hội thoại cơ bản hàng ngày của người Nhật.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-l-4 border-emerald-500 shadow-sm flex items-start gap-4">
                        <div className="text-emerald-500 mt-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path></svg>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">Phương pháp thi JLPT hiệu quả và các mẹo làm bài điểm cao.</p>
                    </div>
                </div>
            </section>
            {/*  END: Benefits  */}
            {/*  BEGIN: Schedule  */}
            <section className="mb-16" data-purpose="upcoming-sessions">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Lịch học sắp tới
                </h2>
                <div className="space-y-4">
                    {/*  Active Session  */}
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl min-w-[120px]">
                            <span className="text-xs uppercase text-slate-500 font-bold">Thứ Năm</span>
                            <span className="text-2xl font-black text-slate-900">24/05</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">ĐANG LIVE</span>
                                <span className="text-sm font-medium text-slate-500">20:00 - 21:30 (90 phút)</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900">Buổi 12: Chinh phục thể Te (Te-form) và các biến thể</h4>
                        </div>
                        <button className="w-full md:w-auto px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition shadow-lg shadow-red-200">Vào lớp ngay</button>
                    </div>
                    {/*  Future Session  */}
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-80 hover:opacity-100 transition">
                        <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl min-w-[120px]">
                            <span className="text-xs uppercase text-slate-500 font-bold">Chủ Nhật</span>
                            <span className="text-2xl font-black text-slate-900">27/05</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Sắp diễn ra</span>
                                <span className="text-sm font-medium text-slate-500">09:00 - 10:30 (90 phút)</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">Buổi 13: Luyện tập hội thoại giao tiếp tại nhà hàng</h4>
                        </div>
                        <button className="w-full md:w-auto px-6 py-2 border-2 border-slate-200 text-slate-600 rounded-lg font-bold cursor-not-allowed">Đã đăng ký</button>
                    </div>
                </div>
            </section>
            {/*  END: Schedule  */}
            {/*  BEGIN: Prerequisites  */}
            <section className="mb-16" data-purpose="prerequisites">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Yêu cầu đầu vào
                </h2>
                <div className="bg-slate-100/70 p-8 rounded-2xl border border-slate-200">
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-slate-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            <span className="text-slate-600">Dành cho người mới bắt đầu hoặc đã biết sơ qua bảng chữ cái Hiragana/Katakana.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-slate-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            <span className="text-slate-600">Thiết bị có kết nối internet ổn định (PC/Laptop/Tablet) để tham gia Live Class.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-slate-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            <span className="text-slate-600">Tinh thần tự giác và kiên trì rèn luyện hàng ngày.</span>
                        </li>
                    </ul>
                </div>
            </section>
            {/*  END: Prerequisites  */}
            {/*  BEGIN: Instructor  */}
            <section className="mb-16" data-purpose="instructor">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Giảng viên
                </h2>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-10">
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <img alt="Kenji Sato" className="w-32 h-32 rounded-full border-4 border-indigo-50 shadow-xl mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-NIruKEPDuN2VAqeOMt3mbyZ0rLjWASSzjGDqUjsgV7YbrTff2otuFJUsX33nMC1xZN_An8mNSElysIe7EJLSY5QfDmFWsgS0C8EAphUbHl5_tFDeDSp0BPbjnZdZ5PqRlbjJsXP9gq3TpNoh9RPDPAc4AOo4ubpEBzMTTbS_h0j9Q-_CZbaQJqxy-IXep05cBA-G_xs0mwHQCUjfuYc3G_CdcqDOib5sVYD37lg2g2ks6RJW_SD0831Tx-xsui-3BCH0q8N0AwQ"/>
                        <div className="text-center">
                            <p className="font-bold text-xl text-slate-900">Kenji Sato</p>
                            <p className="text-indigo-600 font-medium">N1 Level - 8 năm kinh nghiệm</p>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-600 leading-relaxed mb-6">
                            Chào các bạn! Tôi là Kenji, hiện đang là trưởng bộ môn tiếng Nhật tại Torii. Với hơn 8 năm giảng dạy và 5 năm làm việc tại Tokyo, tôi hiểu rõ những khó khăn mà người Việt thường gặp khi học tiếng Nhật. Phương pháp của tôi tập trung vào việc hiểu bản chất ngôn ngữ thay vì học vẹt.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-2xl font-bold text-slate-900">45+</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Khóa học đã dạy</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-2xl font-bold text-slate-900">15.000+</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Học viên tin tưởng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/*  END: Instructor  */}
        </div>
        {/*  Right Column (Sticky Sidebar)  */}
        <aside className="col-span-12 lg:col-span-4 relative">
            <div className="sticky top-12">
                <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-200/50 border border-slate-200 overflow-hidden">
                    {/*  Course Thumbnail  */}
                    <div className="h-48 japanese-pattern relative flex items-center justify-center p-8">
                        <div className="absolute inset-0 bg-indigo-600/20"></div>
                        <div className="relative z-10 text-white text-center">
                            <div className="text-5xl font-black mb-2">日本語</div>
                            <div className="text-sm font-bold tracking-[0.2em] uppercase opacity-80">Nihongo Level N5</div>
                        </div>
                        <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-md transition">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        </button>
                    </div>
                    {/*  Pricing & CTA  */}
                    <div className="p-8">
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-extrabold text-indigo-600">1.200.000 ₫</span>
                            <span className="text-slate-400 line-through text-lg">2.500.000 ₫</span>
                        </div>
                        <button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/40 transition active:scale-[0.98] mb-8">
                            Đăng ký ngay
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        </button>
                        {/*  Course Info  */}
                        <div className="space-y-4 border-b border-slate-100 pb-8 mb-8">
                            <h5 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Khóa học bao gồm:</h5>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-600 text-sm">
                                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path></svg>
                                    24 buổi học trực tuyến (90p/buổi)
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm">
                                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path></svg>
                                    Thời gian học: 12 tuần liên tục
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm">
                                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path></svg>
                                    Truy cập trọn đời kho bài giảng
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm">
                                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path></svg>
                                    Chứng nhận hoàn thành cuối khóa
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm">
                                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path></svg>
                                    Hỗ trợ 1-1 qua cộng đồng Discord
                                </li>
                            </ul>
                        </div>
                        {/*  Trust Signal  */}
                        <div className="text-center">
                            <p className="text-xs text-slate-400 font-medium">Cam kết hoàn tiền trong 30 ngày nếu không hài lòng</p>
                            <div className="mt-6 flex justify-center gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-slate-700">600+</span>
                                    <span className="text-[10px] text-slate-400">Tài liệu</span>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-slate-700">12</span>
                                    <span className="text-[10px] text-slate-400">Bài thi thử</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  Share Link  */}
                <div className="mt-6 text-center">
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline">Chia sẻ khóa học cho bạn bè</button>
                </div>
            </div>
        </aside>
    </div>
</main>


    </div>
  );
}
