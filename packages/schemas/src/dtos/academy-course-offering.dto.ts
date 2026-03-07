import { z } from 'zod';

export const academyCourseOfferingCreateDTOSchema = z.object({
  code: z.string().min(1).max(150),
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  type: z.string().max(20).optional(),
  originalPrice: z.number().min(0),
  currency: z.string().min(1).max(10),
  status: z.string().max(20).optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
  metadata: z.unknown().optional(),
  classIds: z.array(z.string().uuid()).optional(),
  courseProfileId: z.string().uuid().optional(),
  courseEditionId: z.string().uuid().optional(),
});
export type AcademyCourseOfferingCreateDTO = z.infer<
  typeof academyCourseOfferingCreateDTOSchema
>;

export const academyCourseOfferingUpdateDTOSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  type: z.string().max(20).optional(),
  originalPrice: z.number().min(0).optional(),
  currency: z.string().max(10).optional(),
  status: z.string().max(20).optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
  metadata: z.unknown().optional(),
  classIds: z.array(z.string().uuid()).optional(),
});
export type AcademyCourseOfferingUpdateDTO = z.infer<
  typeof academyCourseOfferingUpdateDTOSchema
>;

export const academyCourseOfferingQueryDTOSchema = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
});
export type AcademyCourseOfferingQueryDTO = z.infer<
  typeof academyCourseOfferingQueryDTOSchema
>;

export const academyCourseOfferingSetClassesDTOSchema = z.object({
  offeringId: z.string().uuid(),
  classIds: z.array(z.string().uuid()),
});
export type AcademyCourseOfferingSetClassesDTO = z.infer<
  typeof academyCourseOfferingSetClassesDTOSchema
>;

