import { z } from 'zod';

export const academyCohortCreateDTOSchema = z.object({
  courseProfileId: z.string().uuid(),
  code: z.string().min(1).max(150),
  name: z.string().min(1).max(255),
  price: z.coerce.number().min(0),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'OPENING', 'ONGOING', 'COMPLETED', 'ARCHIVED']).optional(),
  enrollmentOpenAt: z.coerce.date().optional(),
  enrollmentCloseAt: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  rejectionReason: z.string().optional().nullable(),
});
export type AcademyCohortCreateDTO = z.infer<typeof academyCohortCreateDTOSchema>;

export const academyCohortUpdateDTOSchema = academyCohortCreateDTOSchema.partial();
export type AcademyCohortUpdateDTO = z.infer<typeof academyCohortUpdateDTOSchema>;

export const academyCohortQueryDTOSchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
});
export type AcademyCohortQueryDTO = z.infer<typeof academyCohortQueryDTOSchema>;
