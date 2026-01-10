import { useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Database, FileQuestion } from 'lucide-react';

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
        <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Question Bank
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Manage questions and organize them into pools for quizzes and exams.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 sm:mb-6">
                    <TabsTrigger value="questions" className="flex items-center gap-2 cursor-pointer transition-colors">
                        <FileQuestion className="h-4 w-4" />
                        Questions
                    </TabsTrigger>
                    <TabsTrigger value="pools" className="flex items-center gap-2 cursor-pointer transition-colors">
                        <Database className="h-4 w-4" />
                        Question Pools
                    </TabsTrigger>
                </TabsList>

                <Outlet />
            </Tabs>
        </div>
    );
}

