import { z } from 'zod';

export const academyVodPackageCreateDTOSchema = z.object({
  courseProfileId: z.string().uuid(),
  code: z.string().min(1).max(150),
  title: z.string().min(1).max(255),
  price: z.coerce.number().min(0),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED']).optional(),
  rejectionReason: z.string().optional().nullable(),
});
export type AcademyVodPackageCreateDTO = z.infer<typeof academyVodPackageCreateDTOSchema>;

export const academyVodPackageUpdateDTOSchema = academyVodPackageCreateDTOSchema.partial();
export type AcademyVodPackageUpdateDTO = z.infer<typeof academyVodPackageUpdateDTOSchema>;

export const academyVodPackageQueryDTOSchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
});
export type AcademyVodPackageQueryDTO = z.infer<typeof academyVodPackageQueryDTOSchema>;
