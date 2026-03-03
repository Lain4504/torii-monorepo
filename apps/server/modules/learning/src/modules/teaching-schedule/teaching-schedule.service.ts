import { Injectable, NotFoundException, ForbiddenException, ConflictException, Inject } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { PrismaService } from '@server/shared';
import {
    TeachingScheduleCreateDTO,
    TeachingScheduleResponseDTO,
    ScheduleRequestCreateDTO,
    ScheduleRequestResponseDTO,
    Requester
} from '@workspace/schemas';
import { v4 as uuidv4 } from 'uuid';
import { ITeachingScheduleService } from '@server/learning/interfaces/services/i-teaching-schedule.service';
import { ICourseMasterService } from '@server/learning/interfaces/services/i-course-master.service';
import { COURSE_MASTER_SERVICE_TOKEN } from '@server/learning/interfaces/services';

@Injectable()
export class TeachingScheduleService implements ITeachingScheduleService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(COURSE_MASTER_SERVICE_TOKEN)
        private readonly courseMasterService: ICourseMasterService,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    async checkAvailability(
        lecturerId: string,
        dayOfWeek: number,
        startTime: string,
        duration: number,
        excludeScheduleId?: string
    ): Promise<{ available: boolean; conflicts?: any[] }> {
        const newStart = this.timeToMinutes(startTime);
        const newEnd = newStart + duration;

        const existingSchedules = await this.prisma.teachingSchedule.findMany({
            where: {
                lecturerId,
                dayOfWeek,
                id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
            },
            include: {
                courseRun: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        const conflicts = existingSchedules.filter(s => {
            const start = this.timeToMinutes(s.startTime);
            const end = start + s.duration;
            return this.isOverlapping(newStart, newEnd, start, end);
        });

        return {
            available: conflicts.length === 0,
            conflicts: conflicts.length > 0 ? conflicts.map(c => ({
                id: c.id,
                courseTitle: (c as any).courseRun.title,
                startTime: c.startTime,
                duration: c.duration,
            })) : undefined,
        };
    }

    async assignSchedule(requester: Requester, dto: TeachingScheduleCreateDTO): Promise<TeachingScheduleResponseDTO> {
        if (!this.hasPermission(requester, 'live_class.schedule')) {
            throw new ForbiddenException('Only authorized staff can assign teaching schedules');
        }

        const availability = await this.checkAvailability(dto.lecturerId, dto.dayOfWeek, dto.startTime, dto.duration);
        if (!availability.available) {
            throw new ConflictException({
                message: 'Giảng viên đã có lịch dạy trùng vào thời gian này',
                conflicts: availability.conflicts,
            });
        }

        // Validate course run for scheduling
        const run = await this.prisma.courseRun.findUnique({
            where: { id: dto.courseRunId },
            include: { courseMaster: true }
        });
        if (!run) throw new NotFoundException('Lớp học không tồn tại');

        const validation = await this.courseMasterService.validateForScheduling(run.courseMasterId);
        if (!validation.isReady) {
            throw new ConflictException(validation.message || 'Khóa học chưa sẵn sàng để gán lịch');
        }

        const schedule = await this.prisma.teachingSchedule.create({
            data: {
                courseRunId: dto.courseRunId,
                lecturerId: dto.lecturerId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                duration: dto.duration,
            },
            include: {
                courseRun: {
                    include: { courseMaster: true }
                },
                lecturer: true,
            },
        });

        // Generate live sessions for the next 8 weeks for this run
        await this.regenerateSessionsForRun(dto.courseRunId, 8);

        return this.mapper.map<any, TeachingScheduleResponseDTO>(schedule, 'TeachingSchedule', 'TeachingScheduleResponseDTO');
    }

    async findByRun(courseRunId: string): Promise<TeachingScheduleResponseDTO[]> {
        const schedules = await this.prisma.teachingSchedule.findMany({
            where: { courseRunId },
            include: { lecturer: true, courseRun: { include: { courseMaster: true } } },
        });
        return schedules.map(s => this.mapper.map<any, TeachingScheduleResponseDTO>(s, 'TeachingSchedule', 'TeachingScheduleResponseDTO'));
    }

    async findByLecturer(lecturerId: string): Promise<TeachingScheduleResponseDTO[]> {
        const schedules = await this.prisma.teachingSchedule.findMany({
            where: { lecturerId },
            include: { lecturer: true, courseRun: { include: { courseMaster: true } } },
        });
        return schedules.map(s => this.mapper.map<any, TeachingScheduleResponseDTO>(s, 'TeachingSchedule', 'TeachingScheduleResponseDTO'));
    }

    async removeSchedule(requester: Requester, id: string): Promise<void> {
        if (!this.hasPermission(requester, 'live_class.schedule')) {
            throw new ForbiddenException('Only authorized staff can remove teaching schedules');
        }

        const schedule = await this.prisma.teachingSchedule.findUnique({ where: { id } });
        if (!schedule) throw new NotFoundException('Schedule not found');

        await this.prisma.teachingSchedule.delete({ where: { id } });

        // Regenerate sessions for the run
        await this.regenerateSessionsForRun(schedule.courseRunId, 8);
    }

    async createRequest(requester: Requester, dto: ScheduleRequestCreateDTO): Promise<ScheduleRequestResponseDTO> {
        // Any approved lecturer can create a request, but typically it should be for their own schedule
        // For simplicity, we'll just record who requested it.

        const request = await this.prisma.liveSessionScheduleRequest.create({
            data: {
                lecturerId: requester.sub,
                originalScheduleId: dto.originalScheduleId,
                courseRunId: (dto as any).courseRunId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                duration: dto.duration,
                reason: dto.reason,
                status: 'pending',
            },
            include: {
                lecturer: true,
                courseRun: { include: { courseMaster: true } },
            },
        });

        return this.mapper.map<any, ScheduleRequestResponseDTO>(request, 'LiveSessionScheduleRequest', 'ScheduleRequestResponseDTO');
    }

    async getPendingRequests(requester: Requester): Promise<ScheduleRequestResponseDTO[]> {
        const where: any = { status: 'pending' };

        const canManageSchedules = this.hasPermission(requester, 'live_class.schedule');

        if (!canManageSchedules) {
            // If they can't manage all schedules, they only see their own requests
            where.lecturerId = requester.sub;
        }

        const requests = await this.prisma.liveSessionScheduleRequest.findMany({
            where,
            include: { lecturer: true, courseRun: { include: { courseMaster: true } } },
        });
        return requests.map(r => this.mapper.map<any, ScheduleRequestResponseDTO>(r, 'LiveSessionScheduleRequest', 'ScheduleRequestResponseDTO'));
    }

    async handleRequest(requester: Requester, requestId: string, action: 'approve' | 'reject'): Promise<void> {
        if (!this.hasPermission(requester, 'live_class.schedule')) {
            throw new ForbiddenException('Only authorized staff can handle schedule requests');
        }

        const request = await this.prisma.liveSessionScheduleRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) throw new NotFoundException('Request not found');

        if (action === 'approve') {
            const availability = await this.checkAvailability(request.lecturerId, request.dayOfWeek, request.startTime, request.duration);
            if (!availability.available) {
                throw new ConflictException('Giảng viên đã có lịch dạy trùng, không thể phê duyệt');
            }

            // Validate run for scheduling
            const run = await this.prisma.courseRun.findUnique({
                where: { id: request.courseRunId }
            });
            if (!run) throw new NotFoundException('Run not found');

            const validation = await this.courseMasterService.validateForScheduling(run.courseMasterId);
            if (!validation.isReady) {
                throw new ConflictException(validation.message || 'Khóa học chưa sẵn sàng để gán lịch');
            }

            if (request.originalScheduleId) {
                // Update existing schedule
                await this.prisma.teachingSchedule.update({
                    where: { id: request.originalScheduleId },
                    data: {
                        dayOfWeek: request.dayOfWeek,
                        startTime: request.startTime,
                        duration: request.duration,
                    },
                });
                await this.regenerateSessionsForRun(request.courseRunId, 8);
            } else {
                // Create new schedule
                await this.prisma.teachingSchedule.create({
                    data: {
                        courseRunId: request.courseRunId,
                        lecturerId: request.lecturerId,
                        dayOfWeek: request.dayOfWeek,
                        startTime: request.startTime,
                        duration: request.duration,
                    },
                });
                await this.regenerateSessionsForRun(request.courseRunId, 8);
            }

            await this.prisma.liveSessionScheduleRequest.update({
                where: { id: requestId },
                data: { status: 'approved' },
            });
        } else {
            await this.prisma.liveSessionScheduleRequest.update({
                where: { id: requestId },
                data: { status: 'rejected' },
            });
        }
    }

    private async regenerateSessionsForRun(courseRunId: string, weeks: number) {
        const run = await this.prisma.courseRun.findUnique({
            where: { id: courseRunId },
            include: { courseMaster: true }
        });
        if (!run) return;

        const courseMasterId = run.courseMasterId;

        // Find all schedules for this run
        const schedules = await this.prisma.teachingSchedule.findMany({
            where: { courseRunId },
            include: { courseRun: { include: { courseMaster: true } } },
        });

        if (schedules.length === 0) {
            // No schedules, delete future sessions for this run
            await this.prisma.liveSession.deleteMany({
                where: {
                    courseRunId,
                    status: 'scheduled',
                    scheduledAt: { gt: new Date() },
                },
            });
            return;
        }

        // Fetch all live lessons for sequential mapping from CourseMaster
        const liveLessons = await this.prisma.lesson.findMany({
            where: {
                module: { courseMasterId },
                contentType: 'live_session'
            },
            orderBy: [
                { module: { orderIndex: 'asc' } },
                { orderIndex: 'asc' }
            ]
        });

        // Delete all future scheduled sessions for this run to start fresh
        await this.prisma.liveSession.deleteMany({
            where: {
                courseRunId,
                status: 'scheduled',
                scheduledAt: { gt: new Date() },
            },
        });

        const futureSessions: any[] = [];
        const now = new Date();

        // Generate dates for the next X weeks
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() + (i * 7));

            // For each week, generate entries for each schedule
            const weekEntries: any[] = [];

            for (const schedule of schedules) {
                const [hours, minutes] = schedule.startTime.split(':').map(Number);
                const scheduledAt = new Date(weekStart);

                // Adjust to the specific day of the week
                const currentDay = scheduledAt.getDay();
                const daysUntil = (schedule.dayOfWeek - currentDay + 7) % 7;
                scheduledAt.setDate(scheduledAt.getDate() + daysUntil);
                scheduledAt.setHours(hours, minutes, 0, 0);

                // Only add if it's in the future
                if (scheduledAt > now) {
                    weekEntries.push({
                        scheduledAt: new Date(scheduledAt),
                        schedule,
                    });
                }
            }

            // Sort entries within the week by date and time
            weekEntries.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
            futureSessions.push(...weekEntries);
        }

        // Final sort of all generated sessions across weeks
        futureSessions.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

        // Map lessons to sessions sequentially
        const finalSessions: any[] = [];
        for (let i = 0; i < futureSessions.length; i++) {
            const { scheduledAt, schedule } = futureSessions[i];
            const lesson = liveLessons[i];

            finalSessions.push({
                courseRunId,
                lecturerId: schedule.lecturerId,
                scheduleId: schedule.id,
                moduleId: lesson?.moduleId || null,
                lessonId: lesson?.id || null,
                title: lesson
                    ? `${run.title} - ${lesson.title}`
                    : `${run.title} - Buổi học ${i + 1}`,
                scheduledAt,
                duration: schedule.duration,
                status: 'scheduled',
                meetingId: null,
            });
        }

        if (finalSessions.length > 0) {
            await this.prisma.liveSession.createMany({
                data: finalSessions,
            });

            // Update lessons to link back to the newly created live sessions
            const createdSessions = await this.prisma.liveSession.findMany({
                where: {
                    courseRunId,
                    status: 'scheduled',
                    scheduledAt: { gt: now }
                },
                orderBy: { scheduledAt: 'asc' }
            });

            for (const session of createdSessions) {
                if (session.lessonId) {
                    await this.prisma.lesson.update({
                        where: { id: session.lessonId },
                        data: { liveSessionId: session.id }
                    });
                }
            }
        }
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private isOverlapping(start1: number, end1: number, start2: number, end2: number): boolean {
        return start1 < end2 && start2 < end1;
    }

    private hasPermission(requester: Requester, permission: string): boolean {
        if (!requester.permissions) return false;
        return requester.permissions.includes('*') || requester.permissions.includes(permission);
    }
}

