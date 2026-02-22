/**
 * Unit Tests: Learning Module Controllers (Gateway)
 *
 * Representative test for CourseController showing:
 *  - Permission-based logic (admin vs instructor)
 *  - NATS command mapping
 *  - Success/Error response wrapping
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { HttpStatus } from '@nestjs/common';
import { CourseController } from '../../src/modules/learning/controllers/course.controller';
import { GatewayAuthGuard, PermissionsGuard } from '@server/shared';

// ---------------------------------------------------------------------------
// Mock Helpers
// ---------------------------------------------------------------------------

function createNatsMock() {
  return {
    send: jest.fn(),
  };
}

function createReqMock(overrides: any = {}) {
  return {
    requester: { sub: 'user-123', permissions: ['course.create'], ...overrides },
    ...overrides,
  } as any;
}

// ---------------------------------------------------------------------------
// CourseController Tests
// ---------------------------------------------------------------------------

describe('CourseController (Gateway)', () => {
  let controller: CourseController;
  let natsMock: ReturnType<typeof createNatsMock>;

  beforeEach(async () => {
    natsMock = createNatsMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        { provide: 'NATS_SERVICE', useValue: natsMock },
      ],
    })
      .overrideGuard(GatewayAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CourseController>(CourseController);
  });

  afterEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/courses (createCourse)
  // ─────────────────────────────────────────────────────────────────────────
  describe('createCourse()', () => {
    it('should forward request to NATS with instructorId and permissions', async () => {
      const dto = { title: 'New Course', description: 'desc' };
      const fakeResult = { id: 'c1', ...dto };
      natsMock.send.mockReturnValue(of(fakeResult));
      
      const req = createReqMock({ sub: 'instr-789', permissions: ['course.create'] });

      const result = await controller.createCourse(dto, req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'learning.course.create' },
        expect.objectContaining({ 
          instructorId: 'instr-789',
          userPermissions: ['course.create']
        })
      );
      expect(result).toMatchObject({ success: true, data: { course: fakeResult } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/courses (getCourses) — complex query logic
  // ─────────────────────────────────────────────────────────────────────────
  describe('getCourses()', () => {
    it('should limit to self as instructor if user has "course.instructor" but not "course.view_restricted"', async () => {
      const fakeResult = { items: [], meta: {} };
      natsMock.send.mockReturnValue(of(fakeResult));
      const req = createReqMock({ sub: 'instr-1', permissions: ['course.instructor'] });
      const query = { page: 1 };

      const result = await controller.getCourses(query, req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'learning.course.findAll' },
        expect.objectContaining({ instructorId: 'instr-1' })
      );
      expect(result).toMatchObject({ success: true, ...fakeResult });
    });

    it('should see everything if user has "*" permission', async () => {
      const fakeResult = { items: [], meta: {} };
      natsMock.send.mockReturnValue(of(fakeResult));
      const req = createReqMock({ sub: 'admin-1', permissions: ['*'] });
      const query = { page: 1 };

      const result = await controller.getCourses(query, req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'learning.course.findAll' },
        expect.not.objectContaining({ instructorId: 'admin-1' })
      );
      expect(result).toMatchObject({ success: true, ...fakeResult });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/courses/slug/:slug
  // ─────────────────────────────────────────────────────────────────────────
  describe('getCourseBySlug()', () => {
    it('should return course found by slug', async () => {
      const fakeCourse = { id: 'c1', slug: 'my-course' };
      natsMock.send.mockReturnValue(of(fakeCourse));
      const req = createReqMock();

      const result = await controller.getCourseBySlug('my-course', req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'learning.course.findBySlug' },
        { slug: 'my-course', userId: 'user-123' }
      );
      expect(result).toMatchObject({ success: true, data: { course: fakeCourse } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /api/courses/:id
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteCourse()', () => {
    it('should return success after deletion', async () => {
      natsMock.send.mockReturnValue(of(null));
      const req = createReqMock();

      const result = await controller.deleteCourse('c1', req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'learning.course.delete' },
        expect.objectContaining({ id: 'c1', userId: 'user-123' })
      );
      expect(result).toMatchObject({ success: true, message: 'Course deleted successfully' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Error Handling (catch)
  // ─────────────────────────────────────────────────────────────────────────
  describe('checkEnrollmentStatus() error path', () => {
    it('should return isEnrolled: false when NATS call fails', async () => {
      natsMock.send.mockReturnValue(throwError(() => new Error('Service broken')));
      const req = createReqMock();

      const result = await controller.checkEnrollmentStatus('c1', req);

      expect(result.data).toMatchObject({ isEnrolled: false });
    });
  });
});
