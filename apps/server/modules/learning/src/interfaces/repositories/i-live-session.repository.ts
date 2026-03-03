import type { LiveSession, Prisma } from '@prisma/generated';

/**
 * Live Session Repository Interface
 * Defines the contract for Live Session data access operations
 */
export interface ILiveSessionRepository {
    /**
     * Find live session by ID
     */
    findById(id: string): Promise<LiveSession | null>;

    /**
     * Find all live sessions for a course run
     */
    findByRunId(courseRunId: string): Promise<LiveSession[]>;

    /**
     * Find scheduled sessions for a lecturer
     */
    findByLecturerId(lecturerId: string): Promise<LiveSession[]>;

    /**
     * Create live session
     */
    create(data: Prisma.LiveSessionCreateInput): Promise<LiveSession>;

    /**
     * Update live session
     */
    update(id: string, data: Prisma.LiveSessionUpdateInput): Promise<LiveSession>;

    /**
     * Delete live session
     */
    delete(id: string): Promise<void>;

    /**
     * Find all sessions in a time range
     */
    findInRange(start: Date, end: Date): Promise<LiveSession[]>;
}
