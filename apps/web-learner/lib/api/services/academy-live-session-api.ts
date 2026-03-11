import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    LiveSessionResponseDTO,
    LiveSessionJoinResponseDTO,
    StandardApiResponse,
    AcademyLiveScheduleSessionModel,
} from '@workspace/schemas';
import { academyEnrollmentApi } from './academy-enrollment-api';

const SCHEDULE_WINDOW_PAST_WEEKS = 2;
const SCHEDULE_WINDOW_FUTURE_WEEKS = 12;
export const LIVE_SESSION_JOIN_OPEN_BEFORE_MINUTES = 30;
export const LIVE_SESSION_JOIN_CLOSE_AFTER_END_HOURS = 4;

export type LiveSessionUiState = 'scheduled' | 'joinable' | 'live' | 'ended';

function parseHHmmToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

function withMinutes(base: Date, minutesOfDay: number): Date {
    const d = new Date(base);
    d.setHours(Math.floor(minutesOfDay / 60), minutesOfDay % 60, 0, 0);
    return d;
}

function computeDurationMinutes(startTime: string, endTime: string): number {
    const start = parseHHmmToMinutes(startTime);
    const end = parseHHmmToMinutes(endTime);
    if (end >= start) return end - start;
    return 0;
}

export function getSessionJoinWindow(session: LiveSessionResponseDTO) {
    const scheduledAt = new Date(session.scheduledAt);
    const durationMinutes = Math.max(1, Number(session.duration || 90));
    const endAt = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);
    const joinOpenAt = new Date(
        scheduledAt.getTime() - LIVE_SESSION_JOIN_OPEN_BEFORE_MINUTES * 60 * 1000,
    );
    const joinCloseAt = new Date(
        endAt.getTime() + LIVE_SESSION_JOIN_CLOSE_AFTER_END_HOURS * 60 * 60 * 1000,
    );
    return { scheduledAt, endAt, joinOpenAt, joinCloseAt };
}

export function getLiveSessionUiState(
    session: LiveSessionResponseDTO,
    nowInput?: Date,
): LiveSessionUiState {
    const now = nowInput ?? new Date();
    const { scheduledAt, endAt, joinOpenAt, joinCloseAt } = getSessionJoinWindow(session);

    if (now < joinOpenAt) return 'scheduled';
    if (now >= scheduledAt && now <= endAt) return 'live';
    if (now > joinCloseAt) return 'ended';
    return 'joinable';
}

export function canJoinLiveSessionNow(
    session: LiveSessionResponseDTO,
    nowInput?: Date,
): boolean {
    const now = nowInput ?? new Date();
    const { joinOpenAt, joinCloseAt } = getSessionJoinWindow(session);
    return now >= joinOpenAt && now <= joinCloseAt;
}

function toSessionResponse(
    session: AcademyLiveScheduleSessionModel,
    classId: string,
    now: Date,
): LiveSessionResponseDTO {
    const sessionDate = new Date(session.sessionDate as any);
    sessionDate.setHours(0, 0, 0, 0);
    const startMinutes = parseHHmmToMinutes(session.startTime);
    const endMinutes = parseHHmmToMinutes(session.endTime);
    const scheduledAt = withMinutes(sessionDate, startMinutes);
    const endAt = withMinutes(sessionDate, endMinutes);
    const duration = computeDurationMinutes(session.startTime, session.endTime);

    const status =
        now >= scheduledAt && now <= endAt
            ? 'live'
            : now > endAt
                ? 'ended'
                : 'scheduled';

    return {
        id: session.id,
        courseRunId: classId,
        lecturerId: null,
        title: session.note?.trim() ? session.note : 'Buoi hoc truc tuyen',
        description: session.location ?? null,
        scheduledAt,
        duration,
        status,
        meetingId: session.roomId ?? null,
        scheduleId: session.scheduleId ?? null,
        createdAt: new Date(session.createdAt as any),
        updatedAt: new Date(session.updatedAt as any),
    };
}

export const liveSessionApi = {
    // Build active session from weekly live schedules of class
    async getActiveSession(classId: string): Promise<LiveSessionResponseDTO | null> {
        try {
            const sessions = await liveSessionApi.getSessions(classId);
            return sessions.find((s) => (s.status || '').toLowerCase() === 'live') ?? null;
        } catch (error) {
            console.error('Error fetching active live session:', error);
            return null;
        }
    },

    // List session instances from /api/academy/live-sessions
    async getSessions(classId: string): Promise<LiveSessionResponseDTO[]> {
        if (!classId) return [];

        const now = new Date();
        const from = new Date(now);
        from.setDate(from.getDate() - SCHEDULE_WINDOW_PAST_WEEKS * 7);
        const to = new Date(now);
        to.setDate(to.getDate() + SCHEDULE_WINDOW_FUTURE_WEEKS * 7);

        const response = await apiClient.get<
            StandardApiResponse<{ items: AcademyLiveScheduleSessionModel[] }>
        >('/api/academy/live-sessions', {
            params: {
                classId,
                from: from.toISOString().slice(0, 10),
                to: to.toISOString().slice(0, 10),
            },
        });

        const sessions = response.data.data?.items ?? [];
        return sessions
            .map((s) => toSessionResponse(s, classId, now))
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    },

    // POST /api/live-sessions/:sessionId/join/student
    async joinSession(id: string): Promise<LiveSessionJoinResponseDTO> {
        const response = await apiClient.post<
            StandardApiResponse<LiveSessionJoinResponseDTO>
        >(`/api/live-sessions/${id}/join/student`);
        return response.data.data!;
    },

    // Aggregate all weekly schedules from active LIVE enrollments
    async getMySchedule(): Promise<(LiveSessionResponseDTO & { courseTitle: string; courseThumbnail: string | null })[]> {
        const enrollments = await academyEnrollmentApi.getMyEnrollments({ page: 1, limit: 100, status: 'ACTIVE' });
        const liveEnrollments = (enrollments.data ?? []).filter((e: any) =>
            e?.type === 'live' || e?.mode === 'LIVE' || e?.class?.mode === 'LIVE',
        );

        if (liveEnrollments.length === 0) return [];

        const sessionArrays = await Promise.allSettled(
            liveEnrollments.map((enrollment: any) =>
                liveSessionApi
                    .getSessions(enrollment.classId || enrollment.courseRunId)
                    .then((sessions) =>
                        sessions.map((s) => ({
                            ...s,
                            courseTitle: enrollment.courseTitle || enrollment.class?.courseProfile?.title || 'Untitled Course',
                            courseThumbnail: enrollment.thumbnailUrl || enrollment.class?.courseProfile?.thumbnailUrl || null,
                        })),
                    ),
            ),
        );

        return sessionArrays
            .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
            .flatMap((r) => r.value)
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }
};

export function useMySchedule() {
    return useQuery({
        queryKey: ['my-schedule'],
        queryFn: liveSessionApi.getMySchedule,
        staleTime: 5 * 60 * 1000, // 5 mins
    });
}
