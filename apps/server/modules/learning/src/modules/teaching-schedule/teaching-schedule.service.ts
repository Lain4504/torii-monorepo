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
import { ICourseService } from '@server/learning/interfaces/services/i-course.service';
import { COURSE_SERVICE_TOKEN } from '@server/learning/interfaces/services';

@Injectable()
export class TeachingScheduleService implements ITeachingScheduleService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(COURSE_SERVICE_TOKEN)
        private readonly courseService: ICourseService,
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
                course: {
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
                courseTitle: c.course.title,
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

        // Validate course readiness for scheduling
        const validation = await this.courseService.validateForScheduling(dto.courseId);
        if (!validation.isReady) {
            throw new ConflictException(validation.message || 'Khóa học chưa sẵn sàng để gán lịch');
        }

        const schedule = await this.prisma.teachingSchedule.create({
            data: {
                courseId: dto.courseId,
                lecturerId: dto.lecturerId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                duration: dto.duration,
            },
            include: {
                course: true,
                lecturer: true,
            },
        });

        // Generate live sessions for the next 8 weeks
        await this.generateLiveSessions(schedule.id, 8);

        return this.mapper.map<any, TeachingScheduleResponseDTO>(schedule, 'TeachingSchedule', 'TeachingScheduleResponseDTO');
    }

    async findByCourse(courseId: string): Promise<TeachingScheduleResponseDTO[]> {
        const schedules = await this.prisma.teachingSchedule.findMany({
            where: { courseId },
            include: { lecturer: true, course: true },
        });
        return schedules.map(s => this.mapper.map<any, TeachingScheduleResponseDTO>(s, 'TeachingSchedule', 'TeachingScheduleResponseDTO'));
    }

    async findByLecturer(lecturerId: string): Promise<TeachingScheduleResponseDTO[]> {
        const schedules = await this.prisma.teachingSchedule.findMany({
            where: { lecturerId },
            include: { lecturer: true, course: true },
        });
        return schedules.map(s => this.mapper.map<any, TeachingScheduleResponseDTO>(s, 'TeachingSchedule', 'TeachingScheduleResponseDTO'));
    }

    async removeSchedule(requester: Requester, id: string): Promise<void> {
        if (!this.hasPermission(requester, 'live_class.schedule')) {
            throw new ForbiddenException('Only authorized staff can remove teaching schedules');
        }

        const schedule = await this.prisma.teachingSchedule.findUnique({ where: { id } });
        if (!schedule) throw new NotFoundException('Schedule not found');

        // Delete future scheduled sessions that haven't started
        await this.prisma.liveSession.deleteMany({
            where: {
                scheduleId: id,
                status: 'scheduled',
                scheduledAt: { gt: new Date() },
            },
        });

        await this.prisma.teachingSchedule.delete({ where: { id } });
    }

    async createRequest(requester: Requester, dto: ScheduleRequestCreateDTO): Promise<ScheduleRequestResponseDTO> {
        // Any approved lecturer can create a request, but typically it should be for their own schedule
        // For simplicity, we'll just record who requested it.

        const request = await this.prisma.liveSessionScheduleRequest.create({
            data: {
                lecturerId: requester.sub,
                originalScheduleId: dto.originalScheduleId,
                courseId: dto.courseId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                duration: dto.duration,
                reason: dto.reason,
                status: 'pending',
            },
            include: {
                lecturer: true,
                course: true,
            },
        });

        return this.mapper.map<any, ScheduleRequestResponseDTO>(request, 'LiveSessionScheduleRequest', 'ScheduleRequestResponseDTO');
    }

    async getPendingRequests(requester: Requester): Promise<ScheduleRequestResponseDTO[]> {
        const where: any = { status: 'pending' };
        if (requester.role === 'lecturer') {
            where.lecturerId = requester.sub;
        }

        const requests = await this.prisma.liveSessionScheduleRequest.findMany({
            where,
            include: { lecturer: true, course: true },
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

            // Validate course readiness for scheduling
            const validation = await this.courseService.validateForScheduling(request.courseId);
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
                // Regenerate sessions
                await this.prisma.liveSession.deleteMany({
                    where: {
                        scheduleId: request.originalScheduleId,
                        status: 'scheduled',
                        scheduledAt: { gt: new Date() },
                    },
                });
                await this.generateLiveSessions(request.originalScheduleId, 8);
            } else {
                // Create new schedule
                const schedule = await this.prisma.teachingSchedule.create({
                    data: {
                        courseId: request.courseId,
                        lecturerId: request.lecturerId,
                        dayOfWeek: request.dayOfWeek,
                        startTime: request.startTime,
                        duration: request.duration,
                    },
                });
                await this.generateLiveSessions(schedule.id, 8);
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

    private async generateLiveSessions(scheduleId: string, weeks: number) {
        const schedule = await this.prisma.teachingSchedule.findUnique({
            where: { id: scheduleId },
            include: { course: true },
        });
        if (!schedule) return;

        // Fetch live lessons for sequential mapping
        const liveLessons = await this.prisma.lesson.findMany({
            where: {
                module: { courseId: schedule.courseId },
                contentType: 'live_session'
            },
            orderBy: [
                { module: { orderIndex: 'asc' } },
                { orderIndex: 'asc' }
            ]
        });

        const sessions: any[] = [];
        const [hours, minutes] = schedule.startTime.split(':').map(Number);

        let currentDate = new Date();
        // Adjust start date to next occurrence of dayOfWeek
        const currentDay = currentDate.getDay();
        const daysUntil = (schedule.dayOfWeek - currentDay + 7) % 7;
        currentDate.setDate(currentDate.getDate() + daysUntil);
        currentDate.setHours(hours, minutes, 0, 0);

        for (let i = 0; i < weeks; i++) {
            const scheduledAt = new Date(currentDate);
            scheduledAt.setDate(scheduledAt.getDate() + (i * 7));

            const lesson = liveLessons[i];

            sessions.push({
                courseId: schedule.courseId,
                lecturerId: schedule.lecturerId,
                scheduleId: schedule.id,
                moduleId: lesson?.moduleId || null,
                lessonId: lesson?.id || null,
                title: lesson
                    ? `${schedule.course.title} - ${lesson.title}`
                    : `${schedule.course.title} - Buổi học ${i + 1}`,
                scheduledAt,
                duration: schedule.duration,
                status: 'scheduled',
                meetingId: null,
            });
        }

        await this.prisma.liveSession.createMany({
            data: sessions,
        });

        // Update lessons to link back to the newly created live sessions
        // We do this after createMany to get IDs if needed, but since we have session objects, 
        // we actually need the IDs from the database after insertion.
        // prisma.liveSession.createMany doesn't return created items with IDs in many DBs (except PG with supported Prisma version).
        // Since we are likely using PG, let's just do it individually or batch if we can.

        const createdSessions = await this.prisma.liveSession.findMany({
            where: { scheduleId: schedule.id, status: 'scheduled' },
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

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private isOverlapping(start1: number, end1: number, start2: number, end2: number): boolean {
        return start1 < end2 && start2 < end1;
    }

    private hasPermission(requester: Requester, permission: string): boolean {
        return requester.role === 'admin' || requester.role === 'staff' || requester.role === 'lecturer';
    }
}

