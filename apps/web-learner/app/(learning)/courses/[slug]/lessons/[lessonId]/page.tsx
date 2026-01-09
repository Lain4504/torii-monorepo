'use client';

import {
    VideoPlayer,
    VideoPlayerControlBar,
    VideoPlayerPlayButton,
    VideoPlayerSeekBackwardButton,
    VideoPlayerSeekForwardButton,
    VideoPlayerTimeRange,
    VideoPlayerTimeDisplay,
    VideoPlayerMuteButton,
    VideoPlayerVolumeRange,
    VideoPlayerContent,
} from '@workspace/ui/components/ui/shadcn-io/video-player';
import { useParams } from 'next/navigation';

export default function LessonVideoPage() {
    const params = useParams();
    // Safe access to params, ensuring they are strings
    const slug = params?.slug as string;
    const lessonId = params?.lessonId as string;

    // Mock data - replace with actual data fetching logic in the future
    const lessonData = {
        title: "Understanding React Fundamentals",
        description: "Learn the core concepts of React including components, props, and state.",
        // Using a sample video URL that is likely to work for testing
        videoUrl: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid gap-6">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                        <span>Courses</span>
                        <span>/</span>
                        <span>{slug}</span>
                        <span>/</span>
                        <span className="text-foreground font-medium">Lessons</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{lessonData.title}</h1>
                    <p className="text-lg text-muted-foreground">{lessonData.description}</p>
                </div>

                <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black shadow-lg">
                    <VideoPlayer className="h-full w-full">
                        <VideoPlayerContent
                            slot="media"
                            src={lessonData.videoUrl}
                            className="h-full w-full"
                        />
                        <VideoPlayerControlBar>
                            <VideoPlayerPlayButton />
                            <VideoPlayerSeekBackwardButton />
                            <VideoPlayerSeekForwardButton />
                            <VideoPlayerTimeRange />
                            <VideoPlayerTimeDisplay />
                            <VideoPlayerMuteButton />
                            <VideoPlayerVolumeRange />
                        </VideoPlayerControlBar>
                    </VideoPlayer>
                </div>

                <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold text-xl">Lesson Notes</h3>
                    <p className="text-muted-foreground">
                        Display lesson content, resources, and transcript here.
                        (Lesson ID: {lessonId})
                    </p>
                </div>
            </div>
        </div>
    );
}

