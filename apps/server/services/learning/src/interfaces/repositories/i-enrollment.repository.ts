import type { Enrollment, Prisma } from '@prisma/generated';

/**
 * Enrollment Repository Interface
 * Defines the contract for all enrollment data access operations
 */
export interface IEnrollmentRepository {
  /**
   * Find enrollment by ID
   */
  findById(id: string): Promise<Enrollment | null>;

  /**
   * Find enrollment by user and course run
   */
  findByUserAndCourseRun(
    userId: string,
    courseRunId: string,
  ): Promise<Enrollment | null>;

  /**
   * Find any active enrollment by user and course master
   * Useful when courseRunId is unknown but we have courseMasterId
   */
  findByUserAndCourseMaster(
    userId: string,
    courseMasterId: string,
  ): Promise<Enrollment | null>;

  /**
   * Find all enrollments by user and course master
   */
  findAllByUserAndCourseMaster(
    userId: string,
    courseMasterId: string,
  ): Promise<Enrollment[]>;

  /**
   * Find all enrollments with pagination and filters
   */
  findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.EnrollmentWhereInput;
    orderBy?: Prisma.EnrollmentOrderByWithRelationInput;
    include?: Prisma.EnrollmentInclude;
  }): Promise<Enrollment[]>;

  /**
   * Count enrollments with optional filter
   */
  count(where?: Prisma.EnrollmentWhereInput): Promise<number>;

  /**
   * Create a new enrollment
   */
  create(data: Prisma.EnrollmentCreateInput): Promise<Enrollment>;

  /**
   * Update enrollment
   */
  update(id: string, data: Prisma.EnrollmentUpdateInput): Promise<Enrollment>;

  /**
   * Delete enrollment by ID
   */
  delete(id: string): Promise<void>;
}
