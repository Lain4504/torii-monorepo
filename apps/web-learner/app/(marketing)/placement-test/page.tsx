export default function PlacementTestPage() {
    return (
        <div className="bg-white text-slate-900 antialiased font-sans">
            <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

            {/*  BEGIN: HeroSection  */}
            <section className="relative w-full overflow-hidden bg-gradient-to-b from-[oklch(0.55_0.15_15_/_0.1)] via-background to-background pt-16 pb-24 md:pt-24 md:pb-32">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/*  Left Content  */}
                        <div className="flex-1 space-y-8 max-w-2xl text-left">
                            {/*  Status Badge  */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-medium text-slate-700 shadow-sm" data-purpose="promo-badge">
                                <svg className="text-amber-500" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                                Đánh giá năng lực miễn phí · 100% Miễn phí
                            </div>
                            {/*  Main Heading  */}
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                                Bạn đang ở <br />
                                <span className="text-[oklch(0.55_0.15_15)]">trình độ nào?</span>
                            </h1>
                            {/*  Subtitle  */}
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                                Xác định trình độ tiếng Nhật của bạn chỉ trong vài phút với bài thi thích nghi thông minh từ Torii.
                            </p>
                            {/*  Trust Row  */}
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4" data-purpose="trust-indicators">
                                <div className="flex items-center gap-2">
                                    <svg className="text-emerald-500" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    <span className="font-medium text-slate-700">Không cần đăng ký</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="text-emerald-500" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    <span className="font-medium text-slate-700">Kết quả ngay lập tức</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="text-emerald-500" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    <span className="font-medium text-slate-700">Được cá nhân hóa bởi AI</span>
                                </div>
                            </div>
                        </div>
                        {/*  Right Content: Floating Card Preview  */}
                        <div className="flex-1 w-full flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-[500px] aspect-video rounded-3xl bg-slate-900 shadow-2xl overflow-hidden border-8 border-slate-800 animate-float">
                                {/*  Mockup Interface Inside Laptop Frame  */}
                                <div className="absolute inset-0 bg-white m-1 rounded-2xl overflow-hidden flex flex-col">
                                    {/*  Top bar  */}
                                    <div className="h-8 bg-slate-100 flex items-center px-4 gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                                    </div>
                                    {/*  Content Mockup  */}
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-10 w-full border-2 border-[oklch(0.55_0.15_15)/0.2] bg-[oklch(0.55_0.15_15)/0.05] rounded-lg flex items-center px-4 font-semibold text-[oklch(0.55_0.15_15)]">A. 日本語</div>
                                            <div className="h-10 w-full border-2 border-slate-100 rounded-lg flex items-center px-4 text-slate-400">B. 英語</div>
                                            <div className="h-10 w-full border-2 border-slate-100 rounded-lg flex items-center px-4 text-slate-400">C. 漫画</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*  JLPT Level Row  */}
                    <div className="mt-16 flex flex-wrap justify-center gap-3 md:gap-4" data-purpose="jlpt-selector">
                        <span className="px-6 py-2 rounded-full bg-[oklch(0.55_0.15_15)] text-white font-bold shadow-lg shadow-[oklch(0.55_0.15_15)/0.2] transition-all cursor-default">N5</span>
                        <span className="px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-600 font-bold hover:border-[oklch(0.55_0.15_15)/0.5] hover:text-[oklch(0.55_0.15_15)] transition-all cursor-pointer">N4</span>
                        <span className="px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-600 font-bold hover:border-[oklch(0.55_0.15_15)/0.5] hover:text-[oklch(0.55_0.15_15)] transition-all cursor-pointer">N3</span>
                        <span className="px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-600 font-bold hover:border-[oklch(0.55_0.15_15)/0.5] hover:text-[oklch(0.55_0.15_15)] transition-all cursor-pointer">N2</span>
                        <span className="px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-600 font-bold hover:border-[oklch(0.55_0.15_15)/0.5] hover:text-[oklch(0.55_0.15_15)] transition-all cursor-pointer">N1</span>
                    </div>
                </div>
            </section>
            {/*  END: HeroSection  */}
            {/*  BEGIN: MainContent  */}
            <main className="container mx-auto px-4 max-w-4xl -mt-12 mb-24 relative z-10">
                {/*  Placement Test Card (Intro Step)  */}
                <div className="bg-card rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-12 overflow-hidden relative" data-purpose="placement-test-intro">
                    {/*  Decoration: Pill Illustration  */}
                    <div className="flex justify-center mb-10 overflow-hidden">
                        <div className="flex items-center -space-x-4">
                            <div className="w-16 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-white flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] translate-x-[-20px] rotate-[-6deg]">N5</div>
                            <div className="w-16 h-10 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 border border-white flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] translate-x-[-10px] rotate-[-3deg] z-10 shadow-sm">N4</div>
                            <div className="w-16 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-white flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] z-20 shadow-md scale-110 border-[oklch(0.55_0.15_15)/0.2]">N3</div>
                            <div className="w-16 h-10 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 border border-white flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] translate-x-[10px] rotate-[3deg] z-10 shadow-sm">N2</div>
                            <div className="w-16 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-white flex items-center justify-center font-bold text-[oklch(0.55_0.15_15)] translate-x-[20px] rotate-[6deg]">N1</div>
                        </div>
                    </div>
                    {/*  Heading  */}
                    <div className="text-center space-y-3 mb-12">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Bài Thi Xác Định Trình Độ</h2>
                        <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                            Hãy trả lời 15 câu hỏi để AI phân tích lộ trình học tập tối ưu cho bạn.
                        </p>
                    </div>
                    {/*  Stat Cards  */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-xl bg-[oklch(0.55_0.15_15)/0.1] flex items-center justify-center text-[oklch(0.55_0.15_15)] mb-4">
                                <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            </div>
                            <span className="text-2xl font-black text-slate-900">15 câu hỏi</span>
                            <span className="text-sm text-muted-foreground">Phủ rộng kiến thức</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-xl bg-[oklch(0.55_0.15_15)/0.1] flex items-center justify-center text-[oklch(0.55_0.15_15)] mb-4">
                                <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <span className="text-2xl font-black text-slate-900">~10 phút</span>
                            <span className="text-sm text-muted-foreground">Tiết kiệm thời gian</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-xl bg-[oklch(0.55_0.15_15)/0.1] flex items-center justify-center text-[oklch(0.55_0.15_15)] mb-4">
                                <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                            </div>
                            <span className="text-2xl font-black text-slate-900">AI thích nghi</span>
                            <span className="text-sm text-muted-foreground">Kết quả chính xác</span>
                        </div>
                    </div>
                    {/*  Info Box  */}
                    <div className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-slate-100 mb-10 items-start">
                        <svg className="text-[oklch(0.55_0.15_15)] shrink-0 mt-0.5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Bài thi gồm các câu từ N5 đến N1. AI sẽ điều chỉnh độ khó theo từng câu trả lời của bạn để đưa ra kết quả phân loại chuẩn xác nhất.
                        </p>
                    </div>
                    {/*  CTA  */}
                    <button className="w-full h-14 bg-[oklch(0.55_0.15_15)] text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_oklch(0.55_0.15_15/0.25)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all">
                        Bắt đầu kiểm tra
                        <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </button>
                </div>
            </main>
            {/*  END: MainContent  */}


        </div>
    );
}
