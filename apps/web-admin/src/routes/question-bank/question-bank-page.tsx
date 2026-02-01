import { useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Database, FileQuestion } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';

export default function QuestionBankPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab from URL
    const pathname = location.pathname;
    const activeTab = pathname.includes('/pools') && !pathname.includes('/questions') ? 'pools' : 'questions';

    // Redirect root to questions if exact match
    if (pathname === '/question-bank' || pathname === '/question-bank/') {
        return <Navigate to="/question-bank/questions" replace />;
    }

    const handleTabChange = (value: string) => {
        if (value === 'questions') {
            navigate('/question-bank/questions');
        } else if (value === 'pools') {
            navigate('/question-bank/pools');
        }
    };

    return (
        <div className="relative min-h-screen space-y-10 animate-in fade-in duration-700 pb-20 px-2 lg:px-6">
            {/* Zen Atmosphere */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/[0.02] blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.02] blur-[100px] rounded-full" />
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8">
                {/* Custom Tabs Navigation */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                    <PageHeader
                        title="Ngân hàng Câu hỏi"
                        subtitle="Quản lý và tổ chức hệ thống câu hỏi, bộ đề thi"
                        className="p-0"
                    />


                    <TabsList className="h-auto p-1.5 bg-muted/20 backdrop-blur-xl border border-border/10 rounded-[1.5rem] flex gap-1 w-full md:w-auto">
                        <TabsTrigger
                            value="questions"
                            className="flex-1 md:flex-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 rounded-2xl px-6 py-3 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-muted/50 group-data-[state=active]:bg-primary/10 transition-colors">
                                    <FileQuestion className="size-4 opacity-50 group-data-[state=active]:opacity-100 group-data-[state=active]:text-primary" />
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-[11px] font-medium text-muted-foreground group-data-[state=active]:text-foreground">Câu hỏi</span>
                                    <span className="text-[9px] font-medium text-muted-foreground/40 hidden sm:block">Quản lý mục</span>
                                </div>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="pools"
                            className="flex-1 md:flex-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 rounded-2xl px-6 py-3 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-muted/50 group-data-[state=active]:bg-primary/10 transition-colors">
                                    <Database className="size-4 opacity-50 group-data-[state=active]:opacity-100 group-data-[state=active]:text-primary" />
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-[11px] font-medium text-muted-foreground group-data-[state=active]:text-foreground">Bộ câu hỏi</span>
                                    <span className="text-[9px] font-medium text-muted-foreground/40 hidden sm:block">Tổ chức bộ sưu tập</span>
                                </div>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="relative z-10">
                    <Outlet />
                </div>
            </Tabs>
        </div>
    );
}
