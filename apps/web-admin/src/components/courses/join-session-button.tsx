import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Video, ExternalLink } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { liveSessionsApi } from '@/lib/api/services/live-sessions';
import { Spinner } from "@workspace/ui/components/spinner";

interface JoinSessionButtonProps {
    sessionId: string;
    sessionTitle: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export function JoinSessionButton({
    sessionId,
    sessionTitle,
    variant = 'default',
    size = 'default',
    className = ''
}: JoinSessionButtonProps) {
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        try {
            setIsJoining(true);

            // Call the backend to get the access token
            const joinData = await liveSessionsApi.join(sessionId);

            // Get the Meet URL from environment or use default
            const meetUrl = import.meta.env.VITE_MEET_URL || 'https://meet.torii.com';

            // Open in new tab or redirect
            window.open(`${meetUrl}?access_token=${joinData.token}`, '_blank');

            toast.success(`Đang tham gia: ${sessionTitle}`);

        } catch (error: any) {
            console.error('Failed to join session:', error);

            // Parse error message
            let errorMessage = 'Không thể tham gia buổi học. Vui lòng thử lại sau.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Button
            onClick={handleJoin}
            disabled={isJoining}
            variant={variant}
            size={size}
            className={className}
        >
            {isJoining ? (
                <>
                    <Spinner />
                    Đang kết nối...
                </>
            ) : (
                <>
                    <Video className="size-4" />
                    Tham gia
                    <ExternalLink className="size-3 opacity-50" />
                </>
            )}
        </Button>
    );
}
