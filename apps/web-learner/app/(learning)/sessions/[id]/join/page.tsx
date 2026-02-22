'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Video } from 'lucide-react';
import { liveSessionApi } from '@/apis/services/live-session-api';
import { Spinner } from '@workspace/ui/components/spinner'

interface JoinSessionPageProps {
    params: {
        id: string;
    };
}

export default function JoinSessionPage({ params }: JoinSessionPageProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'error' | 'redirecting'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const joinSession = async () => {
            try {
                setStatus('loading');

                // Call the backend to get the access token
                const joinData = await liveSessionApi.joinSession(params.id);

                // Get the Meet URL from environment or use default
                const meetUrl = process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com';

                // Redirect to Meet app with access token
                setStatus('redirecting');
                window.location.href = `${meetUrl}?access_token=${joinData.token}`;

            } catch (error: any) {
                console.error('Failed to join session:', error);
                setStatus('error');

                // Parse error message
                if (error.response?.data?.message) {
                    setErrorMessage(error.response.data.message);
                } else if (error.message) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('Không thể tham gia buổi học. Vui lòng thử lại sau.');
                }
            }
        };

        joinSession();
    }, [params.id]);

    if (status === 'loading' || status === 'redirecting') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center space-y-6 p-8">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <Video className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <Spinner className="w-24 h-24 text-blue-600 dark:text-blue-400 animate-spin absolute -top-2 -left-2" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {status === 'loading' ? 'Đang kết nối...' : 'Đang chuyển hướng...'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {status === 'loading'
                                ? 'Vui lòng đợi trong giây lát'
                                : 'Bạn sẽ được chuyển đến phòng học ngay bây giờ'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Không thể tham gia
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {errorMessage}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.back()}
                            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
