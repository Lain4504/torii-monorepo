import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from '@server/learning/modules/enrollment/enrollment.service';
import { EnrollmentRepository } from '@server/learning/modules/enrollment/enrollment.repository';
import { COURSE_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { CERTIFICATE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { EnrollmentStatus, CourseStatus } from '@workspace/schemas';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';

describe('EnrollmentService', () => {
    let service: EnrollmentService;
    let enrollmentRepository: any;
    let courseRepository: any;
    let certificateService: any;
    let natsClient: any;

    const mockEnrollmentRepository = {
        count: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findByUserAndCourse: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        countTotalLearningSeconds: jest.fn(),
    };

    const mockCourseRepository = {
        findById: jest.fn(),
    };

    const mockCertificateService = {
        issueCertificate: jest.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockNatsClient = {
        send: jest.fn(),
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnrollmentService,
                { provide: EnrollmentRepository, useValue: mockEnrollmentRepository },
                { provide: COURSE_REPOSITORY_TOKEN, useValue: mockCourseRepository },
                { provide: CERTIFICATE_SERVICE_TOKEN, useValue: mockCertificateService },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
            ],
        }).compile();

        service = module.get<EnrollmentService>(EnrollmentService);
        enrollmentRepository = module.get(EnrollmentRepository);
        courseRepository = module.get(COURSE_REPOSITORY_TOKEN);
        certificateService = module.get(CERTIFICATE_SERVICE_TOKEN);
        natsClient = module.get('NATS_SERVICE');

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getLearnerStats', () => {
        it('should calculate stats correctly using watched duration from repository', async () => {
            const userId = 'user-1';
            const mockEnrollments = {
                total: 2,
                data: [
                    { completionStatus: EnrollmentStatus.COMPLETED, completionPercentage: 100 },
                    { completionStatus: EnrollmentStatus.IN_PROGRESS, completionPercentage: 50 },
                ],
            };

            // 9000 seconds = 2.5 hours (total time watched across all lessons)
            mockEnrollmentRepository.countTotalLearningSeconds.mockResolvedValue(9000);

            // findAll is called internally
            jest.spyOn(service, 'findAll').mockResolvedValue(mockEnrollments as any);

            const result = await service.getLearnerStats(userId);

            expect(result.totalCourses).toBe(2);
            expect(result.completedCourses).toBe(1);
            expect(result.averageProgress).toBe(75);
            // totalLearningHours = 9000 / 3600 = 2.5
            expect(result.totalLearningHours).toBe(2.5);
            expect(enrollmentRepository.countTotalLearningSeconds).toHaveBeenCalledWith(userId);
        });

        it('should return zeros for a user with no enrollments and no time', async () => {
            jest.spyOn(service, 'findAll').mockResolvedValue({ total: 0, data: [], page: 1, limit: 10, totalPages: 0 });
            mockEnrollmentRepository.countTotalLearningSeconds.mockResolvedValue(0);

            const result = await service.getLearnerStats('user-2');

            expect(result.totalCourses).toBe(0);
            expect(result.averageProgress).toBe(0);
            expect(result.totalLearningHours).toBe(0);
        });
    });

    describe('findAll', () => {
        it('should return paginated enrollments', async () => {
            const query = { page: 1, limit: 10, userId: 'user-1' };
            const mockDate = new Date();
            mockEnrollmentRepository.count.mockResolvedValue(1);
            mockEnrollmentRepository.findMany.mockResolvedValue([{
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                enrollmentDate: mockDate,
                completionStatus: (EnrollmentStatus as any).IN_PROGRESS,
                completionPercentage: 0,
                finalPrice: 0,
                createdAt: mockDate,
                updatedAt: mockDate
            }]);

            const result = await service.findAll(query);

            expect(result.total).toBe(1);
            expect(result.data.length).toBe(1);
            expect(result.data[0].id).toBe('enr-1');
            expect(enrollmentRepository.count).toHaveBeenCalled();
            expect(enrollmentRepository.findMany).toHaveBeenCalled();
        });

        it('should handle errors and return empty response', async () => {
            mockEnrollmentRepository.count.mockRejectedValue(new Error('DB Error'));

            const result = await service.findAll({ userId: 'user-1', page: 1, limit: 10 });

            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
            expect(result.totalPages).toBe(0);
        });
    });

    describe('findOne', () => {
        const mockDate = new Date();
        it('should return enrollment if found', async () => {
            mockEnrollmentRepository.findById.mockResolvedValue({
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                enrollmentDate: mockDate,
                completionStatus: (EnrollmentStatus as any).IN_PROGRESS,
                completionPercentage: 0,
                finalPrice: 0,
                createdAt: mockDate,
                updatedAt: mockDate
            });
            const result = await service.findOne('enr-1');
            expect(result?.id).toBe('enr-1');
        });

        it('should return null if not found', async () => {
            mockEnrollmentRepository.findById.mockResolvedValue(null);
            const result = await service.findOne('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        const userId = 'user-1';
        const input = { courseId: 'course-1' };
        const mockDate = new Date();

        it('should create a PENDING_PAYMENT enrollment for paid course', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', price: 100, title: 'Paid Course', status: CourseStatus.PUBLISHED });
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
            mockEnrollmentRepository.create.mockResolvedValue({
                id: 'enr-1',
                userId,
                courseId: 'course-1',
                finalPrice: 100,
                enrollmentDate: mockDate,
                completionStatus: (EnrollmentStatus as any).PENDING_PAYMENT,
                completionPercentage: 0,
                createdAt: mockDate,
                updatedAt: mockDate
            });

            const result = await service.create(userId, input);

            expect(result.id).toBe('enr-1');
            expect(result.completionStatus).toBe(EnrollmentStatus.PENDING_PAYMENT);
            expect(enrollmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                completionStatus: (EnrollmentStatus as any).PENDING_PAYMENT
            }));
            // Should not emit course_enrollment_success for pending payment
            expect(natsClient.emit).not.toHaveBeenCalledWith({ cmd: 'course_enrollment_success' }, expect.any(Object));
        });

        it('should force PENDING_PAYMENT even if input status is IN_PROGRESS for paid course', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', price: 100, title: 'Paid Course', status: CourseStatus.PUBLISHED });
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
            mockEnrollmentRepository.create.mockResolvedValue({
                id: 'enr-1',
                userId,
                courseId: 'course-1',
                finalPrice: 100,
                enrollmentDate: mockDate,
                completionStatus: EnrollmentStatus.PENDING_PAYMENT, // Repository should return what strict logic dictated
                completionPercentage: 0,
                createdAt: mockDate,
                updatedAt: mockDate
            });

            const inputWithStatus = { ...input, status: EnrollmentStatus.IN_PROGRESS };
            const result = await service.create(userId, inputWithStatus);

            expect(result.completionStatus).toBe(EnrollmentStatus.PENDING_PAYMENT);
            expect(enrollmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                completionStatus: (EnrollmentStatus as any).PENDING_PAYMENT
            }));
        });

        it('should return existing PENDING_PAYMENT enrollment if exists', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', price: 100, status: CourseStatus.PUBLISHED });
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue({
                id: 'enr-pending',
                completionStatus: (EnrollmentStatus as any).PENDING_PAYMENT
            });

            const result = await service.create(userId, input);
            expect(result.id).toBe('enr-pending');
            // Should verify that create was NOT called again? Or it just returns.
            // In implementation: if (existing) return toDto(existing)
            expect(enrollmentRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException if courseId is missing', async () => {
            await expect(service.create(userId, {} as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if course does not exist', async () => {
            mockCourseRepository.findById.mockResolvedValue(null);
            await expect(service.create(userId, input)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if course is DRAFT', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', status: CourseStatus.DRAFT });
            await expect(service.create(userId, input)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if course is ARCHIVED', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', status: CourseStatus.ARCHIVED });
            await expect(service.create(userId, input)).rejects.toThrow(NotFoundException);
        });

        it('should default to 6-month expiration for VOD courses if expirationMonths is not set', async () => {
            const fixedDate = new Date('2024-01-01T00:00:00Z');
            jest.useFakeTimers().setSystemTime(fixedDate);

            mockCourseRepository.findById.mockResolvedValue({ 
                id: 'course-1', 
                type: 'vod', 
                price: 0, 
                status: (CourseStatus as any).PUBLISHED 
            });
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
            
            const expectedExpiry = new Date(fixedDate);
            expectedExpiry.setMonth(expectedExpiry.getMonth() + 6);

            mockEnrollmentRepository.create.mockResolvedValue({
                id: 'enr-vod',
                userId,
                courseId: 'course-1',
                expiresAt: expectedExpiry,
                completionStatus: (EnrollmentStatus as any).IN_PROGRESS
            });

            await service.create(userId, input);

            expect(enrollmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                expiresAt: expectedExpiry
            }));

            jest.useRealTimers();
        });

        it('should throw BadRequestException if already enrolled (ACTIVE)', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', status: CourseStatus.PUBLISHED });
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue({ id: 'existing', completionStatus: EnrollmentStatus.IN_PROGRESS });
            await expect(service.create(userId, input)).rejects.toThrow(BadRequestException);
        });

        it('should emit event for free course enrollment if finalPrice is 0', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', price: 0, title: 'Free Course', status: CourseStatus.PUBLISHED });
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
            mockEnrollmentRepository.create.mockResolvedValue({
                id: 'enr-1',
                userId,
                courseId: 'course-1',
                finalPrice: 0,
                enrollmentDate: mockDate,
                completionStatus: (EnrollmentStatus as any).IN_PROGRESS,
                completionPercentage: 0,
                createdAt: mockDate,
                updatedAt: mockDate
            });
            mockNatsClient.send.mockReturnValue(of({ user: { email: 'test@example.com', displayName: 'Test User' } }));

            await service.create(userId, input);

            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'course_enrollment_success' },
                expect.objectContaining({ userEmail: 'test@example.com', courseName: 'Free Course' })
            );
        });

        it('should calculate expiresAt for VOD course with expirationMonths', async () => {
            const vodCourse = { 
                id: 'course-1', 
                type: 'vod', 
                expirationMonths: 6, 
                price: 0, 
                status: CourseStatus.PUBLISHED 
            };
            mockCourseRepository.findById.mockResolvedValue(vodCourse);
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
            mockNatsClient.send.mockReturnValue(of({ user: { email: 'test@example.com' } }));
            mockEnrollmentRepository.create.mockImplementation((data) => Promise.resolve({ id: 'enr-1', ...data }));

            const result = await service.create(userId, input);

            expect((result as any).expiresAt).toBeDefined();
            const expectedExpiry = new Date();
            expectedExpiry.setMonth(expectedExpiry.getMonth() + 6);
            // Check if dates are close enough (within 5 seconds to be safe)
            expect(Math.abs(new Date((result as any).expiresAt).getTime() - expectedExpiry.getTime())).toBeLessThan(5000);
        });

        it('should throw BadRequestException for Live course past registration deadline', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            const liveCourse = { 
                id: 'course-1', 
                type: 'live', 
                registrationClosedAt: pastDate, 
                status: CourseStatus.PUBLISHED 
            };
            mockCourseRepository.findById.mockResolvedValue(liveCourse);
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

            await expect(service.create(userId, input)).rejects.toThrow(BadRequestException);
            await expect(service.create(userId, input)).rejects.toThrow('Registration for this course is closed');
        });

        it('should allow renewal of an EXPIRED enrollment', async () => {
            const expiredEnrollment = {
                id: 'enr-old',
                userId,
                courseId: 'course-1',
                completionStatus: EnrollmentStatus.EXPIRED as any,
                expiresAt: new Date(Date.now() - 1000)
            };
            const course = { id: 'course-1', price: 0, status: CourseStatus.PUBLISHED };
            
            mockCourseRepository.findById.mockResolvedValue(course);
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(expiredEnrollment);
            mockEnrollmentRepository.update.mockResolvedValue({ 
                id: 'enr-old', 
                completionStatus: 'in_progress',
                userId,
                courseId: 'course-1',
                enrollmentDate: new Date(),
                completionPercentage: 0,
                lastAccessedAt: new Date(),
                expiresAt: new Date(),
                finalPrice: 0
            });
            mockNatsClient.send.mockReturnValue(of({ user: { email: 'test@example.com' } }));

            const result = await service.create(userId, input);

            expect(result.id).toBe('enr-old'); // Should update existing
            expect(result.completionStatus).toBe('in_progress');
            expect(enrollmentRepository.update).toHaveBeenCalled();
            expect(enrollmentRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('activateEnrollment', () => {
        const mockDate = new Date();
        it('should activate a pending enrollment successfully', async () => {
            const pendingEnrollment = {
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                completionStatus: EnrollmentStatus.PENDING_PAYMENT,
                finalPrice: 100
            };
            const activeEnrollment = { ...pendingEnrollment, completionStatus: EnrollmentStatus.IN_PROGRESS };

            mockEnrollmentRepository.findById.mockResolvedValue(pendingEnrollment);
            mockEnrollmentRepository.update.mockResolvedValue(activeEnrollment);
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', title: 'Test Course' });
            mockNatsClient.send.mockReturnValue(of({ user: { email: 'test@example.com' } }));

            const result = await service.activateEnrollment('enr-1');

            expect(result.completionStatus).toBe((EnrollmentStatus as any).IN_PROGRESS);
            expect(enrollmentRepository.update).toHaveBeenCalledWith('enr-1', {
                completionStatus: EnrollmentStatus.IN_PROGRESS,
            });
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'course_enrollment_success' },
                expect.any(Object)
            );
        });

        it('should return existing enrollment if already active', async () => {
            const activeEnrollment = {
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                completionStatus: EnrollmentStatus.IN_PROGRESS,
                finalPrice: 100
            };
            mockEnrollmentRepository.findById.mockResolvedValue(activeEnrollment);

            const result = await service.activateEnrollment('enr-1');
            expect(result.completionStatus).toBe((EnrollmentStatus as any).IN_PROGRESS);
            expect(enrollmentRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if enrollment not found', async () => {
            mockEnrollmentRepository.findById.mockResolvedValue(null);
            await expect(service.activateEnrollment('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('isEnrolled', () => {
        it('should return true if user has IN_PROGRESS enrollment', async () => {
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue({ completionStatus: EnrollmentStatus.IN_PROGRESS });
            const result = await service.isEnrolled('u1', 'c1');
            expect(result).toBe(true);
        });

        it('should return true if enrollment is COMPLETED', async () => {
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue({ completionStatus: EnrollmentStatus.COMPLETED });
            expect(await service.isEnrolled('u1', 'c1')).toBe(true);
        });

        it('should return false if enrollment is not found', async () => {
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
            expect(await service.isEnrolled('u1', 'c1')).toBe(false);
        });

        it('should return false if enrollment has expired (real-time check)', async () => {
            const expiredDate = new Date(Date.now() - 1000);
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue({ 
                completionStatus: EnrollmentStatus.IN_PROGRESS as any,
                expiresAt: expiredDate
            });
            const result = await service.isEnrolled('u1', 'c1');
            expect(result).toBe(false);
        });
    });

    describe('updateProgress', () => {
        const mockDate = new Date();
        it('should update progress successfully', async () => {
            const enrollment = {
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                completionStatus: EnrollmentStatus.IN_PROGRESS,
                completionPercentage: 10,
                enrollmentDate: mockDate,
                createdAt: mockDate,
                updatedAt: mockDate,
                finalPrice: 0
            };
            mockEnrollmentRepository.findById.mockResolvedValue(enrollment);
            mockEnrollmentRepository.update.mockResolvedValue({ ...enrollment, completionPercentage: 50 });

            const result = await service.updateProgress('enr-1', 50);

            expect(result.completionPercentage).toBe(50);
            expect(enrollmentRepository.update).toHaveBeenCalledWith('enr-1', expect.objectContaining({ completionPercentage: 50 }));
        });

        it('should complete enrollment and issue certificate when progress reaches 100%', async () => {
            const enrollment = {
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                completionStatus: EnrollmentStatus.IN_PROGRESS,
                completionPercentage: 90,
                enrollmentDate: mockDate,
                createdAt: mockDate,
                updatedAt: mockDate,
                finalPrice: 0
            };
            mockEnrollmentRepository.findById.mockResolvedValue(enrollment);
            mockEnrollmentRepository.update.mockResolvedValue({ ...enrollment, completionPercentage: 100 });

            const result = await service.updateProgress('enr-1', 100);

            expect(enrollmentRepository.update).toHaveBeenCalledWith('enr-1', expect.objectContaining({ completionStatus: EnrollmentStatus.COMPLETED }));
            expect(certificateService.issueCertificate).toHaveBeenCalledWith('user-1', 'course-1', 'enr-1');
            expect(result.completionStatus).toBe(EnrollmentStatus.COMPLETED);
            expect(result.completionPercentage).toBe(100);
        });

        it('should throw BadRequestException for invalid percentage', async () => {
            await expect(service.updateProgress('enr-1', -1)).rejects.toThrow(BadRequestException);
            await expect(service.updateProgress('enr-1', 101)).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateOrderId', () => {
        it('should update order ID successfully', async () => {
            const enrollment = { id: 'enr-1', userId: 'u1', courseId: 'c1' };
            mockEnrollmentRepository.update.mockResolvedValue({ ...enrollment, orderId: 'ord-1' });

            const result = await service.updateOrderId('enr-1', 'ord-1');

            expect(enrollmentRepository.update).toHaveBeenCalledWith('enr-1', {
                order: { connect: { id: 'ord-1' } }
            });
            expect(result.id).toBe('enr-1');
        });
    });

    describe('deleteByUserAndCourse', () => {
        it('should delete enrollment and log audit', async () => {
            const enrollment = {
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                completionStatus: (EnrollmentStatus as any).IN_PROGRESS
            };
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(enrollment);
            mockEnrollmentRepository.delete.mockResolvedValue(undefined);

            const result = await service.deleteByUserAndCourse('user-1', 'course-1');

            expect(result.id).toBe('enr-1');
            expect(enrollmentRepository.delete).toHaveBeenCalledWith('enr-1');
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'identity.audit.log' },
                expect.objectContaining({ action: 'enrollment.delete', entityId: 'enr-1' })
            );
        });

        it('should throw NotFoundException if enrollment not found', async () => {
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
            await expect(service.deleteByUserAndCourse('user-1', 'course-1')).rejects.toThrow(NotFoundException);
        });
    });
});
