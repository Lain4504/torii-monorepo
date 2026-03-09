import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    LiveSessionResponseDTO,
    LiveSessionJoinResponseDTO,
    StandardApiResponse,
    AcademyLiveScheduleModel,
} from '@workspace/schemas';
import { academyClassesApi } from './academy-classes';
import { academyEnrollmentApi } from './academy-enrollment-api';

type LiveScheduleWithClass = AcademyLiveScheduleModel & {
    liveClass?: { classId?: string } | null;
};

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

function toWeeklyOccurrences(
    schedule: LiveScheduleWithClass,
    classId: string,
    now: Date,
    options?: {
        startDate?: Date | null;
        endDate?: Date | null;
    },
): LiveSessionResponseDTO[] {
    const result: LiveSessionResponseDTO[] = [];
    const weekday = schedule.weekday;
    const startMinutes = parseHHmmToMinutes(schedule.startTime);
    const endMinutes = parseHHmmToMinutes(schedule.endTime);
    const duration = computeDurationMinutes(schedule.startTime, schedule.endTime);

    const excludedDateSet = new Set(
        Array.isArray(schedule.excludedDates)
            ? schedule.excludedDates.map((v) => String(v).slice(0, 10))
            : [],
    );
    const classStart = options?.startDate ? new Date(options.startDate) : null;
    const classEnd = options?.endDate ? new Date(options.endDate) : null;

    for (
        let weekOffset = -SCHEDULE_WINDOW_PAST_WEEKS;
        weekOffset <= SCHEDULE_WINDOW_FUTURE_WEEKS;
        weekOffset += 1
    ) {
        const base = new Date(now);
        const dayDelta = weekday - base.getDay() + weekOffset * 7;
        base.setDate(base.getDate() + dayDelta);
        base.setHours(0, 0, 0, 0);

        const scheduledAt = withMinutes(base, startMinutes);
        const endAt = withMinutes(base, endMinutes);
        const sessionDateKey = scheduledAt.toISOString().slice(0, 10);

        if (excludedDateSet.has(sessionDateKey)) {
            continue;
        }
        if (classStart) {
            const startBoundary = new Date(classStart);
            startBoundary.setHours(0, 0, 0, 0);
            if (scheduledAt < startBoundary) {
                continue;
            }
        }
        if (classEnd) {
            const endBoundary = new Date(classEnd);
            endBoundary.setHours(23, 59, 59, 999);
            if (scheduledAt > endBoundary) {
                continue;
            }
        }

        const status =
            now >= scheduledAt && now <= endAt
                ? 'live'
                : now > endAt
                    ? 'ended'
                    : 'scheduled';

        result.push({
            id: `${schedule.id}-${sessionDateKey}`,
            courseRunId: classId,
            lecturerId: null,
            title: schedule.note?.trim() ? schedule.note : 'Buoi hoc truc tuyen',
            description: schedule.location ?? null,
            scheduledAt,
            duration,
            status,
            meetingId: schedule.roomId ?? null,
            scheduleId: schedule.id,
            createdAt: new Date(schedule.createdAt),
            updatedAt: new Date(schedule.updatedAt),
        });
    }

    return result;
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

    // Build session-like occurrences from /api/academy/live-schedules
    async getSessions(classId: string): Promise<LiveSessionResponseDTO[]> {
        if (!classId) return [];

        const classData = await academyClassesApi.findById(classId);
        const liveClassId = classData?.liveClass?.id;
        if (!liveClassId) return [];

        const response = await apiClient.get<StandardApiResponse<{ items: LiveScheduleWithClass[] }>>(
            '/api/academy/live-schedules',
            { params: { liveClassId } },
        );

        const schedules = response.data.data?.items ?? [];
        const now = new Date();
        return schedules
            .flatMap((schedule) =>
                toWeeklyOccurrences(schedule, classId, now, {
                    startDate: classData.liveClass?.startDate ?? null,
                    endDate: classData.liveClass?.endDate ?? null,
                }),
            )
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    },

    // POST /api/live-sessions/:id/join (id = liveScheduleId)
    async joinSession(id: string): Promise<LiveSessionJoinResponseDTO> {
        const scheduleId = id.includes('-') ? id.split('-')[0] : id;
        const response = await apiClient.post<StandardApiResponse<LiveSessionJoinResponseDTO>>(`/api/live-sessions/${scheduleId}/join`);
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
