import { z } from 'zod';

// Basic DTOs for Cart operations
export const cartAddDTO = z.object({
  courseId: z.string().uuid('Invalid Course ID'),
});
export type CartAddDTO = z.infer<typeof cartAddDTO>;

export const cartRemoveDTO = z.object({
  courseId: z.string().uuid('Invalid Course ID'),
});
export type CartRemoveDTO = z.infer<typeof cartRemoveDTO>;

export const cartResponseItemSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  addedAt: z.date(),
  course: z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    thumbnailUrl: z.string().nullable().optional(),
    price: z.number().nonnegative(),
    discountPrice: z.number().nonnegative().nullable().optional(),
    instructor: z.string().optional(), // Placeholder, needs actual instructor info
  })
});
export type CartResponseItem = z.infer<typeof cartResponseItemSchema>;

export const cartResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(cartResponseItemSchema),
  total: z.number().nonnegative(),
  count: z.number().int().min(0),
});
export type CartResponse = z.infer<typeof cartResponseSchema>;
