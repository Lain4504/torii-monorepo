import type { CourseRun, Prisma } from '@prisma/generated';

export interface ICourseRunRepository {
    findById(id: string): Promise<CourseRun | null>;
    findBySlug(slug: string): Promise<CourseRun | null>;
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CourseRunWhereInput;
        orderBy?: Prisma.CourseRunOrderByWithRelationInput;
        include?: Prisma.CourseRunInclude;
    }): Promise<CourseRun[]>;
    count(where?: Prisma.CourseRunWhereInput): Promise<number>;
    create(data: Prisma.CourseRunCreateInput): Promise<CourseRun>;
    update(id: string, data: Prisma.CourseRunUpdateInput): Promise<CourseRun>;
    delete(id: string): Promise<void>;
    slugExists(slug: string, excludeId?: string): Promise<boolean>;
}
