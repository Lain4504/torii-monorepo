import type { Attendance, Prisma } from '@prisma/generated';

/**
 * Attendance Repository Interface
 */
export interface IAttendanceRepository {
    /**
     * Create attendance record
     */
    create(data: Prisma.AttendanceCreateInput): Promise<Attendance>;

    /**
     * Find attendance by ID
     */
    findById(id: string): Promise<Attendance | null>;

    /**
     * Find attendance by Live Session and User
     */
    findBySessionAndUser(liveSessionId: string, userId: string): Promise<Attendance | null>;

    /**
     * Update attendance
     */
    update(id: string, data: Prisma.AttendanceUpdateInput): Promise<Attendance>;

    /**
     * Find many attendances with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.AttendanceWhereInput;
        orderBy?: Prisma.AttendanceOrderByWithRelationInput;
        include?: Prisma.AttendanceInclude;
    }): Promise<Attendance[]>;

    /**
     * Count attendances
     */
    count(where?: Prisma.AttendanceWhereInput): Promise<number>;

    /**
     * Delete attendance
     */
    delete(id: string): Promise<void>;
}
