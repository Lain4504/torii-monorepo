'use client';

import { Check, Sparkles, Lock, RefreshCcw, BookOpen, TrendingUp, Award, Download, Flame, ChevronRight, AlertCircle } from 'lucide-react';

export function AnalyticsDashboard() {
    return (
        <div className="bg-background text-foreground min-h-screen font-sans antialiased">
            <style>{`

    :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
}

    .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
}


    @keyframes fillProgress {
    from { width: 0; }
    to { width: var(--progress-width); }
}
    .animate-progress {
    animation: fillProgress 1s ease-out forwards;
}
    .chart-container {
    height: 300px;
    width: 100%;
}

      `}</style>

            <div className="flex flex-col w-full max-w-[1440px] mx-auto p-6 space-y-8">
                {/*  BEGIN: Header  */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-purpose="dashboard-header">
                    <div className="space-y-1">
                        <nav aria-label="Breadcrumb" className="flex text-sm text-muted-foreground mb-2">
                            <ol className="flex items-center space-x-2">
                                <li>Dashboard</li>
                                <li className="flex items-center space-x-2">
                                    <ChevronRight className="w-4 h-4" />
                                    <span className="text-foreground font-medium">Phân tích học tập</span>
                                </li>
                            </ol>
                        </nav>
                        <h1 className="text-3xl font-bold tracking-tight">Phân Tích Học Tập</h1>
                        <p className="text-muted-foreground">Đánh giá toàn diện tiến độ và lộ trình chinh phục JLPT của bạn.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Mục tiêu:</span>
                            <span className="text-sm font-bold text-primary">N5</span>
                        </div>
                        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                            <Download className="w-4 h-4 mr-2" />
                            Xuất báo cáo
                        </button>
                    </div>
                </header>
                {/*  END: Header  */}
                {/*  BEGIN: Stat Cards Row  */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="stats-overview">
                    {/*  Card 1: Monthly Progress  */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium">Tiến độ tháng này</p>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold">82.5%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-emerald-500 font-medium">+4.3%</span> so với tháng trước
                        </p>
                    </div>
                    {/*  Card 2: JLPT Readiness  */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium">Sẵn sàng JLPT</p>
                            <Award className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold">68%</div>
                        <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-primary h-full animate-progress" style={{ '--progress-width': '68%' } as React.CSSProperties}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">Dự kiến đủ điều kiện trong 4 tuần</p>
                    </div>
                    {/*  Card 3: Learning Streak  */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium">Streak học tập</p>
                            <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold">12 Ngày</div>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            <p className="text-xs font-medium text-emerald-500">Hôm nay đã học</p>
                        </div>
                    </div>
                    {/*  Card 4: Lessons Completed  */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium">Bài học hoàn thành</p>
                            <BookOpen className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">48 bài</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tổng cộng <span className="font-medium text-foreground">32.5 giờ</span> học tập
                        </p>
                    </div>
                </section>
                {/*  END: Stat Cards Row  */}
                {/*  BEGIN: Main Dashboard Grid  */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-purpose="main-dashboard-content">
                    {/*  Left Column (2-cols wide)  */}
                    <div className="lg:col-span-2 space-y-6">
                        {/*  BEGIN: Learning Curve Chart Section  */}
                        <section className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden" data-purpose="learning-curve">
                            <div className="p-6 border-b">
                                <h3 className="font-semibold text-lg leading-none tracking-tight">Biểu đồ tiến triển học tập</h3>
                                <p className="text-sm text-muted-foreground mt-1.5">Phân tích điểm số trung bình và số bài học theo thời gian</p>
                            </div>
                            <div className="p-6">
                                {/*  Simulated Area Chart Container  */}
                                <div className="chart-container relative" id="learning-curve-chart">
                                    {/*  SVG Placeholder for Recharts AreaChart  */}
                                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
                                        {/*  Grid Lines  */}
                                        <line className="text-border" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="250" y2="250" />
                                        <line className="text-border" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="150" y2="150" />
                                        <line className="text-border" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="50" y2="50" />
                                        {/*  Area Fill  */}
                                        <path d="M0 250 L100 200 L200 220 L300 120 L400 150 L500 80 L600 90 L700 40 L800 60 L800 300 L0 300 Z" fill="url(#colorPrimary)" opacity="0.1" />
                                        {/*  Path Stroke  */}
                                        <path d="M0 250 L100 200 L200 220 L300 120 L400 150 L500 80 L600 90 L700 40 L800 60" fill="none" stroke="oklch(0.55 0.15 15)" strokeLinecap="round" strokeWidth="3" />
                                        {/*  Secondary Line  */}
                                        <path d="M0 280 L100 240 L200 230 L300 210 L400 180 L500 160 L600 140 L700 110 L800 90" fill="none" stroke="oklch(0.7 0.12 200)" strokeDasharray="5" strokeWidth="2" />
                                        <defs>
                                            <linearGradient id="colorPrimary" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="5%" stopColor="oklch(0.55 0.15 15)" stopOpacity="0.8" />
                                                <stop offset="95%" stopColor="oklch(0.55 0.15 15)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="flex justify-between mt-4 text-xs text-muted-foreground uppercase tracking-widest px-2">
                                        <span>Tuần 1</span>
                                        <span>Tuần 2</span>
                                        <span>Tuần 3</span>
                                        <span>Tuần 4</span>
                                        <span>Tuần 5</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/*  END: Learning Curve Chart Section  */}
                        {/*  BEGIN: Skill Breakdown & AI Insights  */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6" data-purpose="skill-analysis">
                            {/*  Skill Analysis  */}
                            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                                <h3 className="font-semibold text-base mb-4">Phân tích kỹ năng</h3>
                                <div className="space-y-5">
                                    {/*  Grammar  */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Ngữ pháp</span>
                                            <span className="text-muted-foreground">75%</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full animate-progress" style={{ '--progress-width': '75%' } as React.CSSProperties}></div>
                                        </div>
                                    </div>
                                    {/*  Vocab  */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Từ vựng</span>
                                            <span className="text-muted-foreground">90%</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full animate-progress" style={{ '--progress-width': '90%' } as React.CSSProperties}></div>
                                        </div>
                                    </div>
                                    {/*  Reading  */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Đọc hiểu</span>
                                            <span className="text-muted-foreground">62%</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full animate-progress" style={{ '--progress-width': '62%' } as React.CSSProperties}></div>
                                        </div>
                                    </div>
                                    {/*  Listening  */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Nghe hiểu</span>
                                            <span className="text-muted-foreground">58%</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full animate-progress" style={{ '--progress-width': '58%' } as React.CSSProperties}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*  AI Strengths & Weaknesses  */}
                            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                                <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Điểm mạnh &amp; Điểm yếu AI
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-xs font-bold text-emerald-500 uppercase">Ưu thế (Đang tiến triển)</span>
                                        </div>
                                        <p className="text-sm font-medium">Từ vựng Kanji N5</p>
                                        <p className="text-xs text-muted-foreground">Bạn nhớ nhanh các chữ Hán cơ bản. Tiếp tục phát huy!</p>
                                    </div>
                                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                <span className="text-xs font-bold text-red-500 uppercase">Cần cải thiện</span>
                                            </div>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold uppercase">Cao</span>
                                        </div>
                                        <p className="text-sm font-medium">Trợ từ (Wa, Ga, Ni, De)</p>
                                        <p className="text-xs text-muted-foreground">Thường xuyên nhầm lẫn cách dùng. Gợi ý: Làm lại bài tập Chương 4.</p>
                                    </div>
                                    <div className="p-3 bg-secondary rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <RefreshCcw className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-xs font-bold text-muted-foreground uppercase">Lời khuyên từ AI</span>
                                        </div>
                                        <p className="text-xs leading-relaxed">Dành 15 phút mỗi sáng nghe podcast hội thoại N5 để cải thiện kỹ năng Listening đang có xu hướng đi ngang.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/*  END: Skill Breakdown & AI Insights  */}
                    </div>
                    {/*  End Left Column  */}
                    {/*  Right Column: JLPT Study Roadmap  */}
                    <aside className="lg:col-span-1" data-purpose="jlpt-roadmap">
                        <div className="rounded-xl border bg-card text-card-foreground shadow h-full flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Lộ trình JLPT N5</h3>
                                <span className="text-xs text-muted-foreground">Tình trạng: 45%</span>
                            </div>
                            <div className="p-6 flex-1 space-y-8 relative">
                                {/*  Timeline Line  */}
                                <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-border -z-0"></div>
                                {/*  Module 1: Completed  */}
                                <div className="flex gap-4 relative z-10">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-background">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-bold">Bảng chữ cái &amp; Chào hỏi</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border text-muted-foreground">Hiragana</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border text-muted-foreground">Katakana</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Hoàn thành: Tuần 1</p>
                                    </div>
                                </div>
                                {/*  Module 2: In Progress  */}
                                <div className="flex gap-4 relative z-10">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-bold text-primary">Ngữ pháp cơ bản 1</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">Trợ từ</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">Tính từ</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Đang học: Tuần 3-4</p>
                                        <div className="w-24 bg-secondary h-1 rounded-full mt-1">
                                            <div className="bg-primary h-full w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                                {/*  Module 3: Locked  */}
                                <div className="flex gap-4 relative z-10 opacity-50">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-border flex items-center justify-center ring-4 ring-background">
                                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-bold">Giao tiếp &amp; Kanji II</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border text-muted-foreground">Hành động</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border text-muted-foreground">Địa điểm</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Dự kiến: Tuần 5-6</p>
                                    </div>
                                </div>
                                {/*  Module 4: Locked  */}
                                <div className="flex gap-4 relative z-10 opacity-50">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-border flex items-center justify-center ring-4 ring-background">
                                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-bold">Luyện đề N5 tổng hợp</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border text-muted-foreground">Mock Test</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Dự kiến: Tuần 7-8</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-muted/30 border-t">
                                <button className="w-full text-center text-sm font-medium hover:text-primary transition-colors">
                                    Xem chi tiết lộ trình
                                </button>
                            </div>
                        </div>
                    </aside>
                    {/*  End Right Column  */}
                </main>
                {/*  END: Main Dashboard Grid  */}
            </div>



        </div>
    );
}
